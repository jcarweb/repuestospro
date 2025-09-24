# 🍎 Configuración de Xcode para React Native iOS

## 📋 Prerrequisitos

### 1. Instalar Xcode
- Descargar desde: https://developer.apple.com/xcode/
- Instalar desde Mac App Store
- Aceptar licencias de desarrollador

### 2. Instalar Xcode Command Line Tools
```bash
xcode-select --install
```

### 3. Instalar CocoaPods
```bash
sudo gem install cocoapods
# o si tienes problemas con permisos:
sudo gem install cocoapods --user-install
```

### 4. Configurar Simulador iOS
1. Abrir Xcode
2. Ir a **Xcode > Preferences > Components**
3. Instalar simuladores iOS 15+ y iOS 16+
4. Crear simulador: **Window > Devices and Simulators**

## 🔧 Configuración del Proyecto

### 1. Configurar Info.plist
Editar `ios/PiezasYaMobile/Info.plist`:
```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>CFBundleDevelopmentRegion</key>
    <string>en</string>
    <key>CFBundleDisplayName</key>
    <string>PiezasYa</string>
    <key>CFBundleExecutable</key>
    <string>$(EXECUTABLE_NAME)</string>
    <key>CFBundleIdentifier</key>
    <string>$(PRODUCT_BUNDLE_IDENTIFIER)</string>
    <key>CFBundleInfoDictionaryVersion</key>
    <string>6.0</string>
    <key>CFBundleName</key>
    <string>$(PRODUCT_NAME)</string>
    <key>CFBundlePackageType</key>
    <string>APPL</string>
    <key>CFBundleShortVersionString</key>
    <string>1.0</string>
    <key>CFBundleSignature</key>
    <string>????</string>
    <key>CFBundleVersion</key>
    <string>1</string>
    <key>LSRequiresIPhoneOS</key>
    <true/>
    <key>NSAppTransportSecurity</key>
    <dict>
        <key>NSAllowsArbitraryLoads</key>
        <true/>
    </dict>
    <key>NSLocationWhenInUseUsageDescription</key>
    <string>Esta app necesita acceso a la ubicación para mostrar tiendas cercanas y entregas.</string>
    <key>NSCameraUsageDescription</key>
    <string>Esta app necesita acceso a la cámara para tomar fotos de productos.</string>
    <key>NSPhotoLibraryUsageDescription</key>
    <string>Esta app necesita acceso a la galería para seleccionar imágenes.</string>
    <key>UILaunchStoryboardName</key>
    <string>LaunchScreen</string>
    <key>UIRequiredDeviceCapabilities</key>
    <array>
        <string>armv7</string>
    </array>
    <key>UISupportedInterfaceOrientations</key>
    <array>
        <string>UIInterfaceOrientationPortrait</string>
        <string>UIInterfaceOrientationLandscapeLeft</string>
        <string>UIInterfaceOrientationLandscapeRight</string>
    </array>
    <key>UISupportedInterfaceOrientations~ipad</key>
    <array>
        <string>UIInterfaceOrientationPortrait</string>
        <string>UIInterfaceOrientationPortraitUpsideDown</string>
        <string>UIInterfaceOrientationLandscapeLeft</string>
        <string>UIInterfaceOrientationLandscapeRight</string>
    </array>
</dict>
</plist>
```

### 2. Configurar Podfile
Editar `ios/Podfile`:
```ruby
require_relative '../node_modules/react-native/scripts/react_native_pods'
require_relative '../node_modules/@react-native-community/cli-platform-ios/native_modules'

platform :ios, '11.0'
prepare_react_native_project!

target 'PiezasYaMobile' do
  config = use_native_modules!

  use_react_native!(
    :path => config[:reactNativePath],
    :hermes_enabled => true,
    :fabric_enabled => false,
    :flipper_configuration => FlipperConfiguration.enabled,
    :app_clip_paths => [],
    :new_arch_enabled => false
  )

  # Permisos
  permissions_path = '../node_modules/react-native-permissions/ios'
  pod 'Permission-Camera', :path => "#{permissions_path}/Camera"
  pod 'Permission-LocationWhenInUse', :path => "#{permissions_path}/LocationWhenInUse"
  pod 'Permission-PhotoLibrary', :path => "#{permissions_path}/PhotoLibrary"

  target 'PiezasYaMobileTests' do
    inherit! :complete
    # Pods for testing
  end

  post_install do |installer|
    react_native_post_install(
      installer,
      config[:reactNativePath],
      :mac_catalyst_enabled => false
    )
    
    # Configurar deployment target
    installer.pods_project.targets.each do |target|
      target.build_configurations.each do |config|
        config.build_settings['IPHONEOS_DEPLOYMENT_TARGET'] = '11.0'
      end
    end
  end
end
```

### 3. Configurar AppDelegate
Editar `ios/PiezasYaMobile/AppDelegate.mm`:
```objc
#import "AppDelegate.h"
#import <React/RCTBundleURLProvider.h>
#import <React/RCTRootView.h>
#import <React/RCTAppSetupUtils.h>

@implementation AppDelegate

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
  RCTAppSetupPrepareApp(application);

  RCTBridge *bridge = [[RCTBridge alloc] initWithDelegate:self launchOptions:launchOptions];

  RCTRootView *rootView = [[RCTRootView alloc] initWithBridge:bridge
                                                   moduleName:@"PiezasYaMobile"
                                            initialProperties:nil];

  if (@available(iOS 13.0, *)) {
    rootView.backgroundColor = [UIColor systemBackgroundColor];
  } else {
    rootView.backgroundColor = [UIColor whiteColor];
  }

  self.window = [[UIWindow alloc] initWithFrame:[UIScreen mainScreen].bounds];
  UIViewController *rootViewController = [UIViewController new];
  rootViewController.view = rootView;
  self.window.rootViewController = rootViewController;
  [self.window makeKeyAndVisible];
  return YES;
}

- (NSURL *)sourceURLForBridge:(RCTBridge *)bridge
{
#if DEBUG
  return [[RCTBundleURLProvider sharedSettings] jsBundleURLForBundleRoot:@"index"];
#else
  return [[NSBundle mainBundle] URLForResource:@"main" withExtension:@"jsbundle"];
#endif
}

@end
```

### 4. Configurar Build Settings
En Xcode, configurar:
- **Deployment Target**: iOS 11.0
- **Bundle Identifier**: com.piezasya.mobile
- **Display Name**: PiezasYa
- **Version**: 1.0
- **Build**: 1

## 🚀 Comandos de Build

### Debug
```bash
# Instalar dependencias
cd ios
pod install
cd ..

# Ejecutar en simulador
npx react-native run-ios

# Ejecutar en dispositivo específico
npx react-native run-ios --device "iPhone 14"
```

### Release
```bash
# Build para App Store
cd ios
xcodebuild -workspace PiezasYaMobile.xcworkspace -scheme PiezasYaMobile -configuration Release -destination generic/platform=iOS -archivePath PiezasYaMobile.xcarchive archive

# Exportar para App Store
xcodebuild -exportArchive -archivePath PiezasYaMobile.xcarchive -exportPath ./build -exportOptionsPlist ExportOptions.plist
```

### 5. Configurar ExportOptions.plist
Crear `ios/ExportOptions.plist`:
```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>method</key>
    <string>app-store</string>
    <key>teamID</key>
    <string>YOUR_TEAM_ID</string>
    <key>uploadBitcode</key>
    <false/>
    <key>uploadSymbols</key>
    <true/>
    <key>compileBitcode</key>
    <false/>
</dict>
</plist>
```

## 🔍 Troubleshooting

### Error: "CocoaPods not found"
```bash
# Instalar CocoaPods
sudo gem install cocoapods
# o con Homebrew
brew install cocoapods
```

### Error: "Pod install failed"
```bash
# Limpiar cache
pod cache clean --all
# Reinstalar
cd ios
rm -rf Pods Podfile.lock
pod install
```

### Error: "Metro bundler not found"
```bash
# Iniciar Metro
npx react-native start
# En otra terminal
npx react-native run-ios
```

### Error: "Simulator not found"
```bash
# Listar simuladores
xcrun simctl list devices
# Iniciar simulador
xcrun simctl boot "iPhone 14"
```

### Error: "Code signing"
1. Abrir Xcode
2. Seleccionar proyecto
3. Ir a **Signing & Capabilities**
4. Seleccionar **Automatically manage signing**
5. Seleccionar **Team**

## 📱 Testing

### 1. Simulador
```bash
# Listar simuladores disponibles
xcrun simctl list devices

# Iniciar simulador específico
xcrun simctl boot "iPhone 14"

# Ejecutar app
npx react-native run-ios
```

### 2. Dispositivo Físico
1. Conectar iPhone/iPad
2. Confiar en el desarrollador
3. Ejecutar `npx react-native run-ios --device`

## 🎯 Configuración de Certificados

### 1. Apple Developer Account
- Crear cuenta en: https://developer.apple.com
- Pagar membresía anual ($99 USD)

### 2. Certificados de Desarrollo
1. Abrir Xcode
2. Ir a **Xcode > Preferences > Accounts**
3. Agregar Apple ID
4. Descargar certificados automáticamente

### 3. Provisioning Profiles
1. En Xcode, seleccionar proyecto
2. Ir a **Signing & Capabilities**
3. Seleccionar **Automatically manage signing**
4. Xcode creará automáticamente los profiles

## 🚀 Deployment

### 1. App Store Connect
1. Crear app en: https://appstoreconnect.apple.com
2. Configurar información de la app
3. Subir build desde Xcode

### 2. TestFlight
1. Subir build a App Store Connect
2. Configurar testing interno
3. Invitar testers

### 3. App Store
1. Completar información de la app
2. Configurar precios
3. Enviar para revisión

## 🎯 Próximos Pasos

1. ✅ Instalar Xcode y herramientas
2. ✅ Configurar proyecto
3. ✅ Instalar dependencias
4. 🔄 Probar build debug
5. 🔄 Probar en simulador
6. 🔄 Probar en dispositivo físico
7. 🔄 Configurar certificados
8. 🔄 Deploy a App Store
