# Expo Tunnel Troubleshooting Guide

## Problem: ngrok tunnel took too long to connect

This is a common issue with Expo's tunneling service. Here are several solutions:

## Quick Solutions

### 1. Use LAN Mode (Recommended)
Instead of tunneling, use your local network:
```bash
npx expo start --lan
```
This is faster and more reliable for local development.

### 2. Use Local Mode
For development on the same machine:
```bash
npx expo start --localhost
```

### 3. Clear Cache and Retry
```bash
npx expo start --clear --tunnel
```

## Alternative Startup Methods

### Windows Batch Files
- `start-lan.bat` - Uses LAN mode (recommended)
- `start-local.bat` - Uses localhost mode
- `start-tunnel-retry.bat` - Retries tunnel with increased timeout

### Manual Commands
```bash
# LAN mode (most reliable)
npx expo start --lan

# Local mode (same machine only)
npx expo start --localhost

# Tunnel with custom timeout
EXPO_TUNNEL_TIMEOUT=60000 npx expo start --tunnel

# Clear cache first
npx expo start --clear --lan
```

## Network Configuration

### For LAN Mode
1. Make sure your computer and mobile device are on the same WiFi network
2. Check Windows Firewall settings
3. Ensure no VPN is blocking local connections

### For Tunnel Mode
1. Check your internet connection
2. Try a different network (mobile hotspot)
3. Disable antivirus temporarily
4. Check if your ISP blocks tunneling services

## Common Issues and Solutions

### Issue: "Tunnel connected" but app doesn't load
- Try refreshing the Expo Go app
- Clear Expo Go app cache
- Restart the development server

### Issue: QR code doesn't work
- Use the manual IP address method
- Check if your phone's camera has permission to scan QR codes
- Try typing the URL manually in Expo Go

### Issue: Network timeout
- Switch to LAN mode instead of tunnel
- Check your router's settings
- Try using a mobile hotspot

## Best Practices

1. **Use LAN mode for local development** - It's faster and more reliable
2. **Use tunnel mode only when necessary** - For testing on different networks
3. **Keep your Expo CLI updated** - `npm install -g @expo/cli@latest`
4. **Clear cache regularly** - `npx expo start --clear`

## Emergency Fallback

If nothing works:
1. Build and install the app directly: `npx expo run:android` or `npx expo run:ios`
2. Use Expo's web version: `npx expo start --web`
3. Use a different development machine or network
