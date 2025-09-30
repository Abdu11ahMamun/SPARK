# SPARK UI - Docker Deployment Guide

This document explains how to build and deploy the SPARK Angular UI application using Docker.

## Prerequisites

- Docker installed on your system
- Docker Compose (optional, but recommended)
- Node.js and npm (for local development)

## Quick Start

### Option 1: Using npm scripts (Recommended)

```bash
# Build Docker image
npm run docker:build

# Run the container
npm run docker:run

# Or use Docker Compose
npm run docker:compose
```

### Option 2: Using build scripts

**Windows:**
```cmd
build-docker.bat
```

**Linux/Mac:**
```bash
chmod +x build-docker.sh
./build-docker.sh
```

### Option 3: Manual Docker commands

```bash
# Build the image
docker build -t spark-ui:latest .

# Run the container
docker run -p 80:80 spark-ui:latest
```

## Docker Image Details

- **Base Image**: nginx:alpine (lightweight production server)
- **Build Process**: Multi-stage build (Node.js for building, Nginx for serving)
- **Port**: 80 (HTTP)
- **Size**: ~15-20MB (optimized for production)

## Environment Configuration

The Docker image uses the production environment configuration from:
- `src/environments/environment.prod.ts`

Current configuration:
- API URL: `http://172.18.144.37:8080`

## Deployment Options

### 1. Local Development/Testing

```bash
docker run -p 8080:80 spark-ui:latest
# Access at: http://localhost:8080
```

### 2. Production Deployment

```bash
docker run -d -p 80:80 --name spark-ui spark-ui:latest
# Access at: http://your-server-ip
```

### 3. Docker Compose (Recommended for production)

```bash
docker-compose up -d
# Access at: http://your-server-ip
```

### 4. Behind a Reverse Proxy

If deploying behind nginx/Apache:

```bash
docker run -d -p 3000:80 --name spark-ui spark-ui:latest
# Configure your reverse proxy to forward to localhost:3000
```

## Health Check

The container includes a health check endpoint:
- URL: `/health`
- Response: "healthy"

## Customization

### Custom Port

```bash
docker run -p 8080:80 spark-ui:latest
```

### Custom nginx Configuration

Modify `nginx.conf` before building the image.

### Environment Variables

To use different API endpoints, rebuild the image with updated environment files.

## Troubleshooting

### 1. Build Failures

- Ensure all dependencies are in package.json
- Check that the Angular build succeeds locally: `npm run build:prod`

### 2. Runtime Issues

- Check container logs: `docker logs <container-id>`
- Verify nginx configuration
- Ensure the backend API is accessible from the container

### 3. CORS Issues

- Verify the backend CORS configuration allows requests from your domain
- Check that the API URL in environment.prod.ts is correct

## Production Considerations

1. **SSL/HTTPS**: Use a reverse proxy (nginx, Apache, or cloud load balancer) for SSL termination
2. **CDN**: Consider using a CDN for static assets
3. **Monitoring**: Add monitoring for the container health
4. **Scaling**: Use Docker Swarm or Kubernetes for scaling
5. **Security**: Keep the base images updated

## File Structure

```
├── Dockerfile              # Multi-stage build configuration
├── nginx.conf              # Production nginx configuration
├── docker-compose.yml      # Compose configuration
├── .dockerignore          # Files to exclude from build context
├── build-docker.sh        # Linux/Mac build script
├── build-docker.bat       # Windows build script
└── DOCKER_README.md       # This file
```

## Commands Reference

```bash
# Build
docker build -t spark-ui:latest .

# Run
docker run -p 80:80 spark-ui:latest

# Run in background
docker run -d -p 80:80 --name spark-ui spark-ui:latest

# Stop
docker stop spark-ui
docker rm spark-ui

# View logs
docker logs spark-ui

# Shell into container (debugging)
docker exec -it spark-ui sh
```