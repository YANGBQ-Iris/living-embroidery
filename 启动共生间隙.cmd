@echo off
setlocal
cd /d "%~dp0"
where node >nul 2>nul
if not errorlevel 1 goto system_node
set "APP_NODE=%USERPROFILE%\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe"
if exist "%APP_NODE%" goto bundled_node
echo Node.js 20 or later is required. Please install Node.js and try again.
pause
exit /b 1
:system_node
node scripts\serve.mjs --open
goto finished
:bundled_node
"%APP_NODE%" scripts\serve.mjs --open
:finished
if not errorlevel 1 exit /b 0
echo Startup failed. Please keep this window open and share the error.
pause
exit /b 1
