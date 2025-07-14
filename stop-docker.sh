#!/bin/bash

# Stop Chat Microservices Docker containers

echo "🛑 Stopping Chat Microservices..."

# Stop all services
docker compose down

# If --clean flag is provided, also remove volumes and images
if [[ "$1" == "--clean" || "$1" == "-c" ]]; then
    echo "🧹 Cleaning up volumes and images..."
    docker compose down --volumes --remove-orphans
    docker system prune -f
    echo "✅ Cleanup completed"
fi

echo "✅ All services stopped!"
