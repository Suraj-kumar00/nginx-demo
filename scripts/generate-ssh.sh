#!/bin/bash

SSL_DIR="nginx/ssl"
mkdir -p $SSL_DIR

echo "Generating self-signed SSL certificate for NGINX demo..."

# Generate self-signed certificate
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout $SSL_DIR/nginx-demo.key \
    -out $SSL_DIR/nginx-demo.crt \
    -subj "/C=US/ST=State/L=City/O=Organization/OU=IT/CN=nginx-demo.local"

echo "SSL certificates generated in $SSL_DIR/"
echo "Certificate: nginx-demo.crt"
echo "Private Key: nginx-demo.key"
