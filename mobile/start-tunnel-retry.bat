@echo off
echo Starting Expo development server with tunnel retry...
echo This will attempt to create a tunnel with retry logic
echo.

REM Try tunnel mode with increased timeout
set EXPO_TUNNEL_TIMEOUT=60000
npx expo start --tunnel --max-workers 1

echo.
echo If tunnel fails, try running start-lan.bat instead
pause
