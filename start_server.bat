@echo off
title ArogyaLink Backend (Port 5000)
set "PATH=C:\Program Files\nodejs;%PATH%"
cd /d "%~dp0server"
echo Starting Express + Supabase Backend API on http://localhost:5000 ...
npm run dev
pause
