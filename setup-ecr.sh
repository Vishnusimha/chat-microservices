#!/bin/bash

# Script to create ECR repositories for Chat Microservices
# Usage: ./setup-ecr.sh [AWS_REGION]

set -e

AWS_REGION=${1:-us-east-1}

echo "🚀 Setting up ECR repositories in region: $AWS_REGION"

# Array of repository names
repositories=(
    "chat-discovery-server"
    "chat-api-gateway"
    "chat-users-service"
    "chat-discussion-service"
    "chat-feed-service"
    "chat-frontend"
)

# Create repositories
for repo in "${repositories[@]}"; do
    echo "Creating repository: $repo"
    
    # Check if repository exists
    if aws ecr describe-repositories --repository-names "$repo" --region "$AWS_REGION" >/dev/null 2>&1; then
        echo "✅ Repository $repo already exists"
    else
        # Create repository
        aws ecr create-repository \
            --repository-name "$repo" \
            --region "$AWS_REGION" \
            --image-scanning-configuration scanOnPush=true \
            --image-tag-mutability MUTABLE
        
        echo "✅ Created repository: $repo"
    fi
    
    # Set lifecycle policy to keep only 5 images
    aws ecr put-lifecycle-configuration \
        --repository-name "$repo" \
        --region "$AWS_REGION" \
        --lifecycle-policy-text '{
            "rules": [
                {
                    "rulePriority": 1,
                    "description": "Keep last 5 images",
                    "selection": {
                        "tagStatus": "any",
                        "countType": "imageCountMoreThan",
                        "countNumber": 5
                    },
                    "action": {
                        "type": "expire"
                    }
                }
            ]
        }' >/dev/null
    
    echo "✅ Set lifecycle policy for: $repo"
done

echo ""
echo "🎉 ECR repositories setup complete!"
echo ""
echo "📋 Created repositories:"
for repo in "${repositories[@]}"; do
    echo "  - $repo"
done

echo ""
echo "🔑 Next steps:"
echo "1. Configure GitHub secrets:"
echo "   - AWS_ACCESS_KEY_ID"
echo "   - AWS_SECRET_ACCESS_KEY"
echo "   - AWS_ACCOUNT_ID"
echo ""
echo "2. Deploy infrastructure:"
echo "   aws cloudformation deploy \\"
echo "     --template-file aws/cloudformation/infrastructure.yaml \\"
echo "     --stack-name chat-microservices-infrastructure \\"
echo "     --capabilities CAPABILITY_IAM \\"
echo "     --region $AWS_REGION"
echo ""
echo "3. Push your code to trigger the CI/CD pipeline!"