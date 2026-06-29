@echo off
echo ==============================================
echo   Zapusk MK Auto Korea API (Localtunnel)
echo ==============================================

cd backend

:: Start the NestJS backend in a new command window
echo 1. Zapusk API servera (NestJS)...
start "NestJS API" cmd /c "npm run start:dev"

:: Wait a few seconds for the backend to start
timeout /t 5

:: Start localtunnel
echo 2. Sozdanie zashishennogo tunnelya (Localtunnel)...
npx localtunnel --port 3000 --subdomain mk-auto-api

pause
