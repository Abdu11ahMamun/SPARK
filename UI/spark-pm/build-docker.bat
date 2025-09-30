@echo off

REM Build Angular application for production
echo Building Angular application...
call npm run build:prod
if %errorlevel% neq 0 (
    echo Build failed!
    exit /b 1
)

REM Build Docker image
echo Building Docker image...
docker build -t spark-ui:latest .
if %errorlevel% neq 0 (
    echo Docker build failed!
    exit /b 1
)

REM Get version from package.json
for /f "tokens=2 delims=:, " %%a in ('type package.json ^| findstr "version"') do set VERSION=%%~a
set VERSION=%VERSION:"=%

REM Tag the image with version
docker tag spark-ui:latest spark-ui:%VERSION%

echo Docker image built successfully!
echo Image tags:
echo   - spark-ui:latest
echo   - spark-ui:%VERSION%

echo.
echo To run the container:
echo   docker run -p 80:80 spark-ui:latest
echo.
echo Or use docker-compose:
echo   docker-compose up