@echo off
title ArogyaLink Client (Port 3000)
set "PATH=C:\Program Files\nodejs;%PATH%"
cd /d "%~dp0client"
echo Starting Next.js Frontend Client on http://localhost:3000 ...
npm run dev
pause
