@echo off
echo ================================================
echo Rwanda Eats Reserve - Quick Start
echo ================================================
echo.

REM Check if node_modules exists
if not exist "node_modules\" (
    echo [1/3] Installing dependencies...
    call npm install
    echo.
) else (
    echo [1/3] Dependencies already installed
    echo.
)

REM Check if database setup is needed
echo [2/3] Database Setup
echo.
echo Please make sure you have:
echo - MySQL server running
echo - Run init-database.sql in MySQL (see SETUP.md for instructions)
echo.
echo Press any key to continue after database setup...
pause > nul
echo.

REM Start the server
echo [3/3] Starting server...
echo.
echo Server will start on http://localhost:3000
echo.
echo Test accounts have been created during database setup.
echo Use password reset if you need to recover your account.
echo.
echo Press Ctrl+C to stop the server
echo.
npm start
