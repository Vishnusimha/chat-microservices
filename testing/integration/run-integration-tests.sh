#!/bin/bash

# Integration Test Suite for Chat Microservices
# This script runs comprehensive integration tests

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}Starting Chat Microservices Integration Test Suite${NC}"

# Configuration
DOCKER_COMPOSE_FILE="docker-compose.test.yml"
WAIT_TIME=60
MAX_RETRIES=30

# Function to wait for service to be ready
wait_for_service() {
    local service_name=$1
    local url=$2
    local max_retries=$3
    
    echo -e "${YELLOW}Waiting for $service_name to be ready...${NC}"
    
    for i in $(seq 1 $max_retries); do
        if curl -f -s "$url" > /dev/null 2>&1; then
            echo -e "${GREEN}$service_name is ready!${NC}"
            return 0
        fi
        echo "Attempt $i/$max_retries failed, retrying in 2 seconds..."
        sleep 2
    done
    
    echo -e "${RED}$service_name failed to start within $((max_retries * 2)) seconds${NC}"
    return 1
}

# Function to run API tests
run_api_tests() {
    echo -e "${YELLOW}Running API tests with Newman...${NC}"
    
    docker-compose -f $DOCKER_COMPOSE_FILE --profile api-tests up newman
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}API tests passed!${NC}"
    else
        echo -e "${RED}API tests failed!${NC}"
        return 1
    fi
}

# Function to run performance tests
run_performance_tests() {
    echo -e "${YELLOW}Running performance tests with K6...${NC}"
    
    docker-compose -f $DOCKER_COMPOSE_FILE --profile performance-tests up k6
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}Performance tests passed!${NC}"
    else
        echo -e "${RED}Performance tests failed!${NC}"
        return 1
    fi
}

# Function to run integration tests
run_integration_tests() {
    echo -e "${YELLOW}Running integration tests...${NC}"
    
    # Test user registration
    echo "Testing user registration..."
    REGISTER_RESPONSE=$(curl -s -X POST "http://localhost:8766/auth/register" \
        -H "Content-Type: application/json" \
        -d '{
            "userName": "testuser",
            "email": "test@example.com",
            "password": "testpassword123",
            "profileName": "Test User"
        }' \
        -w "%{http_code}")
    
    if [[ $REGISTER_RESPONSE == *"201"* ]]; then
        echo -e "${GREEN}User registration test passed${NC}"
    else
        echo -e "${RED}User registration test failed: $REGISTER_RESPONSE${NC}"
        return 1
    fi
    
    # Test user login
    echo "Testing user login..."
    LOGIN_RESPONSE=$(curl -s -X POST "http://localhost:8766/auth/login" \
        -H "Content-Type: application/json" \
        -d '{
            "email": "test@example.com",
            "password": "testpassword123"
        }')
    
    if [[ $LOGIN_RESPONSE == *"token"* ]]; then
        echo -e "${GREEN}User login test passed${NC}"
        TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.token')
    else
        echo -e "${RED}User login test failed: $LOGIN_RESPONSE${NC}"
        return 1
    fi
    
    # Test getting users
    echo "Testing get users..."
    USERS_RESPONSE=$(curl -s -X GET "http://localhost:8766/api/users/all" \
        -H "Authorization: Bearer $TOKEN" \
        -w "%{http_code}")
    
    if [[ $USERS_RESPONSE == *"200"* ]]; then
        echo -e "${GREEN}Get users test passed${NC}"
    else
        echo -e "${RED}Get users test failed: $USERS_RESPONSE${NC}"
        return 1
    fi
    
    # Test creating a post
    echo "Testing create post..."
    POST_RESPONSE=$(curl -s -X POST "http://localhost:8766/discussion/api/posts/create" \
        -H "Authorization: Bearer $TOKEN" \
        -H "Content-Type: application/json" \
        -d '{
            "content": "Test post from integration test",
            "userId": 1
        }' \
        -w "%{http_code}")
    
    if [[ $POST_RESPONSE == *"201"* ]]; then
        echo -e "${GREEN}Create post test passed${NC}"
    else
        echo -e "${RED}Create post test failed: $POST_RESPONSE${NC}"
        return 1
    fi
    
    # Test getting feed
    echo "Testing get feed..."
    FEED_RESPONSE=$(curl -s -X GET "http://localhost:8766/feed/all" \
        -H "Authorization: Bearer $TOKEN" \
        -w "%{http_code}")
    
    if [[ $FEED_RESPONSE == *"200"* ]]; then
        echo -e "${GREEN}Get feed test passed${NC}"
    else
        echo -e "${RED}Get feed test failed: $FEED_RESPONSE${NC}"
        return 1
    fi
    
    echo -e "${GREEN}All integration tests passed!${NC}"
}

# Function to cleanup
cleanup() {
    echo -e "${YELLOW}Cleaning up test environment...${NC}"
    docker-compose -f $DOCKER_COMPOSE_FILE down -v
    docker system prune -f
}

# Main execution
main() {
    # Set trap for cleanup
    trap cleanup EXIT
    
    # Start test environment
    echo -e "${YELLOW}Starting test environment...${NC}"
    docker-compose -f $DOCKER_COMPOSE_FILE up -d
    
    # Wait for services to be ready
    wait_for_service "Discovery Server" "http://localhost:8762/actuator/health" $MAX_RETRIES
    wait_for_service "Users Service" "http://localhost:8082/actuator/health" $MAX_RETRIES
    wait_for_service "API Gateway" "http://localhost:8766/actuator/health" $MAX_RETRIES
    
    # Run tests
    run_integration_tests
    
    # Optionally run API tests if Newman collection exists
    if [ -f "./postman/chat-microservices.postman_collection.json" ]; then
        run_api_tests
    fi
    
    # Optionally run performance tests
    if [ "$1" == "--performance" ]; then
        run_performance_tests
    fi
    
    echo -e "${GREEN}All tests completed successfully!${NC}"
}

# Check if docker-compose is available
if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}docker-compose is not installed${NC}"
    exit 1
fi

# Check if jq is available
if ! command -v jq &> /dev/null; then
    echo -e "${RED}jq is not installed${NC}"
    exit 1
fi

# Run main function
main "$@"