#!/bin/bash

echo "Setting up NGINX Demo Project..."

# Create necessary directories
mkdir -p nginx/ssl nginx/logs nginx/conf.d
mkdir -p frontend/static/{css,js,images}

# Generate SSL certificates
if [ -f "./scripts/generate-ssl.sh" ]; then
    chmod +x ./scripts/generate-ssl.sh
    ./scripts/generate-ssl.sh
else
    echo "Warning: generate-ssl.sh not found, skipping SSL setup"
fi

# Make scripts executable
chmod +x scripts/*.sh 2>/dev/null || echo "Warning: No script files to make executable"

# Stop any existing containers
echo "Stopping existing containers..."
docker-compose down 2>/dev/null || true

# Remove orphaned containers
docker-compose down --remove-orphans 2>/dev/null || true

# Build and start services
echo "Building Docker images..."
docker-compose build

echo "Starting services..."
docker-compose up -d

# Wait for services to be ready
echo "Waiting for services to start..."
sleep 15

# Test basic connectivity
echo "Testing connectivity..."

# Test HTTP health check
if curl -s http://localhost/health > /dev/null 2>&1; then
    echo "✓ HTTP health check passed"
else
    echo "✗ HTTP health check failed"
    echo "Checking NGINX container status..."
    docker-compose ps
    echo "Checking NGINX logs..."
    docker-compose logs nginx | tail -10
fi

# Test HTTPS health check (if SSL is configured)
if curl -s https://localhost/health -k > /dev/null 2>&1; then
    echo "✓ HTTPS health check passed"
else
    echo "✗ HTTPS health check failed (this is normal if SSL is not configured)"
fi

echo "Setup complete! Access the demo at:"
echo "HTTP:  http://localhost"
echo "HTTPS: https://localhost (accept self-signed certificate)"
echo "Dashboard: http://localhost/frontend/"

# Run load test if available
if [ -f "./scripts/load-test.sh" ]; then
    echo -e "\nRunning load balancing test..."
    ./scripts/load-test.sh
else
    echo "Warning: load-test.sh not found, skipping load test"
fi

echo -e "\nContainer status:"
docker-compose ps

echo -e "\nTo view logs: docker-compose logs"
echo "To stop: docker-compose down"
