@echo off
title Daily Document Generator
set "PATH=%USERPROFILE%\nodejs;%PATH%"
cd /d "%~dp0"

echo ========================================================
echo       Daily Document Generator — AI Test Case Tool
echo ========================================================
echo.
echo Starting server...
echo Access the application at: http://localhost:3000
echo.
node server/index.js
pause
