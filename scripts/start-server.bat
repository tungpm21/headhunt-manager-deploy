@echo off
:: Kill any process holding port 3000
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":3000 " ^| findstr "LISTENING"') do (
    echo Killing PID %%a on port 3000...
    taskkill /f /pid %%a >nul 2>&1
)

:: Also kill all node processes just in case
taskkill /f /im node.exe >nul 2>&1

:: Wait for cleanup
timeout /t 2 /nobreak >nul

:: Lockfile check
if exist "d:\MH\Headhunt_pj\.next\server.lock" (
    echo [ERROR] Another instance is starting! Exiting...
    exit /b 1
)
type nul > "d:\MH\Headhunt_pj\.next\server.lock"

:: Start server from correct directory
cd /d "d:\MH\Headhunt_pj"
:: Set strict memory limit for Node.js (1.5GB) to prevent RAM spam
set NODE_OPTIONS=--max-old-space-size=1536

echo Starting npm run dev...
if not exist "d:\MH\Headhunt_pj\.next" mkdir "d:\MH\Headhunt_pj\.next"

:: Prevent port fallback by strictly assigning port 3000
:: Quay lại Webpack thay vì Turbopack để tiết kiệm RAM
npm run dev -- -p 3000 --webpack > "d:\MH\Headhunt_pj\.next\server.log" 2>&1

:: Remove lockfile if server gracefully shuts down
del /q "d:\MH\Headhunt_pj\.next\server.lock" >nul 2>&1

