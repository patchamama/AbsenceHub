#!/bin/bash

# AbsenceHub - Build Script
# This script builds the frontend and copies it to the backend static folder

set -e  # Exit on error

echo "🚀 Building AbsenceHub for deployment..."
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Get the directory where the script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
FRONTEND_DIR="$SCRIPT_DIR/frontend"
BACKEND_DIR="$SCRIPT_DIR/backend"
STATIC_DIR="$BACKEND_DIR/static"

# Step 1: Build frontend
echo -e "${BLUE}Step 1: Building frontend...${NC}"
cd "$FRONTEND_DIR"

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}Installing frontend dependencies...${NC}"
    npm install
fi

# Build production bundle
echo -e "${YELLOW}Creating production build...${NC}"
npm run build

echo -e "${GREEN}✓ Frontend build complete${NC}"
echo ""

# Step 2: Copy to backend
echo -e "${BLUE}Step 2: Copying build to backend...${NC}"

# Remove old static files
if [ -d "$STATIC_DIR" ]; then
    echo -e "${YELLOW}Removing old static files...${NC}"
    rm -rf "$STATIC_DIR"
fi

# Copy new build
echo -e "${YELLOW}Copying new build files...${NC}"
cp -r "$FRONTEND_DIR/dist" "$STATIC_DIR"

echo -e "${GREEN}✓ Build files copied to backend/static${NC}"
echo ""

# Step 3: Summary
echo -e "${GREEN}✅ Build complete!${NC}"
echo ""
echo "You can now run the integrated application:"
echo "  cd backend"
echo "  python run.py"
echo ""
echo "The application will be available at: http://localhost:5000"
echo ""
