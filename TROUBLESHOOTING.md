# 🔧 Troubleshooting - Anime Bot System

## 🐛 Problemas Comuns e Soluções

### ❌ Bot não inicia

#### Erro: "Invalid token"
**Problema:** Token do Discord inválido ou não configurado.

**Solução:**
```bash
# Verifique o .env
cat .env | grep DISCORD_TOKEN

# O token deve ter este formato:
# DISCORD_TOKEN=
```

Se não tiver token válido:
1. Acesse https://discord.com/developers/applications
2. Selecione sua aplicação
3. Vá em "Bot" → "Reset Token"
4. Copie e cole no `.env`

#### Erro: "Cannot connect to database"
**Problema:** PostgreSQL não está rodando ou credenciais incorretas.

**Solução:**
```bash
# Verifique se o Docker está rodando
docker ps

# Se o container postgres não estiver na lista:
docker-compose up -d postgres

# Verifique os logs
docker-compose logs postgres

# Teste a conexão
docker exec -it anime-bot-db psql -U animebot -d animebot -c "SELECT 1;"
```

#### Erro: "Redis connection failed"
**Problema:** Redis não está rodando.

**Solução:**
```bash
# Inicie o Redis
docker-compose up -d redis

# Verifique
docker-compose logs redis

# Teste
docker exec -it anime-bot-redis redis-cli PING
# Deve retornar: PONG
```

### ❌ Comandos não aparecem no Discord

#### Problema: Slash commands não aparecem
**Solução:**
```bash
# Re-deploy dos comandos
npm run dev
# O bot fará deploy automático ao iniciar

# Ou force o re-deploy deletando e criando novamente
# No código, adicione esta linha temporária em DiscordBot.ts:
# await rest.put(Routes.applicationCommands(clientId), { body: [] });
```

#### Problema: Comandos aparecem mas não funcionam
**Causa comum:** Falta de permissões.

**Solução:**
Verifique se o bot tem as permissões necessárias:
- Read Messages
- Send Messages
- Embed Links
- Attach Files
- Add Reactions
- Use External Emojis

### ❌ Erros de TypeScript

#### Erro: "Cannot find module"
**Solução:**
```bash
# Reinstale as dependências
rm -rf node_modules package-lock.json
npm install

# Regenere o Prisma Client
npm run db:generate
```

#### Erro: "Type errors" durante compilação
**Solução:**
```bash
# Limpe e recompile
rm -rf dist
npm run build

# Se persistir, verifique o tsconfig.json
npx tsc --noEmit
```

### ❌ Erros de Prisma

#### Erro: "Prisma Client not generated"
**Solução:**
```bash
npm run db:generate
```

#### Erro: "Migration failed"
**Solução:**
```bash
# Reset o banco (ATENÇÃO: deleta todos os dados)
npm run db:push -- --force-reset

# Ou crie uma nova migration
npx prisma migrate dev --name fix
```

#### Erro: "Connection pool timeout"
**Problema:** Muitas conexões abertas.

**Solução:**
```typescript
// Em src/database/prisma.ts, adicione:
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
  log: ['error'],
  // Adicione estas configurações:
  // @ts-ignore
  __internal: {
    engine: {
      connection_limit: 10,
    },
  },
});
```

### ❌ Erros de Performance

#### Problema: Bot lento para responder
**Causas comuns:**
1. Cache do Redis não funcionando
2. Queries sem índices
3. Muitos dados carregados

**Soluções:**
```bash
# 1. Verifique o Redis
docker-compose logs redis

# 2. Adicione índices no schema.prisma
# @@index([campo])

# 3. Use paginação e limites
# .take(10) nas queries
```

#### Problema: Alto uso de memória
**Solução:**
```bash
# Limite a memória do Node.js
NODE_OPTIONS="--max-old-space-size=512" npm start

# Ou no Docker, adicione no docker-compose.yml:
# deploy:
#   resources:
#     limits:
#       memory: 512M
```

### ❌ Erros de API (CharLib)

#### Erro: "API request failed"
**Causas:**
1. CharLib API offline
2. Rate limit atingido
3. Timeout de conexão

**Soluções:**
```typescript
// 1. Adicione retry logic em CharacterService:
async fetchWithRetry(url: string, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await axios.get(url, { timeout: 10000 });
      return response.data;
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
}

// 2. Aumente o cache TTL em constants.ts:
const CACHE_TTL = 600; // 10 minutos
```

### ❌ Erros no Docker

#### Problema: Container não inicia
**Solução:**
```bash
# Veja os logs
docker-compose logs bot

# Reconstrua a imagem
docker-compose build --no-cache bot
docker-compose up -d
```

#### Problema: "Port already in use"
**Solução:**
```bash
# Encontre o processo usando a porta
sudo lsof -i :11999
# ou
netstat -tulpn | grep 11999

# Mate o processo
kill -9 <PID>

# Ou mude a porta no docker-compose.yml:
# ports:
#   - "12000:5432"  # Use porta 12000 no host
```

### ❌ Erros de Permissões

#### Problema: "Missing Permissions"
**Solução:**
```bash
# Gere um novo link de convite com todas as permissões
# Permissions necessárias (número: 534723950656):
# - Read Messages/View Channels
# - Send Messages
# - Send Messages in Threads
# - Embed Links
# - Attach Files
# - Add Reactions
# - Use External Emojis
# - Use Slash Commands

# URL do convite:
# https://discord.com/api/oauth2/authorize?client_id=SEU_CLIENT_ID&permissions=534723950656&scope=bot%20applications.commands
```

## 🔍 Debug Mode

### Ativar logs detalhados

```bash
# No .env, adicione:
NODE_ENV=development
DEBUG=*

# Ou para logs específicos do Prisma:
# No src/database/prisma.ts:
const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});
```

### Testar comandos específicos

```typescript
// Em src/index.ts, adicione antes do bot.start():
if (process.env.TEST_MODE === 'true') {
  // Teste específico aqui
  const userService = new UserService();
  const result = await userService.checkRolls('123456789');
  console.log('Test result:', result);
  process.exit(0);
}
```

## 📊 Monitoramento

### Verificar saúde do sistema

```bash
# Status dos containers
docker-compose ps

# Uso de recursos
docker stats

# Logs em tempo real
docker-compose logs -f bot

# Conexões do banco
docker exec anime-bot-db psql -U animebot -d animebot -c "SELECT count(*) FROM pg_stat_activity;"

# Cache do Redis
docker exec anime-bot-redis redis-cli INFO stats
```

### Backup do banco

```bash
# Backup
docker exec anime-bot-db pg_dump -U animebot animebot > backup_$(date +%Y%m%d).sql

# Restore
docker exec -i anime-bot-db psql -U animebot animebot < backup_20241230.sql
```

## 🆘 Último Recurso: Reset Completo

```bash
# ⚠️ ATENÇÃO: Isto deleta TODOS os dados!

# 1. Pare tudo
docker-compose down -v

# 2. Limpe tudo
rm -rf node_modules dist
rm -rf data/postgres data/redis

# 3. Reinstale
./setup.sh

# 4. Reconfigure o .env
nano .env

# 5. Inicie
docker-compose up -d
npm run dev
```

## 📞 Suporte

Se o problema persistir:

1. **Verifique os logs:**
   ```bash
   docker-compose logs --tail=100 bot
   ```

2. **Teste a API do CharLib:**
   ```bash
   curl https://charlib.vercel.app/api/characters/random?limit=1
   ```

3. **Verifique a versão do Node:**
   ```bash
   node --version  # Deve ser 18+
   ```

4. **Verifique a versão do Docker:**
   ```bash
   docker --version  # Deve ser 20+
   ```

## 💡 Dicas de Prevenção

1. **Sempre use .env:** Nunca commite credenciais
2. **Faça backups:** Especialmente antes de updates
3. **Monitore recursos:** Use `docker stats`
4. **Mantenha atualizado:** `npm update` regularmente
5. **Teste em dev:** Use `npm run dev` antes de prod
6. **Use logs:** Adicione logs em pontos críticos
7. **Valide inputs:** Sempre valide dados do usuário

---

## 🎯 Checklist de Diagnóstico

- [ ] `.env` configurado corretamente
- [ ] Docker rodando (`docker ps`)
- [ ] PostgreSQL acessível (porta 11999)
- [ ] Redis acessível (porta 11998)
- [ ] Token do Discord válido
- [ ] Permissões do bot corretas
- [ ] Prisma Client gerado (`npm run db:generate`)
- [ ] Migrações aplicadas (`npm run db:push`)
- [ ] Projeto compilado (`npm run build`)
- [ ] CharLib API acessível (teste com curl)
- [ ] Node.js versão 18+ (`node --version`)
- [ ] Dependências instaladas (`npm install`)
