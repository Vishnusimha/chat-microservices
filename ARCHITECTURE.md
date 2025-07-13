# Architecture Overview - AWS Chat Microservices

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Internet                                 │
└─────────────────────────┬───────────────────────────────────────┘
                          │
┌─────────────────────────▼───────────────────────────────────────┐
│               Application Load Balancer                         │
│                    (Public Subnets)                             │
└─────────────────────────┬───────────────────────────────────────┘
                          │
┌─────────────────────────▼───────────────────────────────────────┐
│                    ECS Fargate Cluster                          │
│                   (Private Subnets)                             │
│                                                                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
│  │   Frontend  │  │ API Gateway │  │ Discovery   │             │
│  │    :80      │  │    :8765    │  │ Server      │             │
│  │             │  │             │  │   :8761     │             │
│  └─────────────┘  └─────────────┘  └─────────────┘             │
│                                                                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
│  │   Users     │  │ Discussion  │  │    Feed     │             │
│  │  Service    │  │  Service    │  │  Service    │             │
│  │   :8081     │  │   :8083     │  │   :8080     │             │
│  └─────────────┘  └─────────────┘  └─────────────┘             │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## Network Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                           VPC                                    │
│                      (10.0.0.0/16)                             │
│                                                                 │
│  ┌─────────────────┐                   ┌─────────────────┐     │
│  │  Public Subnet  │                   │  Public Subnet  │     │
│  │   AZ-1 (1.0/24) │                   │   AZ-2 (2.0/24) │     │
│  │                 │                   │                 │     │
│  │ ┌─────────────┐ │                   │ ┌─────────────┐ │     │
│  │ │     ALB     │ │                   │ │   NAT GW    │ │     │
│  │ └─────────────┘ │                   │ └─────────────┘ │     │
│  └─────────────────┘                   └─────────────────┘     │
│                                                                 │
│  ┌─────────────────┐                   ┌─────────────────┐     │
│  │ Private Subnet  │                   │ Private Subnet  │     │
│  │   AZ-1 (3.0/24) │                   │   AZ-2 (4.0/24) │     │
│  │                 │                   │                 │     │
│  │ ┌─────────────┐ │                   │ ┌─────────────┐ │     │
│  │ │ ECS Tasks   │ │                   │ │ ECS Tasks   │ │     │
│  │ └─────────────┘ │                   │ └─────────────┘ │     │
│  └─────────────────┘                   └─────────────────┘     │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## Service Communication Flow

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Client    │───▶│     ALB     │───▶│   Frontend  │
│  (Browser)  │    │  (Port 80)  │    │  (Port 80)  │
└─────────────┘    └─────────────┘    └─────────────┘
                            │
                            ▼
                   ┌─────────────┐
                   │ API Gateway │
                   │ (Port 8765) │
                   └─────────────┘
                            │
           ┌────────────────┼────────────────┐
           ▼                ▼                ▼
    ┌─────────────┐  ┌─────────────┐  ┌─────────────┐
    │   Users     │  │ Discussion  │  │    Feed     │
    │  Service    │  │  Service    │  │  Service    │
    │ (Port 8081) │  │ (Port 8083) │  │ (Port 8080) │
    └─────────────┘  └─────────────┘  └─────────────┘
           ▲                ▲                │
           │                │                ▼
           │                │         ┌─────────────┐
           │                │         │ Discovery   │
           │                │         │   Server    │
           │                │         │ (Port 8761) │
           │                │         └─────────────┘
           │                │
           └────────────────┴──── Service Discovery
```

## CI/CD Pipeline Flow

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   GitHub    │───▶│   Build     │───▶│    Test     │
│   Push      │    │  Services   │    │  Services   │
└─────────────┘    └─────────────┘    └─────────────┘
                                              │
                                              ▼
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Deploy    │◀───│   Push to   │◀───│   Build     │
│   to ECS    │    │     ECR     │    │   Docker    │
└─────────────┘    └─────────────┘    └─────────────┘
```

## Data Flow

```
┌─────────────┐
│   Frontend  │
│ (React App) │
└─────────────┘
        │
        ▼ HTTP Requests
┌─────────────┐
│ API Gateway │
│ (Port 8765) │
└─────────────┘
        │
        ▼ JWT Auth & Routing
┌─────────────────────────────────────────────────────────┐
│                    Backend Services                     │
│                                                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │
│  │   Users     │  │ Discussion  │  │    Feed     │     │
│  │  Service    │  │  Service    │  │  Service    │     │
│  │             │  │             │  │             │     │
│  │ • Auth      │  │ • Posts     │  │ • Aggregates│     │
│  │ • JWT       │  │ • Comments  │  │ • Calls     │     │
│  │ • Users     │  │ • CRUD      │  │   other     │     │
│  └─────────────┘  └─────────────┘  │   services  │     │
│                                    └─────────────┘     │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

## Security Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                       Internet Gateway                          │
└─────────────────────────┬───────────────────────────────────────┘
                          │
                          ▼ HTTPS/HTTP
┌─────────────────────────────────────────────────────────────────┐
│                   ALB Security Group                            │
│                (Ports 80, 443 from 0.0.0.0/0)                 │
└─────────────────────────┬───────────────────────────────────────┘
                          │
                          ▼ Internal Traffic
┌─────────────────────────────────────────────────────────────────┐
│                  ECS Security Group                             │
│            (Ports 8080-8765 from ALB SG only)                  │
│                                                                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
│  │   Service   │  │   Service   │  │   Service   │             │
│  │   to        │  │   to        │  │   to        │             │
│  │   Service   │  │   Service   │  │   Service   │             │
│  └─────────────┘  └─────────────┘  └─────────────┘             │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## Deployment Components

### AWS Services Used:
- **ECS Fargate**: Container orchestration
- **ECR**: Container image registry
- **Application Load Balancer**: Traffic distribution
- **VPC**: Network isolation
- **CloudWatch**: Logging and monitoring
- **Service Discovery**: Internal DNS
- **CloudFormation**: Infrastructure as Code
- **IAM**: Security and permissions

### GitHub Actions Workflow:
1. **Trigger**: Push to main branch
2. **Build**: Compile Java services and React frontend
3. **Test**: Run unit tests for all services
4. **Containerize**: Build Docker images
5. **Push**: Upload images to ECR
6. **Deploy**: Update ECS services
7. **Verify**: Health checks and monitoring

### Monitoring & Observability:
- **CloudWatch Logs**: Centralized logging
- **ECS Service Metrics**: CPU, memory, network
- **ALB Metrics**: Request count, latency, errors
- **Health Checks**: Application-level health monitoring
- **Alarms**: Automated alerting (configurable)

## Scalability & Performance

### Auto-scaling Triggers:
- CPU utilization > 70%
- Memory utilization > 80%
- Request count > 1000 RPM

### Load Balancing:
- **Algorithm**: Round-robin with health checks
- **Health Check**: `/actuator/health` endpoints
- **Timeout**: 5 seconds
- **Retry**: 3 attempts

### Resource Allocation:
- **CPU**: 256 vCPU per service (scalable)
- **Memory**: 512 MB per service (scalable)
- **Network**: 25 Gbps (Fargate)

This architecture provides a robust, scalable, and secure foundation for your chat microservices on AWS! 🏗️