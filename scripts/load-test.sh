#!/bin/bash

echo "=== NGINX Load Balancing Test ==="
echo "Testing Round Robin Distribution..."

# Wait for services to be ready
sleep 5

# Test round robin distribution
for i in {1..6}; do
    echo "Request $i:"
    curl -s http://localhost/api/hello | grep -o '"server":"[^"]*"' || echo "Error connecting"
    sleep 0.5
done

echo -e "\n=== Testing Caching ==="
echo "First request (creates cache):"
time curl -s http://localhost/api/cached/hello > /dev/null 2>&1 || echo "Cache endpoint not available"

echo "Second request (from cache):"
time curl -s http://localhost/api/cached/hello > /dev/null 2>&1 || echo "Cache endpoint not available"

echo -e "\n=== Testing SSL Redirect ==="
echo "HTTP to HTTPS redirect test:"
curl -I http://localhost/health 2>/dev/null || echo "Health endpoint not available"

echo -e "\n=== Load test completed ==="
