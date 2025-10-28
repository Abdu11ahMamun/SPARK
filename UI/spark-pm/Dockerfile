
# Multi-stage build for Angular application
FROM node:20-alpine AS build

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (including dev dependencies for build)
RUN npm ci

# Install Angular CLI globally
RUN npm install -g @angular/cli

# Copy source code
COPY . .

# Build the Angular app for production
RUN npm run build:prod

# Production stage
FROM nginx:alpine

# Copy built application from build stage
# For Angular 17+, the output is typically in dist/[project-name]/browser
COPY --from=build /app/dist/spark-pm/browser /usr/share/nginx/html

# Copy runtime environment template & default file
COPY public/runtime-env.template.js /usr/share/nginx/html/
COPY public/runtime-env.js /usr/share/nginx/html/
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Expose port 80
EXPOSE 80

# Start with custom entrypoint that injects runtime env
ENTRYPOINT ["/entrypoint.sh"]