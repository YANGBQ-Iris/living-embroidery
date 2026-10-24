@echo off
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo Node.js 20+ is required. Please install Node.js first.
  pause
  exit /b 1
)
set PORT=5186
echo Living Embroidery: http://127.0.0.1:5186
echo Keep this window open. Press Ctrl+C to stop.
start "" "http://127.0.0.1:5186"
node scripts/serve.mjs
pause
