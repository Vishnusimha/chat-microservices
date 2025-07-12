# Chat Microservices - AWS Deployment Guide

## Overview
This guide provides comprehensive instructions for deploying the Chat Microservices application on AWS using multiple deployment options: ECS (Fargate), EKS (Kubernetes), and traditional EC2 instances.

## Prerequisites

### AWS Account Setup
1. **AWS Account**: Active AWS account with appropriate permissions
2. **AWS CLI**: Version 2.x installed and configured
3. **Docker**: Docker Desktop installed locally
4. **kubectl**: Kubernetes CLI (for EKS deployments)
5. **eksctl**: EKS cluster management tool (for EKS deployments)

### Required AWS Services
- **ECS/EKS**: Container orchestration
- **ECR**: Container registry
- **RDS**: MySQL database
- **Application Load Balancer**: Load balancing
- **VPC**: Network infrastructure
- **CloudWatch**: Monitoring and logging
- **Secrets Manager**: Secret management
- **Route 53**: DNS management (optional)

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                          Internet                                │
└─────────────────────────┬───────────────────────────────────────┘
                          │
┌─────────────────────────┴───────────────────────────────────────┐
│                Application Load Balancer                        │
└─────────────────────────┬───────────────────────────────────────┘
                          │
┌─────────────────────────┴───────────────────────────────────────┐
│                    ECS/EKS Cluster                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐            │
│  │  Discovery  │  │ API Gateway │  │  Frontend   │            │
│  │   Server    │  │             │  │             │            │
│  └─────────────┘  └─────────────┘  └─────────────┘            │
│                                                                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐            │
│  │    Users    │  │ Discussion  │  │    Feed     │            │
│  │   Service   │  │   Service   │  │   Service   │            │
│  └─────────────┘  └─────────────┘  └─────────────┘            │
└─────────────────────────────────────────────────────────────────┘
                          │
┌─────────────────────────┴───────────────────────────────────────┐
│                      RDS MySQL                                  │
└─────────────────────────────────────────────────────────────────┘
```

## Deployment Options

### Option 1: ECS (Fargate) - Recommended for Beginners

#### Step 1: Deploy Infrastructure
```bash
# Clone the repository
git clone https://github.com/Vishnusimha/chat-microservices.git
cd chat-microservices

# Deploy the CloudFormation stack
aws cloudformation create-stack \
  --stack-name chat-microservices-infrastructure \
  --template-body file://aws/cloudformation/infrastructure.yaml \
  --parameters ParameterKey=EnvironmentName,ParameterValue=chat-microservices \
  --capabilities CAPABILITY_IAM

# Wait for stack creation
aws cloudformation wait stack-create-complete \
  --stack-name chat-microservices-infrastructure
```

#### Step 2: Build and Push Docker Images
```bash
# Get ECR login token
aws ecr get-login-password --region us-west-2 | docker login --username AWS --password-stdin $AWS_ACCOUNT_ID.dkr.ecr.us-west-2.amazonaws.com

# Build and push each service
services=("discovery-server" "api-gateway" "users-service" "discussion-service" "feed-service" "frontend")

for service in "${services[@]}"; do
  case $service in
    "discovery-server")
      cd discoveryserver
      ./gradlew build -x test
      docker build -t $AWS_ACCOUNT_ID.dkr.ecr.us-west-2.amazonaws.com/chat-microservices/discovery-server:latest .
      docker push $AWS_ACCOUNT_ID.dkr.ecr.us-west-2.amazonaws.com/chat-microservices/discovery-server:latest
      cd ..
      ;;
    "api-gateway")
      cd api-gateway
      ./gradlew build -x test
      docker build -t $AWS_ACCOUNT_ID.dkr.ecr.us-west-2.amazonaws.com/chat-microservices/api-gateway:latest .
      docker push $AWS_ACCOUNT_ID.dkr.ecr.us-west-2.amazonaws.com/chat-microservices/api-gateway:latest
      cd ..
      ;;
    "users-service")
      cd users
      ./gradlew build -x test
      docker build -t $AWS_ACCOUNT_ID.dkr.ecr.us-west-2.amazonaws.com/chat-microservices/users-service:latest .
      docker push $AWS_ACCOUNT_ID.dkr.ecr.us-west-2.amazonaws.com/chat-microservices/users-service:latest
      cd ..
      ;;
    "discussion-service")
      cd discussion
      ./gradlew build -x test
      docker build -t $AWS_ACCOUNT_ID.dkr.ecr.us-west-2.amazonaws.com/chat-microservices/discussion-service:latest .
      docker push $AWS_ACCOUNT_ID.dkr.ecr.us-west-2.amazonaws.com/chat-microservices/discussion-service:latest
      cd ..
      ;;
    "feed-service")
      cd feed
      ./gradlew build -x test
      docker build -t $AWS_ACCOUNT_ID.dkr.ecr.us-west-2.amazonaws.com/chat-microservices/feed-service:latest .
      docker push $AWS_ACCOUNT_ID.dkr.ecr.us-west-2.amazonaws.com/chat-microservices/feed-service:latest
      cd ..
      ;;
    "frontend")
      cd frontend
      npm ci
      docker build -t $AWS_ACCOUNT_ID.dkr.ecr.us-west-2.amazonaws.com/chat-microservices/frontend:latest .
      docker push $AWS_ACCOUNT_ID.dkr.ecr.us-west-2.amazonaws.com/chat-microservices/frontend:latest
      cd ..
      ;;
  esac
done
```

#### Step 3: Register ECS Task Definitions
```bash
# Update task definitions with your AWS account ID
sed -i 's/YOUR_ACCOUNT_ID/'$AWS_ACCOUNT_ID'/g' aws/ecs/*.json

# Register task definitions
aws ecs register-task-definition --cli-input-json file://aws/ecs/discovery-server-task.json
aws ecs register-task-definition --cli-input-json file://aws/ecs/api-gateway-task.json
aws ecs register-task-definition --cli-input-json file://aws/ecs/users-service-task.json
# ... register other services
```

#### Step 4: Create ECS Services
```bash
# Create services with load balancer integration
aws ecs create-service \
  --cluster chat-microservices-cluster \
  --service-name discovery-server-service \
  --task-definition chat-microservices-discovery \
  --desired-count 2 \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[subnet-xxx,subnet-yyy],securityGroups=[sg-xxx],assignPublicIp=DISABLED}"

# Create other services...
```

### Option 2: EKS (Kubernetes) - Recommended for Production

#### Step 1: Create EKS Cluster
```bash
# Create EKS cluster
eksctl create cluster \
  --name chat-microservices-cluster \
  --region us-west-2 \
  --nodegroup-name standard-workers \
  --node-type t3.medium \
  --nodes 3 \
  --nodes-min 1 \
  --nodes-max 4 \
  --managed

# Configure kubectl
aws eks update-kubeconfig --region us-west-2 --name chat-microservices-cluster
```

#### Step 2: Install AWS Load Balancer Controller
```bash
# Install AWS Load Balancer Controller
kubectl apply -k "github.com/aws/eks-charts/stable/aws-load-balancer-controller//crds?ref=master"

helm repo add eks https://aws.github.io/eks-charts
helm install aws-load-balancer-controller eks/aws-load-balancer-controller \
  -n kube-system \
  --set clusterName=chat-microservices-cluster \
  --set serviceAccount.create=false \
  --set serviceAccount.name=aws-load-balancer-controller
```

#### Step 3: Deploy to Kubernetes
```bash
# Apply namespace and configurations
kubectl apply -f aws/kubernetes/namespace.yaml

# Deploy services
kubectl apply -f aws/kubernetes/discovery-server.yaml
kubectl apply -f aws/kubernetes/api-gateway.yaml
# ... deploy other services
```

### Option 3: Traditional EC2 with Docker Compose

#### Step 1: Launch EC2 Instance
```bash
# Launch Ubuntu 20.04 LTS instance with appropriate security group
aws ec2 run-instances \
  --image-id ami-0c02fb55956c7d316 \
  --instance-type t3.medium \
  --key-name your-key-pair \
  --security-group-ids sg-xxx \
  --subnet-id subnet-xxx \
  --user-data file://scripts/install-docker.sh
```

#### Step 2: Deploy with Docker Compose
```bash
# SSH into the instance
ssh -i your-key.pem ubuntu@your-instance-ip

# Clone repository
git clone https://github.com/Vishnusimha/chat-microservices.git
cd chat-microservices

# Deploy with Docker Compose
docker-compose up -d
```

## Configuration for AWS

### AWS-specific Application Properties

Create AWS profiles for each service:

#### Discovery Server (`application-aws.properties`)
```properties
spring.application.name=discovery-server
server.port=8761
eureka.client.register-with-eureka=false
eureka.client.fetch-registry=false
eureka.instance.prefer-ip-address=true
```

#### API Gateway (`application-aws.properties`)
```properties
spring.application.name=apigateway
server.port=8765
eureka.client.service-url.defaultZone=http://discovery-server.chat-microservices.local:8761/eureka/
spring.cloud.gateway.discovery.locator.enabled=true
```

#### Users Service (`application-aws.properties`)
```properties
spring.application.name=usersservice
server.port=8081
eureka.client.service-url.defaultZone=http://discovery-server.chat-microservices.local:8761/eureka/
spring.datasource.url=jdbc:mysql://your-rds-endpoint:3306/chat_microservices
spring.datasource.username=${DB_USERNAME}
spring.datasource.password=${DB_PASSWORD}
```

## Security Configuration

### IAM Roles and Policies

#### ECS Task Execution Role
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "ecr:GetAuthorizationToken",
        "ecr:BatchCheckLayerAvailability",
        "ecr:GetDownloadUrlForLayer",
        "ecr:BatchGetImage",
        "logs:CreateLogStream",
        "logs:PutLogEvents",
        "secretsmanager:GetSecretValue"
      ],
      "Resource": "*"
    }
  ]
}
```

#### ECS Task Role
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "secretsmanager:GetSecretValue",
        "rds:DescribeDBInstances",
        "cloudwatch:PutMetricData"
      ],
      "Resource": "*"
    }
  ]
}
```

## Monitoring and Logging

### CloudWatch Configuration
```yaml
# CloudWatch log groups
LogGroups:
  - /ecs/chat-microservices/discovery-server
  - /ecs/chat-microservices/api-gateway
  - /ecs/chat-microservices/users-service
  - /ecs/chat-microservices/discussion-service
  - /ecs/chat-microservices/feed-service
  - /ecs/chat-microservices/frontend
```

### Application Metrics
Each service exposes metrics at `/actuator/prometheus` for monitoring with:
- **CloudWatch**: Native AWS monitoring
- **Prometheus**: Custom metrics collection
- **Grafana**: Visualization dashboards

## Scaling Configuration

### Auto Scaling for ECS
```bash
# Create auto scaling target
aws application-autoscaling register-scalable-target \
  --service-namespace ecs \
  --scalable-dimension ecs:service:DesiredCount \
  --resource-id service/chat-microservices-cluster/api-gateway-service \
  --min-capacity 2 \
  --max-capacity 10

# Create scaling policy
aws application-autoscaling put-scaling-policy \
  --policy-name api-gateway-scale-policy \
  --service-namespace ecs \
  --scalable-dimension ecs:service:DesiredCount \
  --resource-id service/chat-microservices-cluster/api-gateway-service \
  --policy-type TargetTrackingScaling \
  --target-tracking-scaling-policy-configuration file://scaling-policy.json
```

### Horizontal Pod Autoscaler for EKS
```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: api-gateway-hpa
  namespace: chat-microservices
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: api-gateway
  minReplicas: 2
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
```

## Cost Optimization

### EC2 Instance Types
- **Development**: t3.small, t3.medium
- **Production**: c5.large, c5.xlarge
- **Database**: db.t3.micro (development), db.r5.large (production)

### Cost Monitoring
```bash
# Set up billing alerts
aws budgets create-budget \
  --account-id $AWS_ACCOUNT_ID \
  --budget file://budget-config.json
```

## Troubleshooting

### Common Issues

1. **Service Registration Failure**
   - Check Eureka server connectivity
   - Verify security group rules
   - Check DNS resolution

2. **Database Connection Issues**
   - Verify RDS security group allows connections
   - Check database credentials in Secrets Manager
   - Verify network connectivity

3. **Load Balancer Health Checks**
   - Ensure health check endpoints are accessible
   - Check target group configuration
   - Verify security group rules

### Debugging Commands

```bash
# ECS Service logs
aws logs describe-log-groups --log-group-name-prefix /ecs/chat-microservices

# EKS Pod logs
kubectl logs -n chat-microservices deployment/api-gateway

# Service discovery
kubectl get endpoints -n chat-microservices
```

## SaaS Deployment Considerations

### Multi-Tenancy Architecture
- **Database per tenant**: Separate RDS instances
- **Schema per tenant**: Single database, multiple schemas
- **Shared database**: Tenant ID in all tables

### Tenant Management
```yaml
# Tenant configuration
apiVersion: v1
kind: ConfigMap
metadata:
  name: tenant-config
  namespace: chat-microservices
data:
  tenant.isolation.strategy: "database"
  tenant.default.database.url: "jdbc:mysql://default-tenant-db:3306/chat_microservices"
```

## Security Best Practices

1. **Network Security**
   - Use private subnets for services
   - Implement proper security groups
   - Enable VPC Flow Logs

2. **Application Security**
   - Use HTTPS/TLS everywhere
   - Implement proper JWT validation
   - Use AWS Secrets Manager for sensitive data

3. **Container Security**
   - Scan images for vulnerabilities
   - Use minimal base images
   - Implement resource limits

## Backup and Disaster Recovery

### Database Backup
```bash
# Enable automated backups
aws rds modify-db-instance \
  --db-instance-identifier chat-microservices-database \
  --backup-retention-period 7 \
  --apply-immediately
```

### Cross-Region Replication
```yaml
# RDS Cross-Region Replica
ReplicaDatabase:
  Type: AWS::RDS::DBInstance
  Properties:
    SourceDBInstanceIdentifier: !Sub 
      - arn:aws:rds:${SourceRegion}:${AWS::AccountId}:db:${SourceDBInstanceIdentifier}
      - SourceRegion: us-west-2
        SourceDBInstanceIdentifier: !Ref RDSDatabase
    DBInstanceClass: db.t3.micro
```

## Performance Optimization

### Caching Strategy
- **Redis**: Session caching, API response caching
- **CloudFront**: Static content delivery
- **ElastiCache**: Database query caching

### Database Optimization
- **Read Replicas**: Distribute read load
- **Connection Pooling**: Optimize database connections
- **Query Optimization**: Index optimization

## Next Steps

1. **Implement the chosen deployment option**
2. **Set up monitoring and alerting**
3. **Configure CI/CD pipeline**
4. **Implement security hardening**
5. **Set up backup and disaster recovery**
6. **Performance testing and optimization**

For detailed implementation of each step, refer to the specific configuration files in the `aws/` directory.