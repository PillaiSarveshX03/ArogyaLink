@echo off
title ArogyaLink Process Terminator
echo ========================================================
echo    TERMINATING ALL AROGYALINK SERVICES (CLIENT & SERVER)
echo ========================================================
echo.

:: 1. Free Port 3000 (Next.js Frontend)
echo [1/3] Terminating frontend service on port 3000...
powershell -NoProfile -ExecutionPolicy Bypass -Command ^
  "Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue | ForEach-Object { if ($_.OwningProcess -gt 0) { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue; Write-Host ('  + Terminated PID ' + $_.OwningProcess + ' (Port 3000)') } }"

:: 2. Free Port 5000 (Express Backend)
echo [2/3] Terminating backend service on port 5000...
powershell -NoProfile -ExecutionPolicy Bypass -Command ^
  "Get-NetTCPConnection -LocalPort 5000 -ErrorAction SilentlyContinue | ForEach-Object { if ($_.OwningProcess -gt 0) { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue; Write-Host ('  + Terminated PID ' + $_.OwningProcess + ' (Port 5000)') } }"

:: 3. Close any dedicated ArogyaLink or legacy command windows
echo [3/3] Closing ArogyaLink terminal windows...
taskkill /fi "WINDOWTITLE eq ArogyaLink*" /f >nul 2>&1
taskkill /fi "WINDOWTITLE eq MedCare+*" /f >nul 2>&1

echo.
echo ========================================================
echo   All ArogyaLink services on ports 3000 & 5000 stopped!
echo ========================================================
echo.
timeout /t 3
