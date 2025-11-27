@echo off
REM Import backup to TiDB Cloud
REM This batch file handles the password prompt correctly

set MYSQL_PATH=C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe
set DB_HOST=gateway01.eu-central-1.prod.aws.tidbcloud.com
set DB_PORT=4000
set DB_USER=3Nhz53ESuRkZyeE.root
set DB_NAME=rwanda_eats_reserve
set BACKUP_FILE=backup-utf8.sql

echo.
echo === TiDB Cloud Import ===
echo.
echo Checking backup file...

if not exist "%BACKUP_FILE%" (
    echo Creating UTF-8 backup from backup.sql...
    powershell -Command "(Get-Content backup.sql -Raw) -replace 'SET NAMES cp850;', 'SET NAMES utf8mb4;' | Set-Content %BACKUP_FILE% -Encoding UTF8"
    echo UTF-8 backup created.
)

echo.
echo Importing %BACKUP_FILE% to TiDB Cloud...
echo Host: %DB_HOST%
echo Port: %DB_PORT%
echo User: %DB_USER%
echo Database: %DB_NAME%
echo.
echo You will be prompted for the database password.
echo.

"%MYSQL_PATH%" -h %DB_HOST% -P %DB_PORT% -u %DB_USER% -p --ssl-mode=REQUIRED --default-character-set=utf8mb4 %DB_NAME% < %BACKUP_FILE%

if %ERRORLEVEL% EQU 0 (
    echo.
    echo Import completed successfully!
    echo.
) else (
    echo.
    echo Import failed with error code: %ERRORLEVEL%
    echo.
)

pause
