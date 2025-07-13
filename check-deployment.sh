#!/bin/bash

# Script to check deployment status
# Usage: ./check-deployment.sh [AWS_REGION]

set -e

AWS_REGION=${1:-us-east-1}

echo "🔍 Checking deployment status in region: $AWS_REGION"
echo "================================================="

# Check CloudFormation stacks
echo "📊 CloudFormation Stacks:"
aws cloudformation describe-stacks \
    --region "$AWS_REGION" \
    --query 'Stacks[?starts_with(StackName, `chat-microservices`)].{Name:StackName,Status:StackStatus}' \
    --output table 2>/dev/null || echo "No stacks found"

echo ""

# Check ECS cluster
echo "🏗️ ECS Cluster Status:"
aws ecs describe-clusters \
    --clusters chat-microservices-cluster \
    --region "$AWS_REGION" \
    --query 'clusters[0].{Name:clusterName,Status:status,ActiveServices:activeServicesCount,RunningTasks:runningTasksCount}' \
    --output table 2>/dev/null || echo "Cluster not found"

echo ""

# Check ECS services
echo "🚀 ECS Services:"
services=$(aws ecs list-services --cluster chat-microservices-cluster --region "$AWS_REGION" --query 'serviceArns' --output text 2>/dev/null)

if [ -n "$services" ]; then
    aws ecs describe-services \
        --cluster chat-microservices-cluster \
        --services $services \
        --region "$AWS_REGION" \
        --query 'services[].{Name:serviceName,Status:status,Running:runningCount,Desired:desiredCount,TaskDefinition:taskDefinition}' \
        --output table
else
    echo "No services found"
fi

echo ""

# Check Load Balancer
echo "⚖️ Load Balancer:"
aws elbv2 describe-load-balancers \
    --names chat-microservices-alb \
    --region "$AWS_REGION" \
    --query 'LoadBalancers[0].{Name:LoadBalancerName,State:State.Code,DNS:DNSName}' \
    --output table 2>/dev/null || echo "Load balancer not found"

echo ""

# Check Target Groups
echo "🎯 Target Groups Health:"
target_groups=$(aws elbv2 describe-target-groups \
    --region "$AWS_REGION" \
    --query 'TargetGroups[?starts_with(TargetGroupName, `chat-`)].TargetGroupArn' \
    --output text 2>/dev/null)

if [ -n "$target_groups" ]; then
    for tg in $target_groups; do
        tg_name=$(aws elbv2 describe-target-groups --target-group-arns $tg --region "$AWS_REGION" --query 'TargetGroups[0].TargetGroupName' --output text)
        echo "Target Group: $tg_name"
        aws elbv2 describe-target-health \
            --target-group-arn $tg \
            --region "$AWS_REGION" \
            --query 'TargetHealthDescriptions[].{Target:Target.Id,Port:Target.Port,Health:TargetHealth.State}' \
            --output table 2>/dev/null
        echo ""
    done
else
    echo "No target groups found"
fi

# Get application URLs
echo "🌐 Application URLs:"
lb_dns=$(aws cloudformation describe-stacks \
    --stack-name chat-microservices-ecs \
    --region "$AWS_REGION" \
    --query 'Stacks[0].Outputs[?OutputKey==`LoadBalancerDNS`].OutputValue' \
    --output text 2>/dev/null)

if [ -n "$lb_dns" ]; then
    echo "Frontend: http://$lb_dns"
    echo "API Gateway: http://$lb_dns/api"
    echo "Health Check: http://$lb_dns/actuator/health"
else
    echo "Load balancer DNS not available"
fi

echo ""
echo "✅ Status check complete!"

# Check recent deployments
echo ""
echo "📅 Recent ECS Deployments:"
aws ecs describe-services \
    --cluster chat-microservices-cluster \
    --services $(aws ecs list-services --cluster chat-microservices-cluster --region "$AWS_REGION" --query 'serviceArns' --output text 2>/dev/null) \
    --region "$AWS_REGION" \
    --query 'services[].{Service:serviceName,Status:deployments[0].status,CreatedAt:deployments[0].createdAt,UpdatedAt:deployments[0].updatedAt}' \
    --output table 2>/dev/null || echo "No services found"