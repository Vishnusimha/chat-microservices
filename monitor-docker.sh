#!/bin/bash

# Monitor Chat Microservices Docker containers

echo "📊 Chat Microservices Monitoring Dashboard"
echo "=========================================="

# Function to check service health
check_health() {
    local service_name=$1
    local url=$2
    local response=$(curl -s -o /dev/null -w "%{http_code}" $url 2>/dev/null)
    
    if [ "$response" == "200" ]; then
        echo "✅ $service_name: Healthy"
    else
        echo "❌ $service_name: Unhealthy (HTTP $response)"
    fi
}

# Function to show docker stats
show_stats() {
    echo ""
    echo "🐳 Container Status:"
    docker compose ps
    
    echo ""
    echo "💾 Resource Usage:"
    docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}\t{{.BlockIO}}"
}

# Function to show service health
show_health() {
    echo ""
    echo "🏥 Service Health Checks:"
    check_health "Discovery Server" "http://localhost:8761/actuator/health"
    check_health "API Gateway" "http://localhost:8765/actuator/health"
    check_health "Users Service" "http://localhost:8081/actuator/health"
    check_health "Discussion Service" "http://localhost:8083/actuator/health"
    check_health "Feed Service" "http://localhost:8080/actuator/health"
}

# Function to show service URLs
show_urls() {
    echo ""
    echo "🌐 Service URLs:"
    echo "  - Eureka Dashboard: http://localhost:8761"
    echo "  - API Gateway: http://localhost:8765"
    echo "  - Users Service: http://localhost:8081"
    echo "  - Discussion Service: http://localhost:8083"
    echo "  - Feed Service: http://localhost:8080"
    echo "  - MySQL: localhost:3306"
    
    echo ""
    echo "🔍 Health Check URLs:"
    echo "  - Discovery Server: http://localhost:8761/actuator/health"
    echo "  - API Gateway: http://localhost:8765/actuator/health"
    echo "  - Users Service: http://localhost:8081/actuator/health"
    echo "  - Discussion Service: http://localhost:8083/actuator/health"
    echo "  - Feed Service: http://localhost:8080/actuator/health"
}

# Function to show logs
show_logs() {
    echo ""
    echo "📝 Recent Logs (last 10 lines per service):"
    echo ""
    
    services=("mysql" "discovery-server" "users-service" "discussion-service" "feed-service" "api-gateway")
    
    for service in "${services[@]}"; do
        echo "--- $service ---"
        docker compose logs --tail=5 $service 2>/dev/null || echo "Service not running"
        echo ""
    done
}

# Main execution
main() {
    case "$1" in
        "stats"|"s")
            show_stats
            ;;
        "health"|"h")
            show_health
            ;;
        "urls"|"u")
            show_urls
            ;;
        "logs"|"l")
            show_logs
            ;;
        "all"|"")
            show_stats
            show_health
            show_urls
            ;;
        "watch"|"w")
            # Continuous monitoring
            while true; do
                clear
                echo "📊 Chat Microservices Live Monitoring (Ctrl+C to exit)"
                echo "======================================================="
                show_stats
                show_health
                sleep 10
            done
            ;;
        *)
            echo "Usage: $0 [stats|health|urls|logs|all|watch]"
            echo ""
            echo "Commands:"
            echo "  stats  (s) - Show container status and resource usage"
            echo "  health (h) - Show service health checks"
            echo "  urls   (u) - Show service URLs"
            echo "  logs   (l) - Show recent logs"
            echo "  all        - Show stats, health, and URLs (default)"
            echo "  watch  (w) - Continuous monitoring"
            ;;
    esac
}

# Run main function with all arguments
main "$@"
