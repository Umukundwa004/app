@echo off
echo ================================================
echo MySQL Password Configuration Helper
echo ================================================
echo.
echo Common MySQL root passwords:
echo 1. Empty/No password (default XAMPP/WAMP)
echo 2. root
echo 3. password
echo 4. mysql
echo 5. Custom password
echo.
echo ================================================
echo INSTRUCTIONS:
echo ================================================
echo.
echo 1. Try to login to MySQL with command:
echo    mysql -u root -p
echo.
echo 2. When prompted, try these passwords:
echo    - Just press Enter (no password)
echo    - Type: root
echo    - Type: password
echo    - Type: mysql
echo.
echo 3. If you get in successfully, remember which password worked!
echo.
echo 4. Then update the password in server.js:
echo    Line 40: password: 'YOUR_PASSWORD_HERE'
echo.
echo ================================================
echo.
echo Press any key to test MySQL connection...
pause > nul
echo.
echo Testing MySQL connection...
mysql -u root -e "SELECT 'MySQL Connection Successful!' AS Status;"
echo.
if %errorlevel% equ 0 (
    echo SUCCESS! MySQL is accessible without password.
    echo Keep password: '' in server.js
) else (
    echo MySQL requires a password.
    echo Please try: mysql -u root -p
    echo Then update server.js with the correct password
)
echo.
pause
