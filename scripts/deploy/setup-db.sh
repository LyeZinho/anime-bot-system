#!/bin/bash
set -e

echo "🗄️ Setting up database..."

# Wait for postgres to be ready
echo "⏳ Waiting for PostgreSQL..."
until docker-compose exec -T postgres pg_isready -U waifu > /dev/null 2>&1; do
    sleep 2
done
echo "✅ PostgreSQL is ready"

# Push schema
echo "📤 Pushing database schema..."
docker-compose exec -T api npx drizzle-kit push

# Seed data
echo "🌱 Seeding categories..."
docker-compose exec -T api pnpm db:seed:categories

echo "📚 Seeding works..."
docker-compose exec -T api pnpm db:seed:works

echo "👤 Seeding characters..."
docker-compose exec -T api pnpm db:seed:characters

echo "🎉 Database setup complete!"
