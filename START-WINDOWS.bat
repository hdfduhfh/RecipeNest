@echo off
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 goto missing
echo Open http://127.0.0.1:4175 in your browser.
node server.js
goto end
:missing
echo Please install Node.js 18 or later. See README.md and CHATBOT-SETUP.md.
:end
pause
