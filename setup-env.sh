#!/bin/bash

# Script to create .env files from .env.example templates

echo "Setting up environment files..."

# Create web/.env
cat > web/.env << 'WEBEOF'
# Web Application Environment Variables
PORT=4200
HOST=localhost
WEBEOF

# Create api/.env
cat > api/.env << 'APIEOF'
# API Application Environment Variables
PORT=3333
NODE_ENV=development
APIEOF

# Create pdf-service/.env
cat > pdf-service/.env << 'PDFEOF'
# PDF Service Application Environment Variables
PORT=3334
NODE_ENV=development
PDFEOF

echo "✅ Environment files created successfully!"
echo ""
echo "Created files:"
echo "  - web/.env"
echo "  - api/.env"
echo "  - pdf-service/.env"

