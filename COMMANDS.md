# 📚 Guia de Comandos - Anime Bot System

## 🎲 Comandos de Roll

### `/roll` ou `!roll`
Role um personagem aleatório da API CharLib.
- **Cooldown:** 3 segundos
- **Sistema de Raridade:**
  - ⚪ Comum (60%)
  - 🟢 Incomum (25%)
  - 🔵 Raro (10%)
  - 🟣 Épico (4%)
  - 🟡 Lendário (1%)

## 📦 Comandos de Coleção

### `/collection [pagina]` ou `!collection [pagina]`
Visualize sua coleção de personagens.
- Mostra 10 personagens por página
- Navegação com botões

### `/profile [@usuario]` ou `!profile`
Veja seu perfil ou de outro usuário.
- Moedas na carteira
- Moedas no banco
- Streak de daily
- Rating de batalha
- Tamanho da coleção

### `/character <nome>`
Busca informações detalhadas sobre um personagem.
- Autocomplete ao digitar
- Mostra estatísticas de coleta
- Botão para adicionar à wishlist

## 💰 Comandos de Economia

### `/daily` ou `!daily`
Recompensa diária de moedas.
- Base: 1000 moedas
- Bônus de streak: +10% por dia consecutivo
- Cooldown: 24 horas

### `/work [tipo]`
Trabalhe para ganhar moedas.
- 🎮 **Stream** - 50-150 moedas (30min)
- 📝 **Freelance** - 80-200 moedas (1h)
- 🏢 **Escritório** - 150-350 moedas (2h)
- 💼 **Empresa** - 300-600 moedas (4h)
- 🎯 **Missão** - 500-1000 moedas (8h)

### `/gift <@usuario> <quantidade>`
Presenteie moedas para outro usuário.
- Taxa de 5% sobre o valor
- Mínimo: 1 moeda

### `/deposit <quantidade>`
Deposite moedas no banco.
- Use `0` para depositar tudo
- Banco é seguro de roubos (futuro)

### `/withdraw <quantidade>`
Saque moedas do banco.
- Use `0` para sacar tudo

## 🏆 Comandos de Ranking

### `/leaderboard [tipo]` ou `!top [tipo]`
Veja os rankings do servidor.
- **Tipos disponíveis:**
  - `coins` - Maior quantidade de moedas
  - `collection` - Maior coleção
  - `battle` - Maior rating de batalha

## ❤️ Comandos de Wishlist

### `/wishlist view [@usuario]`
Visualize sua wishlist ou de outro usuário.
- Máximo: 25 personagens

### `/wishlist add <personagem>`
Adicione um personagem à wishlist.
- Autocomplete ao digitar

### `/wishlist remove <personagem>`
Remova um personagem da wishlist.
- Autocomplete com seus personagens

### `/wishlist clear`
Limpe toda sua wishlist.
- Confirmação necessária

## ⚔️ Comandos de Batalha (TCG)

### `/battle challenge <@oponente>`
Desafie outro jogador para uma batalha.
- Requer no mínimo 5 personagens
- Sistema ELO de rating
- Batalha automática

### `/battle stats [@usuario]`
Veja estatísticas de batalha.
- Rating atual
- Vitórias/Derrotas
- Taxa de vitória

### `/battle ranking`
Ranking de batalhas.
- Top 10 jogadores por rating

### `/battle deck`
Veja seu deck de batalha.
- Mostra seus 5 personagens mais fortes
- Stats baseados na raridade

## 🔄 Comandos de Troca

### `/trade offer <@usuario>`
Inicie uma proposta de troca.
- Selecione personagens para trocar
- Aguarde aceitação do outro usuário

### `/trade pending`
Lista suas trocas pendentes.
- Enviadas e recebidas

### `/trade history`
Histórico de trocas.
- Últimas 10 trocas realizadas

## 🏪 Comandos de Loja

### `/shop view`
Visualize a loja de items.
- Reset de Rolls - 500 moedas
- Reset de Claims - 1000 moedas
- Slot de Wishlist - 2000 moedas
- Ticket da Sorte - 100 moedas
- XP Boost - 1500 moedas

### `/shop buy <item> [quantidade]`
Compre um item da loja.

### `/shop inventory`
Visualize seu inventário de items.

## 🎰 Minigames

### `/lucky <aposta>`
Jogo da sorte - aposte moedas.
- Min: 10 moedas | Max: 10.000 moedas
- **Prêmios:**
  - 🎰 Jackpot (1%) - 10x
  - 💎 Grande Vitória (5%) - 3x
  - ✨ Vitória (20%) - 1.5x
  - 🍀 Pequena Vitória (20%) - 1.2x
  - 💨 Perda (54%) - 0x

## ℹ️ Comandos de Informação

### `/help` ou `!help`
Lista todos os comandos disponíveis.

---

## 📊 Sistema de Cooldowns

- **Rolls:** 11 rolls por hora (1 roll a cada ~5min)
- **Claims:** 3 claims por dia
- **Daily:** 1 vez a cada 24 horas
- **Work:** Varia de 30min a 8h dependendo do tipo
- **Comandos:** Cooldown individual de 3-10 segundos

## 💡 Dicas

1. **Maximize seu daily:** Colete todos os dias para aumentar o streak!
2. **Use a wishlist:** Personagens da wishlist têm maior chance de aparecer
3. **Trabalhe regularmente:** O work é uma ótima fonte de renda
4. **Batalhe estrategicamente:** Rating alto = recompensas melhores
5. **Guarde no banco:** Proteja suas moedas de futuros eventos de roubo

---

## 🔧 Comandos Administrativos (em breve)

- `/settings prefix <prefixo>` - Alterar prefixo do servidor
- `/settings autospawn <on|off>` - Auto spawn de personagens
- `/settings channels <#canal>` - Canais para spawn
