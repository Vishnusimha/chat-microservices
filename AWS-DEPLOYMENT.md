# Chat Microservices AWS Deployment Guide

This guide provides step-by-step instructions for deploying the chat microservices to AWS using containerization and CI/CD.

## Architecture Overview

The deployment uses the following AWS services:
- **ECS Fargate**: Container orchestration
- **ECR**: Container registry
- **Application Load Balancer**: Load balancing and routing
- **VPC**: Network isolation
- **CloudWatch**: Logging and monitoring
- **Service Discovery**: Internal service communication
- **GitHub Actions**: CI/CD pipeline

## Prerequisites

1. **AWS Account** with appropriate permissions
2. **AWS CLI** configured with your credentials
3. **Docker** installed locally (for testing)
4. **GitHub repository** with secrets configured

## Step 1: Set up AWS Resources

### 1.1 Create ECR Repositories

Run the ECR setup script:

```bash
./setup-ecr.sh us-east-1
```

This creates the following ECR repositories:
- `chat-discovery-server`
- `chat-api-gateway`
- `chat-users-service`
- `chat-discussion-service`
- `chat-feed-service`
- `chat-frontend`

### 1.2 Configure GitHub Secrets

In your GitHub repository, go to Settings > Secrets and variables > Actions, and add:

- `AWS_ACCESS_KEY_ID`: Your AWS access key
- `AWS_SECRET_ACCESS_KEY`: Your AWS secret key
- `AWS_ACCOUNT_ID`: Your AWS account ID (12-digit number)

## Step 2: Deploy Infrastructure

### 2.1 Deploy VPC and Networking

```bash
aws cloudformation deploy \
  --template-file aws/cloudformation/infrastructure.yaml \
  --stack-name chat-microservices-infrastructure \
  --capabilities CAPABILITY_IAM \
  --region us-east-1
```

This creates:
- VPC with public/private subnets
- Internet Gateway and NAT Gateways
- Security Groups
- Route Tables

### 2.2 Deploy ECS Cluster

```bash
aws cloudformation deploy \
  --template-file aws/cloudformation/ecs-cluster.yaml \
  --stack-name chat-microservices-ecs \
  --capabilities CAPABILITY_IAM \
  --region us-east-1
```

This creates:
- ECS Fargate cluster
- Application Load Balancer
- Target Groups
- Service Discovery namespace
- IAM roles and policies

## Step 3: Deploy Services

### 3.1 Local Testing (Optional)

Test the complete system locally:

```bash
# Build all services
./gradlew build

# Start all services with Docker Compose
docker-compose up --build
```

Access the application at:
- Frontend: http://localhost:3000
- API Gateway: http://localhost:8765
- Eureka Dashboard: http://localhost:8761

### 3.2 Production Deployment

Push your code to the `main` branch to trigger the CI/CD pipeline:

```bash
git add .
git commit -m "Deploy to AWS"
git push origin main
```

The GitHub Actions workflow will:
1. Build and test all services
2. Build and push Docker images to ECR
3. Deploy/update the infrastructure
4. Update ECS services with new images

## Step 4: Monitoring and Management

### 4.1 Access Your Application

After deployment, get the Load Balancer DNS:

```bash
aws cloudformation describe-stacks \
  --stack-name chat-microservices-ecs \
  --query 'Stacks[0].Outputs[?OutputKey==`LoadBalancerDNS`].OutputValue' \
  --output text \
  --region us-east-1
```

Access your application at:
- Frontend: `http://[LOAD_BALANCER_DNS]`
- API Gateway: `http://[LOAD_BALANCER_DNS]/api`

### 4.2 View Logs

```bash
# View logs for a specific service
aws logs tail /ecs/chat-api-gateway --follow --region us-east-1

# View all log groups
aws logs describe-log-groups --log-group-name-prefix "/ecs/chat" --region us-east-1
```

### 4.3 Scale Services

```bash
# Scale a service
aws ecs update-service \
  --cluster chat-microservices-cluster \
  --service api-gateway \
  --desired-count 3 \
  --region us-east-1
```

## Step 5: Cleanup

To remove all resources:

```bash
# Delete ECS services and cluster
aws cloudformation delete-stack \
  --stack-name chat-microservices-ecs \
  --region us-east-1

# Delete infrastructure
aws cloudformation delete-stack \
  --stack-name chat-microservices-infrastructure \
  --region us-east-1

# Delete ECR repositories
aws ecr delete-repository --repository-name chat-discovery-server --force --region us-east-1
aws ecr delete-repository --repository-name chat-api-gateway --force --region us-east-1
aws ecr delete-repository --repository-name chat-users-service --force --region us-east-1
aws ecr delete-repository --repository-name chat-discussion-service --force --region us-east-1
aws ecr delete-repository --repository-name chat-feed-service --force --region us-east-1
aws ecr delete-repository --repository-name chat-frontend --force --region us-east-1
```

## Troubleshooting

### Common Issues

1. **ECS Service fails to start**
   - Check CloudWatch logs for error messages
   - Verify security groups allow required ports
   - Ensure task definition has correct image URIs

2. **Load Balancer health checks fail**
   - Check that health check paths are correct
   - Verify services are exposing health endpoints
   - Check security group rules

3. **Service discovery issues**
   - Ensure services are registered in the same namespace
   - Check service discovery service configuration
   - Verify DNS resolution in tasks

### Useful Commands

```bash
# Check ECS cluster status
aws ecs describe-clusters --clusters chat-microservices-cluster --region us-east-1

# List running tasks
aws ecs list-tasks --cluster chat-microservices-cluster --region us-east-1

# Check service status
aws ecs describe-services --cluster chat-microservices-cluster --services api-gateway --region us-east-1

# View task definition
aws ecs describe-task-definition --task-definition chat-api-gateway:1 --region us-east-1
```

## Cost Optimization

1. **Use appropriate instance sizes**: Start with 256 CPU/512 Memory
2. **Set up auto-scaling**: Scale based on CPU/Memory usage
3. **Use lifecycle policies**: Automatically delete old ECR images
4. **Monitor usage**: Use AWS Cost Explorer and CloudWatch

## Security Best Practices

1. **Use IAM roles**: Don't embed credentials in code
2. **Enable ECR image scanning**: Scan for vulnerabilities
3. **Use VPC endpoints**: Reduce data transfer costs
4. **Enable CloudTrail**: Monitor API calls
5. **Use secrets manager**: Store sensitive configuration

## Next Steps

1. **Set up monitoring**: Add CloudWatch alarms and dashboards
2. **Implement auto-scaling**: Configure ECS service auto-scaling
3. **Add HTTPS**: Configure SSL/TLS termination at the load balancer
4. **Set up database**: Use RDS for production data persistence
5. **Implement caching**: Add Redis for session management
6. **Add API documentation**: Use Swagger/OpenAPI

---

For more information, refer to the [AWS ECS documentation](https://docs.aws.amazon.com/ecs/) and [GitHub Actions documentation](https://docs.github.com/en/actions).