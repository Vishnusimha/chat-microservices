#!/bin/bash

# Build and Run Chat Microservices with Docker

echo "🚀 Building and running Chat Microservices with Docker..."

# Function to check if Docker is running
check_docker() {
    if ! docker info >/dev/null 2>&1; then
        echo "❌ Docker is not running. Please start Docker and try again."
        exit 1
    fi
    echo "✅ Docker is running"
}

# Function to cleanup existing containers and images
cleanup() {
    echo "🧹 Cleaning up existing containers and images..."
    docker compose down --remove-orphans
    docker system prune -f
    echo "✅ Cleanup completed"
}

# Function to build and start services
build_and_start() {
    echo "🔨 Building and starting services..."
    
    # Build and start services with dependency order
    docker compose up --build -d mysql
    echo "⏳ Waiting for MySQL to be ready..."
    
    # Wait for MySQL to be healthy
    while ! docker compose exec mysql mysql -uapp_user -papp_password -e "SELECT 1" >/dev/null 2>&1; do
        echo "  Waiting for MySQL connection..."
        sleep 5
    done
    echo "✅ MySQL is ready!"
    
    docker compose up --build -d discovery-server
    echo "⏳ Waiting for Discovery Server to be ready..."
    
    # Wait for Discovery Server to be healthy
    while ! curl -f http://localhost:8761/actuator/health >/dev/null 2>&1; do
        echo "  Waiting for Discovery Server..."
        sleep 5
    done
    echo "✅ Discovery Server is ready!"
    
    docker compose up --build -d users-service discussion-service
    echo "⏳ Waiting for Users and Discussion services to be ready..."
    
    # Wait for services to be healthy
    while ! curl -f http://localhost:8081/actuator/health >/dev/null 2>&1 || \
          ! curl -f http://localhost:8083/actuator/health >/dev/null 2>&1; do
        echo "  Waiting for Users and Discussion services..."
        sleep 5
    done
    echo "✅ Users and Discussion services are ready!"
    
    docker compose up --build -d feed-service
    echo "⏳ Waiting for Feed service to be ready..."
    
    # Wait for Feed service to be healthy
    while ! curl -f http://localhost:8080/actuator/health >/dev/null 2>&1; do
        echo "  Waiting for Feed service..."
        sleep 5
    done
    echo "✅ Feed service is ready!"
    
    docker compose up --build -d api-gateway
    echo "⏳ Waiting for API Gateway to be ready..."
    
    # Wait for API Gateway to be healthy
    while ! curl -f http://localhost:8765/actuator/health >/dev/null 2>&1; do
        echo "  Waiting for API Gateway..."
        sleep 5
    done
    echo "✅ API Gateway is ready!"
    
    echo "✅ All services started!"
}

# Function to show service status
show_status() {
    echo "📊 Service Status:"
    docker compose ps
    
    echo ""
    echo "🌐 Service URLs:"
    echo "  - Eureka Dashboard: http://localhost:8761"
    echo "  - API Gateway: http://localhost:8765"
    echo "  - Users Service: http://localhost:8081"
    echo "  - Discussion Service: http://localhost:8083"
    echo "  - Feed Service: http://localhost:8080"
    echo "  - MySQL: localhost:3306"
    
    echo ""
    echo "🔍 Health Checks:"
    echo "  - Discovery Server: http://localhost:8761/actuator/health"
    echo "  - API Gateway: http://localhost:8765/actuator/health"
    echo "  - Users Service: http://localhost:8081/actuator/health"
    echo "  - Discussion Service: http://localhost:8083/actuator/health"
    echo "  - Feed Service: http://localhost:8080/actuator/health"
}

# Function to test services
test_services() {
    echo "🧪 Testing services..."
    
    echo "Testing Discovery Server..."
    curl -s http://localhost:8761/actuator/health | grep -q "UP" && echo "✅ Discovery Server is healthy" || echo "❌ Discovery Server is not healthy"
    
    echo "Testing API Gateway..."
    curl -s http://localhost:8765/actuator/health | grep -q "UP" && echo "✅ API Gateway is healthy" || echo "❌ API Gateway is not healthy"
    
    echo "Testing Users Service..."
    curl -s http://localhost:8081/actuator/health | grep -q "UP" && echo "✅ Users Service is healthy" || echo "❌ Users Service is not healthy"
    
    echo "Testing Discussion Service..."
    curl -s http://localhost:8083/actuator/health | grep -q "UP" && echo "✅ Discussion Service is healthy" || echo "❌ Discussion Service is not healthy"
    
    echo "Testing Feed Service..."
    curl -s http://localhost:8080/actuator/health | grep -q "UP" && echo "✅ Feed Service is healthy" || echo "❌ Feed Service is not healthy"
}

# Main execution
main() {
    echo "🎯 Chat Microservices Docker Setup"
    echo "=================================="
    
    # Check if cleanup is requested
    if [[ "$1" == "--clean" || "$1" == "-c" ]]; then
        cleanup
    fi
    
    check_docker
    build_and_start
    show_status
    
    # Wait a bit for services to fully start
    echo "⏳ Waiting for services to fully initialize..."
    sleep 30
    
    test_services
    
    echo ""
    echo "🎉 Chat Microservices are now running!"
    echo "📝 Use 'docker compose logs [service-name]' to view logs"
    echo "🛑 Use 'docker compose down' to stop all services"
}

# Run main function with all arguments
main "$@"
