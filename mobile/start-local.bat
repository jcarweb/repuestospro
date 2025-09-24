@echo off
echo Starting Expo development server in local mode...
echo This will use your local network instead of tunneling
echo.

REM Clear any existing Metro cache
npx expo start --clear

echo.
echo If you need to access from a different device on the same network:
echo 1. Find your computer's IP address
echo 2. Use the Expo Go app and scan the QR code
echo 3. Or manually enter the IP address shown in the terminal
pause
