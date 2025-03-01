@echo off
echo === Email Planner Docker Setup ===

REM Check if Docker is installed
where docker >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo Error: Docker is not installed. Please install Docker first.
    echo Visit https://docs.docker.com/get-docker/ for installation instructions.
    exit /b 1
)

REM Check if Docker Compose is installed
where docker-compose >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo Error: Docker Compose is not installed. Please install Docker Compose first.
    echo Visit https://docs.docker.com/compose/install/ for installation instructions.
    exit /b 1
)

REM Check if .env file exists
if not exist .env (
    echo Warning: .env file not found. Creating from example...
    if exist .env.example (
        copy .env.example .env
        echo Please edit the .env file with your credentials before continuing.
        echo Press Enter to continue after editing, or Ctrl+C to cancel...
        pause >nul
    ) else (
        echo Error: .env.example file not found. Cannot create .env file.
        exit /b 1
    )
)

REM Create data directory if it doesn't exist
if not exist data (
    echo Creating data directory...
    mkdir data
)

REM Build and start the containers
echo Building and starting containers...
docker-compose up -d --build

REM Check if containers are running
if %ERRORLEVEL% equ 0 (
    echo === Setup Complete ===
    echo The Email Planner application is now running!
    echo Access the application at: http://localhost
    echo.
    echo Useful commands:
    echo   docker-compose logs -f        # View logs
    echo   docker-compose down           # Stop the application
    echo   docker-compose up -d          # Start the application
    echo   docker-compose restart        # Restart the application
) else (
    echo Error: Failed to start containers. Check the logs for more information.
    exit /b 1
)

echo.
echo Press any key to exit...
pause >nul 