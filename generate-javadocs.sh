#!/bin/bash

# JavaDoc Generation Script for Chat Microservices
# This script generates JavaDoc documentation for all microservices

echo "🚀 Generating JavaDoc for all microservices..."
echo "=============================================="

# Define the base directory
BASE_DIR="/Users/vishnusimhadussa/Documents/GitHub/Intellij-workspace/chat-microservices"

# Array of microservices
services=("users" "feed" "discussion" "api-gateway" "discoveryserver")

# Function to generate JavaDoc for a service
generate_javadoc() {
    local service=$1
    echo "📚 Generating JavaDoc for $service service..."
    
    cd "$BASE_DIR/$service"
    
    if [ -f "./gradlew" ]; then
        ./gradlew javadoc
        if [ $? -eq 0 ]; then
            echo "✅ JavaDoc generated successfully for $service"
            echo "📁 Location: $BASE_DIR/$service/build/docs/javadoc/"
        else
            echo "❌ Failed to generate JavaDoc for $service"
        fi
    else
        echo "⚠️  No gradlew found for $service"
    fi
    
    echo ""
}

# Generate JavaDoc for all services
for service in "${services[@]}"; do
    if [ -d "$BASE_DIR/$service" ]; then
        generate_javadoc "$service"
    else
        echo "⚠️  Service directory not found: $service"
        echo ""
    fi
done

echo "🎉 JavaDoc generation completed!"
echo ""
echo "📖 You can view the documentation by opening the following files in your browser:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

for service in "${services[@]}"; do
    if [ -d "$BASE_DIR/$service/build/docs/javadoc" ]; then
        echo "🔗 $service: file://$BASE_DIR/$service/build/docs/javadoc/index.html"
    fi
done

echo ""
echo "💡 Pro tip: You can also serve them on a local HTTP server:"
echo "   cd $BASE_DIR"
echo "   python3 -m http.server 8000"
echo "   Then visit: http://localhost:8000/{service}/build/docs/javadoc/"
