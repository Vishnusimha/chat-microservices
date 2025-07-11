#!/bin/bash

# Combined JavaDoc Generation Script
# This script creates a unified JavaDoc documentation for all microservices

echo "🚀 Creating combined JavaDoc documentation..."
echo "=============================================="

BASE_DIR="/Users/vishnusimhadussa/Documents/GitHub/Intellij-workspace/chat-microservices"
OUTPUT_DIR="$BASE_DIR/docs/combined-javadoc"

# Create output directory
mkdir -p "$OUTPUT_DIR"

# Create main index.html
cat > "$OUTPUT_DIR/index.html" << 'EOF'
<!DOCTYPE html>
<html>
<head>
    <title>Chat Microservices - JavaDoc Documentation</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; background-color: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        h1 { color: #2c3e50; border-bottom: 3px solid #3498db; padding-bottom: 10px; }
        h2 { color: #34495e; margin-top: 30px; }
        .service-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; margin-top: 20px; }
        .service-card { background: #f8f9fa; padding: 20px; border-radius: 8px; border-left: 4px solid #3498db; }
        .service-card h3 { margin: 0 0 10px 0; color: #2c3e50; }
        .service-card p { margin: 10px 0; color: #7f8c8d; }
        .service-card a { color: #3498db; text-decoration: none; font-weight: bold; }
        .service-card a:hover { text-decoration: underline; }
        .architecture { background: #ecf0f1; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .status { display: inline-block; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold; }
        .status.running { background: #d4edda; color: #155724; }
        .footer { margin-top: 40px; text-align: center; color: #7f8c8d; font-size: 14px; }
    </style>
</head>
<body>
    <div class="container">
        <h1>📚 Chat Microservices - JavaDoc Documentation</h1>
        
        <div class="architecture">
            <h2>🏗️ Architecture Overview</h2>
            <p>This is a Spring Cloud-based microservices architecture for a chat/social media application with JWT authentication, service discovery, and API Gateway routing.</p>
        </div>

        <h2>🔧 Microservices Documentation</h2>
        <div class="service-grid">
            <div class="service-card">
                <h3>🗂️ Discovery Server</h3>
                <p><span class="status running">Port 8761</span></p>
                <p>Eureka server for service discovery and registration</p>
                <a href="discoveryserver/index.html">View Documentation →</a>
            </div>

            <div class="service-card">
                <h3>🚪 API Gateway</h3>
                <p><span class="status running">Port 8765</span></p>
                <p>Single entry point, JWT validation, and routing</p>
                <a href="api-gateway/index.html">View Documentation →</a>
            </div>

            <div class="service-card">
                <h3>👥 Users Service</h3>
                <p><span class="status running">Port 8081</span></p>
                <p>User management, authentication, and JWT generation</p>
                <a href="users/index.html">View Documentation →</a>
            </div>

            <div class="service-card">
                <h3>📰 Feed Service</h3>
                <p><span class="status running">Port 8080</span></p>
                <p>Aggregates user and post data for personalized feeds</p>
                <a href="feed/index.html">View Documentation →</a>
            </div>

            <div class="service-card">
                <h3>💬 Discussion Service</h3>
                <p><span class="status running">Port 8083</span></p>
                <p>Posts and comments management with CRUD operations</p>
                <a href="discussion/index.html">View Documentation →</a>
            </div>
        </div>

        <h2>🚀 Quick Start</h2>
        <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p><strong>To regenerate documentation:</strong></p>
            <code>./generate-javadocs.sh</code>
        </div>

        <div class="footer">
            <p>Generated on $(date)</p>
            <p>Chat Microservices Architecture - Spring Cloud & Spring Boot</p>
        </div>
    </div>
</body>
</html>
EOF

# Copy individual JavaDoc directories
services=("users" "feed" "discussion" "api-gateway" "discoveryserver")

for service in "${services[@]}"; do
    if [ -d "$BASE_DIR/$service/build/docs/javadoc" ]; then
        echo "📂 Copying JavaDoc for $service..."
        cp -r "$BASE_DIR/$service/build/docs/javadoc" "$OUTPUT_DIR/$service"
    fi
done

echo "✅ Combined JavaDoc documentation created!"
echo "📁 Location: $OUTPUT_DIR"
echo "🌐 Open: file://$OUTPUT_DIR/index.html"

# Optional: Start a simple HTTP server
read -p "🚀 Would you like to start a local HTTP server to view the docs? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🌐 Starting HTTP server at http://localhost:8000"
    cd "$BASE_DIR"
    python3 -m http.server 8000
fi
