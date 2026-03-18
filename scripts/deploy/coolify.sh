#!/bin/bash
set -e

# Coolify deployment script
# Usage: Run this script as the startup command in Coolify

echo "🚀 Coolify deployment starting..."

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    pnpm install --frozen-lockfile
fi

# Build all apps
echo "🔨 Building applications..."
pnpm build

# Start services based on COOLIFY_SERVICE_TYPE
SERVICE_TYPE=${COOLIFY_SERVICE_TYPE:-all}

case $SERVICE_TYPE in
    api)
        echo "🌐 Starting API..."
        node apps/api/dist/main.js
        ;;
    bot)
        echo "🤖 Starting Bot..."
        node apps/bot/dist/index.js
        ;;
    dashboard)
        echo "📊 Starting Dashboard..."
        node build
        ;;
    all)
        echo "🌀 Starting all services..."
        # Run API and Dashboard with concurrent
        node apps/api/dist/main.js &
        node build &
        wait
        ;;
    *)
        echo "❌ Unknown service type: $SERVICE_TYPE"
        echo "Valid types: api, bot, dashboard, all"
        exit 1
        ;;
esac
