#!/bin/bash
set -e

echo "🔄 Updating deployment..."

git pull origin main

docker-compose down
docker-compose up -d --build

echo "⏳ Waiting for services..."
sleep 15

echo "📊 Service status:"
docker-compose ps

echo "🎉 Update complete!"
