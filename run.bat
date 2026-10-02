@echo off
title ArogyaLink Launcher
echo ========================================================
echo    AROGYALINK MEDICATION MANAGEMENT & ADHERENCE SYSTEM
echo ========================================================
echo.

:: Ensure Node.js is in PATH
set "PATH=C:\Program Files\nodejs;%PATH%"

echo [1/3] Starting Backend Server (Express + Supabase API on Port 5000)...
start "ArogyaLink Backend Server" cmd /k "title ArogyaLink Backend (Port 5000) && cd /d %~dp0server && set PATH=C:\Program Files\nodejs;%PATH% && npm run dev"

echo [2/3] Starting Frontend Client (Next.js on Port 3000)...
start "ArogyaLink Frontend Client" cmd /k "title ArogyaLink Client (Port 3000) && cd /d %~dp0client && set PATH=C:\Program Files\nodejs;%PATH% && npm run dev"

echo [3/3] Waiting for servers to initialize...
timeout /t 5 /nobreak >nul

echo Opening browser at http://localhost:3000 ...
start http://localhost:3000

echo.
echo ========================================================
echo   System running!
echo   - Frontend: http://localhost:3000
echo   - Backend:  http://localhost:5000/api/health
echo ========================================================
echo Close the terminal windows or run terminate_all.bat to stop.
pause
