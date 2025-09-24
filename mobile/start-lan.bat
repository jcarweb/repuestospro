@echo off
echo Starting Expo development server in LAN mode...
echo This will make the server accessible on your local network
echo.

REM Start with LAN mode (no tunneling)
npx expo start --lan

echo.
echo The app should now be accessible on your local network
echo Check the terminal for the QR code and network address
pause
