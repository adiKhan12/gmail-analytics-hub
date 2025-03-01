#!/bin/bash

# Email Planner Docker Setup Script

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}=== Email Planner Docker Setup ===${NC}"

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${RED}Error: Docker is not installed. Please install Docker first.${NC}"
    echo "Visit https://docs.docker.com/get-docker/ for installation instructions."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}Error: Docker Compose is not installed. Please install Docker Compose first.${NC}"
    echo "Visit https://docs.docker.com/compose/install/ for installation instructions."
    exit 1
fi

# Check if .env file exists
if [ ! -f .env ]; then
    echo -e "${YELLOW}Warning: .env file not found. Creating from example...${NC}"
    if [ -f .env.example ]; then
        cp .env.example .env
        echo -e "${YELLOW}Please edit the .env file with your credentials before continuing.${NC}"
        echo -e "${YELLOW}Press Enter to continue after editing, or Ctrl+C to cancel...${NC}"
        read
    else
        echo -e "${RED}Error: .env.example file not found. Cannot create .env file.${NC}"
        exit 1
    fi
fi

# Create data directory if it doesn't exist
if [ ! -d "data" ]; then
    echo -e "${YELLOW}Creating data directory...${NC}"
    mkdir -p data
fi

# Build and start the containers
echo -e "${GREEN}Building and starting containers...${NC}"
docker-compose up -d --build

# Check if containers are running
if [ $? -eq 0 ]; then
    echo -e "${GREEN}=== Setup Complete ===${NC}"
    echo -e "${GREEN}The Email Planner application is now running!${NC}"
    echo -e "${GREEN}Access the application at: ${YELLOW}http://localhost${NC}"
    echo ""
    echo -e "${YELLOW}Useful commands:${NC}"
    echo -e "  ${GREEN}docker-compose logs -f${NC}        # View logs"
    echo -e "  ${GREEN}docker-compose down${NC}           # Stop the application"
    echo -e "  ${GREEN}docker-compose up -d${NC}          # Start the application"
    echo -e "  ${GREEN}docker-compose restart${NC}        # Restart the application"
else
    echo -e "${RED}Error: Failed to start containers. Check the logs for more information.${NC}"
    exit 1
fi 