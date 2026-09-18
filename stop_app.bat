@echo off
title Stop ThreatDNA-AI Services
echo Stopping ThreatDNA-AI Background Services...

:: Kill processes on port 8001 (Backend) and 5173 (Frontend)
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":8001" ^| findstr "LISTENING"') do (
    taskkill /F /PID %%a 2>nul
)

for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":5173" ^| findstr "LISTENING"') do (
    taskkill /F /PID %%a 2>nul
)

echo.
echo All ThreatDNA-AI services (Backend ^& Frontend) have been stopped.
timeout /t 2 /nobreak >nul
