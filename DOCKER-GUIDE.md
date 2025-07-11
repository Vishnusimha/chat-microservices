# Chat Microservices Docker Setup Guide

This guide provides comprehensive instructions for running the Chat Microservices application using Docker and Docker Compose.

## 📋 Prerequisites

- **Docker Desktop** (4.0 or later) - [Download Here](https://www.docker.com/products/docker-desktop)
- **Docker Compose** (2.0 or later) - Usually included with Docker Desktop
- **Git** - For cloning the repository
- **Minimum 4GB RAM** - Recommended for running all services
- **Available Ports**: 3306, 8080, 8081, 8083, 8761, 8765

## 🏗️ Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   MySQL DB      │    │ Discovery Server│    │   API Gateway   │
│   Port: 3306    │    │   Port: 8761    │    │   Port: 8765    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                              │                        │
                              │                        │
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  Users Service  │    │Discussion Service│   │  Feed Service   │
│   Port: 8081    │    │   Port: 8083    │    │   Port: 8080    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🚀 Quick Start

### 1. Clone and Navigate to Project
```bash
git clone <your-repo-url>
cd chat-microservices
```

### 2. Start All Services
```bash
./run-docker.sh
```

### 3. Verify Services
```bash
./monitor-docker.sh health
```

## 📁 Docker Files Structure

```
chat-microservices/
├── docker-compose.yml          # Main orchestration file
├── run-docker.sh              # Build and start script
├── stop-docker.sh             # Stop services script
├── monitor-docker.sh          # Monitoring script
├── mysql-init/               # MySQL initialization scripts
│   └── 01-init.sql
├── discoveryserver/
│   ├── Dockerfile
│   ├── .dockerignore
│   └── src/main/resources/
│       └── application-docker.properties
├── api-gateway/
│   ├── Dockerfile
│   ├── .dockerignore
│   └── src/main/resources/
│       └── application-docker.properties
├── users/
│   ├── Dockerfile
│   ├── .dockerignore
│   └── src/main/resources/
│       └── application-docker.properties
├── discussion/
│   ├── Dockerfile
│   ├── .dockerignore
│   └── src/main/resources/
│       └── application-docker.properties
└── feed/
    ├── Dockerfile
    ├── .dockerignore
    └── src/main/resources/
        └── application-docker.properties
```

## 🛠️ Quick Management Commands

### Essential Docker Commands

```bash
# Stop all services
docker compose down

# View logs for specific service
docker compose logs [service-name]
docker compose logs users-service        # Example

# Restart services (without rebuilding)
docker compose restart
docker compose restart users-service     # Restart specific service

# Rebuild and start services
docker compose up --build
docker compose up --build users-service  # Rebuild specific service

# View real-time logs
docker compose logs -f [service-name]

# Check service status
docker compose ps
```

## 🛠️ Detailed Commands

### Build and Run Services

#### Option 1: Quick Start (Recommended)
```bash
./run-docker.sh
```

#### Option 2: Step by Step
```bash
# Clean previous containers (optional)
./run-docker.sh --clean

# Or manually with docker-compose
docker compose up --build -d
```

### Monitor Services

#### Check All Services Status
```bash
./monitor-docker.sh
```

#### Specific Monitoring Options
```bash
./monitor-docker.sh stats    # Container stats and resource usage
./monitor-docker.sh health   # Health check status
./monitor-docker.sh urls     # Service URLs
./monitor-docker.sh logs     # Recent logs
./monitor-docker.sh watch    # Continuous monitoring
```

### Stop Services

#### Stop All Services
```bash
./stop-docker.sh
```

#### Stop and Clean Everything
```bash
./stop-docker.sh --clean
```

#### Manual Docker Compose Commands

```bash
docker compose down                    # Stop services
docker compose down --volumes         # Stop and remove volumes
docker compose down --remove-orphans  # Stop and remove orphaned containers
```

## 🌐 Service URLs

Once all services are running, you can access:

| Service                | URL                   | Description                                    |
| ---------------------- | --------------------- | ---------------------------------------------- |
| **Eureka Dashboard**   | http://localhost:8761 | Service discovery dashboard                    |
| **API Gateway**        | http://localhost:8765 | Main entry point for API calls                 |
| **Users Service**      | http://localhost:8081 | User management service                        |
| **Discussion Service** | http://localhost:8083 | Posts and comments service                     |
| **Feed Service**       | http://localhost:8080 | Aggregated feed service                        |
| **MySQL Database**     | localhost:3306        | Database (username: root, password: MySQL@123) |

### Health Check URLs

| Service            | Health Check URL                      |
| ------------------ | ------------------------------------- |
| Discovery Server   | http://localhost:8761/actuator/health |
| API Gateway        | http://localhost:8765/actuator/health |
| Users Service      | http://localhost:8081/actuator/health |
| Discussion Service | http://localhost:8083/actuator/health |
| Feed Service       | http://localhost:8080/actuator/health |

## 🧪 Testing the Setup

### 1. Quick Health Check
```bash
./monitor-docker.sh health
```

### 2. Test API Endpoints

#### Get JWT Token
```bash
curl -X POST http://localhost:8765/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "john.doe@example.com", "password": "yourPassword123"}'
```

#### Test Feed Service
```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  http://localhost:8765/feed/all
```

#### Create a Post
```bash
curl -X POST http://localhost:8765/discussion/api/posts/create \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"content": "Hello from Docker!", "userId": 1}'
```

## 🔧 Configuration Details

### Environment Variables

The Docker setup uses environment-specific configuration files:
- `application-docker.properties` for each service
- Environment variables set in `docker-compose.yml`

### Key Docker Configurations

1. **Service Discovery**: All services register with Eureka using container names
2. **Database**: MySQL container with persistent volume
3. **Networking**: All services run on a custom bridge network
4. **Health Checks**: Each service has built-in health monitoring
5. **Dependencies**: Services start in the correct order using health checks

### MySQL Configuration

- **Database**: `test`
- **Username**: `root`
- **Password**: `MySQL@123`
- **Port**: `3306`
- **Volume**: `mysql_data` (persistent storage)

## 🐛 Troubleshooting

### Common Issues

1. **Port Conflicts**
   ```bash
   # Check if ports are in use
   lsof -i :8761 -i :8765 -i :8081 -i :8083 -i :8080 -i :3306
   
   # Stop conflicting services
   ./stop-docker.sh --clean
   ```

2. **Service Not Starting**
   ```bash
   # Check logs for specific service
   docker compose logs [service-name]
   
   # Example
   docker compose logs discovery-server
   ```

3. **Database Connection Issues**
   ```bash
   # Check MySQL container
   docker compose logs mysql
   
   # Connect to MySQL directly
   docker exec -it chat-mysql mysql -u root -p
   ```

4. **Memory Issues**
   ```bash
   # Check container resource usage
   ./monitor-docker.sh stats
   
   # Free up resources
   docker system prune -f
   ```

### Service-Specific Troubleshooting

#### Discovery Server Issues
```bash
# Check Eureka dashboard
curl http://localhost:8761

# Check registered services
curl http://localhost:8761/eureka/apps
```

#### API Gateway Issues
```bash
# Check gateway routes
curl http://localhost:8765/actuator/gateway/routes

# Check gateway health
curl http://localhost:8765/actuator/health
```

#### Database Connection Issues
```bash
# Test MySQL connection
docker exec -it chat-mysql mysql -u root -pMySQL@123 -e "SHOW DATABASES;"

# Check application logs
docker compose logs discussion-service
docker compose logs feed-service
```

## 📊 Monitoring and Logs

### Real-time Monitoring
```bash
# Continuous monitoring
./monitor-docker.sh watch

# View logs in real-time
docker compose logs -f

# View specific service logs
docker compose logs -f users-service
```

### Performance Monitoring
```bash
# Container resource usage
docker stats

# Container processes
docker compose top
```

## 🔄 Development Workflow

### Making Changes to Services

1. **Stop the specific service**
   ```bash
   docker compose stop users-service
   ```

2. **Rebuild and restart**
   ```bash
   docker compose up --build -d users-service
   ```

3. **Check logs**
   ```bash
   docker compose logs -f users-service
   ```

### Full Rebuild
```bash
# Stop all services
./stop-docker.sh

# Clean and rebuild
./run-docker.sh --clean
```

## 🚀 Production Considerations

### Security Enhancements
- Change default passwords
- Use Docker secrets for sensitive data
- Enable SSL/TLS certificates
- Implement proper firewall rules

### Performance Optimizations
- Use multi-stage Docker builds
- Implement proper resource limits
- Use Docker swarm for scaling
- Add Redis for caching

### Monitoring Enhancements
- Add Prometheus and Grafana
- Implement centralized logging with ELK stack
- Add distributed tracing with Zipkin

## 📝 Scripts Reference

### `run-docker.sh`
- Builds and starts all services
- Handles service dependencies
- Performs health checks
- Options: `--clean` for cleanup

### `stop-docker.sh`
- Stops all services gracefully
- Options: `--clean` for complete cleanup

### `monitor-docker.sh`
- Shows service status and health
- Multiple monitoring options
- Real-time monitoring with `watch`

## 🎯 Next Steps

1. **Verify all services are running**
   ```bash
   ./monitor-docker.sh
   ```

2. **Test the complete flow**
   - Register a user
   - Login and get JWT
   - Create posts
   - View aggregated feed

3. **Explore service features**
   - Check Eureka dashboard
   - Test API endpoints
   - Monitor service health

## 📞 Support

For issues with the Docker setup:
1. Check service logs: `docker compose logs [service-name]`
2. Verify health checks: `./monitor-docker.sh health`
3. Review this documentation for troubleshooting steps

**Happy Dockerizing! 🐳**
