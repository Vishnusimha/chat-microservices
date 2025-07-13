# Quick Start Guide - AWS CI/CD Deployment

This guide helps you quickly deploy your chat microservices to AWS using the new CI/CD pipeline.

## Prerequisites ✅

1. **AWS Account** with permissions for:
   - ECR (Elastic Container Registry)
   - ECS (Elastic Container Service)  
   - CloudFormation
   - VPC, ALB, IAM

2. **GitHub Repository** with admin access

3. **AWS CLI** installed and configured

## Step 1: Set up ECR Repositories

Create container registries for your services:

```bash
# Make script executable and run
chmod +x setup-ecr.sh
./setup-ecr.sh us-east-1
```

This creates 6 ECR repositories:
- `chat-discovery-server`
- `chat-api-gateway`
- `chat-users-service`
- `chat-discussion-service`
- `chat-feed-service`
- `chat-frontend`

## Step 2: Configure GitHub Secrets

Go to your GitHub repository → Settings → Secrets and variables → Actions

Add these secrets:
- `AWS_ACCESS_KEY_ID`: Your AWS access key
- `AWS_SECRET_ACCESS_KEY`: Your AWS secret key
- `AWS_ACCOUNT_ID`: Your 12-digit AWS account ID

## Step 3: Deploy Infrastructure

Deploy the base infrastructure:

```bash
aws cloudformation deploy \
  --template-file aws/cloudformation/infrastructure.yaml \
  --stack-name chat-microservices-infrastructure \
  --capabilities CAPABILITY_IAM \
  --region us-east-1
```

## Step 4: Deploy Services

Simply push to main branch to trigger deployment:

```bash
git add .
git commit -m "Deploy to AWS"
git push origin main
```

The CI/CD pipeline will:
1. ✅ Build and test all services
2. ✅ Build and push Docker images to ECR
3. ✅ Deploy/update ECS cluster
4. ✅ Update services with new images

## Step 5: Access Your Application

After deployment completes, get your application URL:

```bash
# Check deployment status
./check-deployment.sh us-east-1

# Or get URL directly
aws cloudformation describe-stacks \
  --stack-name chat-microservices-ecs \
  --query 'Stacks[0].Outputs[?OutputKey==`LoadBalancerDNS`].OutputValue' \
  --output text \
  --region us-east-1
```

Access your application at:
- **Frontend**: `http://[LOAD_BALANCER_DNS]`
- **API Gateway**: `http://[LOAD_BALANCER_DNS]/api`
- **Eureka Dashboard**: `http://[LOAD_BALANCER_DNS]:8761`

## Monitoring

### View logs:
```bash
aws logs tail /ecs/chat-api-gateway --follow --region us-east-1
```

### Check service health:
```bash
./check-deployment.sh us-east-1
```

### Scale services:
```bash
aws ecs update-service \
  --cluster chat-microservices-cluster \
  --service api-gateway \
  --desired-count 3 \
  --region us-east-1
```

## Local Development

You can still develop locally with Docker Compose:

```bash
# Build and run all services locally
docker-compose up --build

# Access at:
# - Frontend: http://localhost:3000
# - API Gateway: http://localhost:8765
# - Eureka: http://localhost:8761
```

## Troubleshooting

### Common Issues:

1. **ECR Repository Not Found**
   ```bash
   ./setup-ecr.sh us-east-1
   ```

2. **GitHub Secrets Missing**
   - Check AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_ACCOUNT_ID

3. **Stack Creation Failed**
   ```bash
   aws cloudformation describe-stack-events \
     --stack-name chat-microservices-infrastructure \
     --region us-east-1
   ```

4. **Service Not Starting**
   ```bash
   aws logs tail /ecs/chat-[service-name] --follow --region us-east-1
   ```

### Getting Help:
- Check [AWS-DEPLOYMENT.md](AWS-DEPLOYMENT.md) for detailed guide
- Review CloudFormation templates in `aws/cloudformation/`
- Check GitHub Actions logs for build errors

## Cost Optimization

- Services use minimal Fargate resources (256 CPU, 512 Memory)
- ECR lifecycle policies clean up old images
- Load balancer only runs when needed
- Consider using spot instances for development

## Security

- Services run in private subnets
- Only load balancer is internet-facing
- ECR images are scanned for vulnerabilities
- IAM roles follow least privilege principle

## What's Included

✅ **Complete Containerization** - All 6 services dockerized
✅ **CI/CD Pipeline** - GitHub Actions workflow
✅ **Infrastructure as Code** - CloudFormation templates
✅ **Service Discovery** - Internal DNS resolution
✅ **Load Balancing** - Application Load Balancer
✅ **Monitoring** - CloudWatch logs and metrics
✅ **Scaling** - Auto-scaling capabilities
✅ **Security** - VPC, security groups, IAM roles

---

Your chat microservices are now ready for production deployment on AWS! 🚀