#!/bin/bash

# Script to create .env files from .env.example templates

echo "Setting up environment files..."

# Create apps/web/.env
cat > apps/web/.env << 'WEBEOF'
# Web Application Environment Variables
PORT=4200
HOST=localhost
WEBEOF

# Create apps/api/.env
cat > apps/api/.env << 'APIEOF'
# API Application Environment Variables
PORT=3333
NODE_ENV=development
APIEOF

# Create apps/pdf-service/.env
cat > apps/pdf-service/.env << 'PDFEOF'
# PDF Service Application Environment Variables
PORT=3334
NODE_ENV=development
PDFEOF

echo "✅ Environment files created successfully!"
echo ""
echo "Created files:"
echo "  - apps/web/.env"
echo "  - apps/api/.env"
echo "  - apps/pdf-service/.env"

