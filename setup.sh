#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Anime Bot System - Setup${NC}\n"

# Check if .env exists
if [ ! -f .env ]; then
    echo -e "${YELLOW}⚠️  Arquivo .env não encontrado. Copiando de .env.example...${NC}"
    cp .env.example .env
    echo -e "${RED}❗ Por favor, edite o arquivo .env com suas credenciais do Discord!${NC}"
    echo -e "${RED}   DISCORD_TOKEN=seu_token_aqui${NC}"
    echo -e "${RED}   DISCORD_CLIENT_ID=seu_client_id_aqui${NC}"
    echo -e "${RED}   DISCORD_GUILD_ID=seu_guild_id_aqui${NC}\n"
    exit 1
fi

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}❌ Docker não está rodando. Por favor, inicie o Docker primeiro.${NC}"
    exit 1
fi

echo -e "${GREEN}📦 Instalando dependências...${NC}"
npm install

echo -e "\n${GREEN}🐳 Iniciando containers Docker...${NC}"
docker-compose up -d postgres redis

echo -e "\n${GREEN}⏳ Aguardando PostgreSQL ficar pronto...${NC}"
sleep 5

echo -e "\n${GREEN}🔧 Gerando Prisma Client...${NC}"
npm run db:generate

echo -e "\n${GREEN}🗄️  Executando migrações do banco...${NC}"
npm run db:push

echo -e "\n${GREEN}🏗️  Compilando TypeScript...${NC}"
npm run build

echo -e "\n${GREEN}✅ Setup completo!${NC}"
echo -e "\n${YELLOW}📝 Próximos passos:${NC}"
echo -e "   1. Certifique-se de que o arquivo .env está configurado corretamente"
echo -e "   2. Execute: ${GREEN}npm run dev${NC} para desenvolvimento"
echo -e "   3. Ou execute: ${GREEN}npm start${NC} para produção"
echo -e "   4. Ou execute: ${GREEN}docker-compose up -d${NC} para rodar tudo no Docker\n"
echo -e "${GREEN}🎉 Bot pronto para uso!${NC}\n"
