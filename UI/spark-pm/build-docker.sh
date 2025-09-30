#!/bin/bash

# Build Angular application for production
echo "Building Angular application..."
npm run build:prod

# Build Docker image
echo "Building Docker image..."
docker build -t spark-ui:latest .

# Tag the image with version
VERSION=$(node -p "require('./package.json').version")
docker tag spark-ui:latest spark-ui:$VERSION

echo "Docker image built successfully!"
echo "Image tags:"
echo "  - spark-ui:latest"
echo "  - spark-ui:$VERSION"

echo ""
echo "To run the container:"
echo "  docker run -p 80:80 spark-ui:latest"
echo ""
echo "Or use docker-compose:"
echo "  docker-compose up"