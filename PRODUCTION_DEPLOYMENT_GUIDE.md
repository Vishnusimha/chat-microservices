# Chat Microservices - Production Deployment Guide

## Overview

This guide covers production-ready deployment of the Chat Microservices application with enterprise-grade patterns including monitoring, security, scalability, and disaster recovery.

## Architecture Patterns Implemented

### 1. **Service Discovery & Communication**
- ✅ Eureka Server for service registration
- ✅ API Gateway for external access
- ✅ Circuit Breaker pattern for resilience
- ✅ Load balancing across service instances

### 2. **Containerization & Orchestration**
- ✅ Docker containers for all services
- ✅ Docker Compose for local development
- ✅ Kubernetes deployments for production
- ✅ Health checks and readiness probes

### 3. **Data Management**
- ✅ MySQL database with connection pooling
- ✅ Redis for caching and session management
- ✅ Database migrations and initialization
- ✅ Backup and recovery procedures

### 4. **Security**
- ✅ JWT-based authentication
- ✅ API Gateway security
- ✅ Secret management
- ✅ HTTPS/TLS encryption

### 5. **Monitoring & Observability**
- ✅ Prometheus metrics collection
- ✅ Grafana dashboards
- ✅ ELK stack for centralized logging
- ✅ Health check endpoints

### 6. **CI/CD Pipeline**
- ✅ GitHub Actions workflow
- ✅ Automated testing
- ✅ Container image building
- ✅ Deployment automation

## Production Deployment Options

### Option 1: AWS ECS (Recommended for AWS)

#### Advantages:
- **Fully managed**: No server management
- **Auto-scaling**: Automatic capacity management
- **Cost-effective**: Pay only for what you use
- **AWS integration**: Native AWS services integration

#### Deployment Steps:
```bash
# 1. Deploy infrastructure
aws cloudformation create-stack \
  --stack-name chat-microservices-prod \
  --template-body file://aws/cloudformation/infrastructure.yaml \
  --parameters ParameterKey=EnvironmentName,ParameterValue=prod \
  --capabilities CAPABILITY_IAM

# 2. Build and push images
./scripts/build-and-push-images.sh

# 3. Deploy services
./scripts/deploy-to-ecs.sh
```

### Option 2: AWS EKS (Recommended for Kubernetes)

#### Advantages:
- **Kubernetes native**: Standard K8s APIs
- **Flexibility**: Advanced orchestration features
- **Portability**: Can run on any Kubernetes cluster
- **Community**: Large ecosystem of tools

#### Deployment Steps:
```bash
# 1. Create EKS cluster
eksctl create cluster -f aws/eks/cluster.yaml

# 2. Install necessary controllers
kubectl apply -f aws/kubernetes/controllers/

# 3. Deploy applications
kubectl apply -f aws/kubernetes/
```

### Option 3: Self-Managed Kubernetes

#### Advantages:
- **Full control**: Complete cluster management
- **Cost optimization**: No managed service fees
- **Customization**: Full customization capabilities

#### Deployment Steps:
```bash
# 1. Set up Kubernetes cluster (kubeadm, kops, etc.)
# 2. Install ingress controller
# 3. Deploy applications
kubectl apply -f kubernetes/
```

## SaaS Deployment Architecture

### Multi-Tenant Strategy

#### 1. **Database per Tenant (Recommended)**
```yaml
# Tenant-specific database configuration
apiVersion: v1
kind: ConfigMap
metadata:
  name: tenant-db-config
data:
  tenant-1.database.url: "jdbc:mysql://tenant1-db:3306/chat_microservices"
  tenant-2.database.url: "jdbc:mysql://tenant2-db:3306/chat_microservices"
```

#### 2. **Schema per Tenant**
```sql
-- Dynamic schema creation
CREATE SCHEMA IF NOT EXISTS `tenant_{tenant_id}`;
USE `tenant_{tenant_id}`;
-- Create tables for tenant
```

#### 3. **Shared Database with Tenant ID**
```java
@Entity
@Table(name = "users")
public class User {
    @Id
    private Long id;
    
    @Column(name = "tenant_id")
    private String tenantId;
    
    // Other fields...
}
```

### Tenant Management Service

```java
@RestController
public class TenantController {
    
    @PostMapping("/tenants")
    public ResponseEntity<Tenant> createTenant(@RequestBody TenantRequest request) {
        // 1. Create tenant database/schema
        // 2. Generate tenant-specific configurations
        // 3. Deploy tenant-specific services
        // 4. Configure routing rules
        return ResponseEntity.ok(tenant);
    }
}
```

## Monitoring & Observability

### 1. **Metrics Collection**

#### Application Metrics
```yaml
# Prometheus configuration
scrape_configs:
  - job_name: 'chat-microservices'
    kubernetes_sd_configs:
      - role: pod
    relabel_configs:
      - source_labels: [__meta_kubernetes_pod_annotation_prometheus_io_scrape]
        action: keep
        regex: true
```

#### Business Metrics
```java
@Component
public class BusinessMetrics {
    private final Counter userRegistrations = Counter.build()
        .name("user_registrations_total")
        .help("Total user registrations")
        .register();
    
    private final Histogram responseTime = Histogram.build()
        .name("api_response_time_seconds")
        .help("API response time")
        .register();
}
```

### 2. **Logging Strategy**

#### Structured Logging
```json
{
  "timestamp": "2024-01-15T10:30:00Z",
  "level": "INFO",
  "service": "users-service",
  "traceId": "abc123",
  "spanId": "def456",
  "message": "User created successfully",
  "userId": "user-123",
  "tenantId": "tenant-1"
}
```

#### Log Aggregation
```yaml
# Filebeat configuration
filebeat.inputs:
- type: container
  paths:
    - '/var/log/containers/*chat-microservices*.log'
  processors:
    - add_kubernetes_metadata:
        in_cluster: true
```

### 3. **Distributed Tracing**

#### Jaeger Configuration
```yaml
# Jaeger deployment
apiVersion: apps/v1
kind: Deployment
metadata:
  name: jaeger
spec:
  template:
    spec:
      containers:
      - name: jaeger
        image: jaegertracing/all-in-one:latest
        ports:
        - containerPort: 16686
        - containerPort: 14268
```

## Security Implementation

### 1. **Authentication & Authorization**

#### JWT Token Management
```java
@Component
public class JwtTokenProvider {
    
    @Value("${jwt.secret}")
    private String jwtSecret;
    
    @Value("${jwt.expiration}")
    private int jwtExpiration;
    
    public String generateToken(UserPrincipal userPrincipal) {
        return Jwts.builder()
            .setSubject(userPrincipal.getId().toString())
            .setIssuedAt(new Date())
            .setExpiration(new Date(System.currentTimeMillis() + jwtExpiration))
            .signWith(SignatureAlgorithm.HS512, jwtSecret)
            .compact();
    }
}
```

#### API Gateway Security
```java
@Configuration
public class SecurityConfig {
    
    @Bean
    public SecurityWebFilterChain springSecurityFilterChain(ServerHttpSecurity http) {
        return http
            .csrf().disable()
            .authorizeExchange(exchanges -> exchanges
                .pathMatchers("/auth/**").permitAll()
                .pathMatchers("/actuator/health").permitAll()
                .anyExchange().authenticated())
            .oauth2ResourceServer(oauth2 -> oauth2
                .jwt(jwt -> jwt.jwtDecoder(jwtDecoder())))
            .build();
    }
}
```

### 2. **Network Security**

#### Service Mesh (Istio)
```yaml
# Istio security policy
apiVersion: security.istio.io/v1beta1
kind: PeerAuthentication
metadata:
  name: default
  namespace: chat-microservices
spec:
  mtls:
    mode: STRICT
```

#### Network Policies
```yaml
# Kubernetes Network Policy
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: chat-microservices-netpol
spec:
  podSelector:
    matchLabels:
      app: chat-microservices
  policyTypes:
  - Ingress
  - Egress
  ingress:
  - from:
    - namespaceSelector:
        matchLabels:
          name: chat-microservices
```

### 3. **Secrets Management**

#### AWS Secrets Manager Integration
```java
@Configuration
public class SecretsConfig {
    
    @Bean
    public AWSSecretsManager secretsManager() {
        return AWSSecretsManagerClientBuilder.standard()
            .withRegion(Regions.US_WEST_2)
            .build();
    }
    
    @Bean
    @Primary
    public DataSource dataSource() {
        String secret = getSecretValue("chat-microservices/database");
        // Parse secret and create DataSource
    }
}
```

## Scalability Patterns

### 1. **Horizontal Pod Autoscaler**
```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: api-gateway-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: api-gateway
  minReplicas: 2
  maxReplicas: 20
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
```

### 2. **Database Scaling**

#### Read Replicas
```yaml
# RDS Read Replica
ReadReplicaDB:
  Type: AWS::RDS::DBInstance
  Properties:
    SourceDBInstanceIdentifier: !Ref PrimaryDB
    DBInstanceClass: db.r5.large
    PubliclyAccessible: false
```

#### Connection Pooling
```java
@Configuration
public class DatabaseConfig {
    
    @Bean
    public DataSource dataSource() {
        HikariConfig config = new HikariConfig();
        config.setMaximumPoolSize(20);
        config.setMinimumIdle(5);
        config.setConnectionTimeout(30000);
        config.setIdleTimeout(600000);
        config.setMaxLifetime(1800000);
        return new HikariDataSource(config);
    }
}
```

### 3. **Caching Strategy**

#### Redis Configuration
```yaml
# Redis Cluster
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: redis-cluster
spec:
  serviceName: redis-cluster
  replicas: 6
  template:
    spec:
      containers:
      - name: redis
        image: redis:7.0-alpine
        ports:
        - containerPort: 6379
        - containerPort: 16379
```

#### Application Caching
```java
@Service
public class UserService {
    
    @Cacheable(value = "users", key = "#id")
    public User getUserById(Long id) {
        return userRepository.findById(id);
    }
    
    @CacheEvict(value = "users", key = "#user.id")
    public User updateUser(User user) {
        return userRepository.save(user);
    }
}
```

## Disaster Recovery

### 1. **Backup Strategy**

#### Database Backup
```bash
# Automated backup script
#!/bin/bash
DB_NAME="chat_microservices"
BACKUP_DIR="/backups"
DATE=$(date +%Y%m%d_%H%M%S)

# Create backup
mysqldump -h $DB_HOST -u $DB_USER -p$DB_PASSWORD $DB_NAME > $BACKUP_DIR/backup_$DATE.sql

# Upload to S3
aws s3 cp $BACKUP_DIR/backup_$DATE.sql s3://chat-microservices-backups/
```

#### Application Data Backup
```yaml
# CronJob for application data backup
apiVersion: batch/v1
kind: CronJob
metadata:
  name: app-data-backup
spec:
  schedule: "0 2 * * *"  # Daily at 2 AM
  jobTemplate:
    spec:
      template:
        spec:
          containers:
          - name: backup
            image: backup-tool:latest
            command: ["/bin/sh", "-c", "backup-script.sh"]
```

### 2. **Multi-Region Deployment**

#### Cross-Region Replication
```yaml
# Primary region (us-west-2)
regions:
  primary:
    region: us-west-2
    services:
      - discovery-server
      - api-gateway
      - users-service
      - discussion-service
      - feed-service
    database:
      primary: true
      
  # Secondary region (us-east-1)
  secondary:
    region: us-east-1
    services:
      - discovery-server
      - api-gateway
      - users-service
      - discussion-service
      - feed-service
    database:
      replica: true
```

## Cost Optimization

### 1. **Resource Optimization**

#### Right-sizing Containers
```yaml
# Optimized resource requests and limits
resources:
  requests:
    memory: "256Mi"
    cpu: "100m"
  limits:
    memory: "512Mi"
    cpu: "200m"
```

#### Spot Instances
```yaml
# EKS Node Group with Spot Instances
nodeGroups:
  - name: spot-workers
    instanceTypes: ["t3.medium", "t3.large"]
    spot: true
    minSize: 1
    maxSize: 10
    desiredCapacity: 3
```

### 2. **Cost Monitoring**

#### AWS Cost Explorer Integration
```bash
# Cost monitoring script
aws ce get-cost-and-usage \
  --time-period Start=2024-01-01,End=2024-01-31 \
  --granularity MONTHLY \
  --metrics BlendedCost \
  --group-by Type=DIMENSION,Key=SERVICE
```

## Performance Optimization

### 1. **Application Performance**

#### JVM Tuning
```dockerfile
# Optimized JVM settings
ENV JAVA_OPTS="-Xms512m -Xmx1024m -XX:+UseG1GC -XX:+UseStringDeduplication"
```

#### Database Query Optimization
```java
@Entity
@Table(name = "posts", indexes = {
    @Index(name = "idx_user_id", columnList = "user_id"),
    @Index(name = "idx_created_at", columnList = "created_at")
})
public class Post {
    // Entity fields
}
```

### 2. **Network Performance**

#### Connection Pooling
```java
@Bean
public WebClient webClient() {
    ConnectionProvider connectionProvider = ConnectionProvider.builder("custom")
        .maxConnections(500)
        .maxIdleTime(Duration.ofSeconds(20))
        .maxLifeTime(Duration.ofSeconds(60))
        .build();
        
    return WebClient.builder()
        .clientConnector(new ReactorClientHttpConnector(
            HttpClient.create(connectionProvider)))
        .build();
}
```

## Testing Strategy

### 1. **Unit Testing**
```java
@SpringBootTest
class UserServiceTest {
    
    @Test
    void shouldCreateUserSuccessfully() {
        // Test implementation
    }
    
    @Test
    void shouldValidateUserCredentials() {
        // Test implementation
    }
}
```

### 2. **Integration Testing**
```java
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@TestPropertySource(properties = {
    "spring.datasource.url=jdbc:h2:mem:testdb"
})
class UserControllerIntegrationTest {
    
    @Test
    void shouldCreateUserThroughAPI() {
        // Integration test implementation
    }
}
```

### 3. **Performance Testing**
```yaml
# k6 performance test
import http from 'k6/http';

export let options = {
  stages: [
    { duration: '2m', target: 100 },
    { duration: '5m', target: 100 },
    { duration: '2m', target: 200 },
    { duration: '5m', target: 200 },
    { duration: '2m', target: 0 },
  ],
};

export default function () {
  http.get('https://api.chat-microservices.com/api/users');
}
```

## Deployment Checklist

### Pre-Deployment
- [ ] Security review completed
- [ ] Performance testing passed
- [ ] Backup procedures tested
- [ ] Monitoring configured
- [ ] Documentation updated

### Deployment
- [ ] Blue-green deployment strategy
- [ ] Database migrations applied
- [ ] Configuration validated
- [ ] Health checks passing
- [ ] Load balancer configured

### Post-Deployment
- [ ] Smoke tests executed
- [ ] Monitoring dashboards reviewed
- [ ] Performance metrics validated
- [ ] User acceptance testing
- [ ] Rollback plan tested

## Maintenance Procedures

### 1. **Regular Maintenance**
```bash
# Weekly maintenance script
#!/bin/bash

# Update container images
kubectl set image deployment/api-gateway api-gateway=new-image:latest

# Clean up old images
docker image prune -a --filter "until=168h"

# Database maintenance
mysql -e "OPTIMIZE TABLE users, posts, comments;"
```

### 2. **Security Updates**
```bash
# Monthly security updates
# 1. Update base images
# 2. Apply security patches
# 3. Update dependencies
# 4. Run security scans
```

This production deployment guide provides a comprehensive approach to deploying and maintaining the Chat Microservices application in a production environment with enterprise-grade reliability, security, and scalability.