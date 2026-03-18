#!/bin/bash
set -e

echo "🚀 Starting deployment..."

# Check if .env exists
if [ ! -f .env ]; then
    echo "❌ .env file not found!"
    echo "Please copy .env.example to .env and configure it"
    exit 1
fi

# Load environment variables
source .env

# Validate required variables
required_vars=(
    "POSTGRES_PASSWORD"
    "JWT_SECRET"
    "DISCORD_BOT_TOKEN"
    "DISCORD_CLIENT_ID"
    "DISCORD_CLIENT_SECRET"
    "DOMAIN"
    "TRAEFIK_API_HOST"
    "TRAEFIK_DASHBOARD_HOST"
)

for var in "${required_vars[@]}"; do
    if [ -z "${!var}" ]; then
        echo "❌ $var is not set in .env"
        exit 1
    fi
done

echo "✅ Environment variables validated"

# Build and start services
echo "🔨 Building and starting services..."
docker-compose up -d --build

echo "⏳ Waiting for services to be healthy..."
sleep 10

# Check service status
echo "📊 Service status:"
docker-compose ps

echo ""
echo "🎉 Deployment complete!"
echo ""
echo "📝 Next steps:"
echo "   1. Set up your database: docker-compose exec api pnpm db:push"
echo "   2. Seed categories: docker-compose exec api pnpm db:seed:categories"
echo "   3. Seed works: docker-compose exec api pnpm db:seed:works"
echo "   4. Seed characters: docker-compose exec api pnpm db:seed:characters"
