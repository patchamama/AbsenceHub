#!/bin/bash

# AbsenceHub Installer Script for Linux and macOS

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Print header
echo ""
echo -e "${BLUE}============================================================${NC}"
echo -e "${BLUE}AbsenceHub Installer - $(uname -s)${NC}"
echo -e "${BLUE}============================================================${NC}"
echo ""

# Detect OS
if [[ "$OSTYPE" == "linux-gnu"* ]]; then
    OS="Linux"
    PACKAGE_MANAGER=""

    if command -v apt &> /dev/null; then
        PACKAGE_MANAGER="apt"
    elif command -v yum &> /dev/null; then
        PACKAGE_MANAGER="yum"
    elif command -v brew &> /dev/null; then
        PACKAGE_MANAGER="brew"
    fi
elif [[ "$OSTYPE" == "darwin"* ]]; then
    OS="macOS"
    PACKAGE_MANAGER="brew"
else
    OS="Unknown"
fi

echo -e "${BLUE}Operating System: $OS${NC}"
echo -e "${BLUE}Package Manager: ${PACKAGE_MANAGER:-Not detected}${NC}"
echo ""

# Check Python
echo -e "${YELLOW}Checking Python...${NC}"
if command -v python3 &> /dev/null; then
    PYTHON_VERSION=$(python3 --version 2>&1 | awk '{print $2}')
    echo -e "${GREEN}✓ Python $PYTHON_VERSION found${NC}"
    PYTHON_CMD="python3"
elif command -v python &> /dev/null; then
    PYTHON_VERSION=$(python --version 2>&1 | awk '{print $2}')
    echo -e "${GREEN}✓ Python $PYTHON_VERSION found${NC}"
    PYTHON_CMD="python"
else
    echo -e "${RED}✗ Python 3.9+ not found${NC}"
    echo ""
    echo "Install Python:"
    if [ "$OS" == "macOS" ]; then
        echo "  brew install python@3.11"
    elif [ "$PACKAGE_MANAGER" == "apt" ]; then
        echo "  sudo apt-get install python3"
    elif [ "$PACKAGE_MANAGER" == "yum" ]; then
        echo "  sudo yum install python3"
    fi
    exit 1
fi

# Run the installer
echo ""
echo -e "${YELLOW}Running installer...${NC}"
echo ""

$PYTHON_CMD install.py

# Exit with the same code as the installer
exit $?
