@echo off
:: Kill processes on port 3000 only
for /f "tokens=5" %%a in ('netstat -aon 2^>nul ^| findstr ":3000 " ^| findstr "LISTENING"') do (
    taskkill /f /pid %%a >nul 2>&1
)
:: Brief wait for port release
timeout /t 1 /nobreak >nul

:: Start server from correct directory
cd /d "d:\MH\Headhunt_pj"
set NODE_OPTIONS=--max-old-space-size=1536

if not exist "d:\MH\Headhunt_pj\.next" mkdir "d:\MH\Headhunt_pj\.next"

npm run dev -- -p 3000 --webpack > "d:\MH\Headhunt_pj\.next\server.log" 2>&1
