# Guía de Construcción Híbrida (Cordova)

Este proyecto está configurado para utilizar **Cordova** como motor nativo. A continuación se detallan los requisitos previos y comandos exactos para compilar en Android e iOS a nivel empresarial.

## 1. Requisitos Previos (Prerequisites)

### Para Android
- **Android Studio**: Debe estar instalado (versión Hedgehog o superior recomendada).
- **Android SDK**: Asegúrate de tener instalado el SDK para la API 33/34.
- **Variables de Entorno**:
  - `ANDROID_HOME` apuntando al SDK (`C:\Users\TU_USUARIO\AppData\Local\Android\Sdk`).
  - Agregar a la variable `PATH`: `%ANDROID_HOME%\tools`, `%ANDROID_HOME%\platform-tools` y la ruta de Java JDK (versión 17 recomendada para Cordova actual).
- **Gradle**: Tener Gradle en el `PATH` o usar el *wrapper* incluido.

### Para iOS (Requiere macOS)
- **Xcode**: Instalado desde la Mac App Store.
- **Command Line Tools**: Ejecutar `xcode-select --install`.
- **CocoaPods**: Requerido para muchos plugins de iOS. Ejecutar `sudo gem install cocoapods`.
- **Apple Developer Account**: Necesaria para firmar la aplicación y probarla en dispositivos físicos.

---

## 2. Inicialización y Plugins Nativos
Como utilizamos Ionic Storage para almacenamiento local seguro (SQLite), debemos asegurarnos de que el plugin de base de datos nativa esté agregado antes de construir:

```bash
# Agregar el plugin de SQLite para Cordova
ionic cordova plugin add cordova-sqlite-storage
```

---

## 3. Agregar Plataformas

Abre una terminal en la raíz del proyecto y ejecuta los siguientes comandos exactos para preparar las carpetas nativas:

```bash
# Compilar los archivos web (Angular) hacia la carpeta www/
ionic build

# Agregar plataforma Android
ionic cordova platform add android

# Agregar plataforma iOS (Solo Mac)
ionic cordova platform add ios
```

---

## 4. Ejecutar en Emulador o Dispositivo Conectado

Una vez agregadas las plataformas, puedes correr la aplicación directamente:

```bash
# Ejecutar en Android (Lanzará el emulador o instalará en un dispositivo USB conectado)
ionic cordova run android

# Ejecutar en iOS
ionic cordova run ios
```
*Tip de desarrollo*: Usa el flag `-l` (`ionic cordova run android -l`) para Live Reload.

---

## 5. Proceso Exportable: Generar APK Firmado (Android)

Para subir a Google Play Store o entregar una prueba técnica en formato APK/AAB:

1. **Generar un Keystore de firma** (Solo la primera vez):
   ```bash
   keytool -genkey -v -keystore mi-release-key.keystore -alias mi_alias -keyalg RSA -keysize 2048 -validity 10000
   ```
2. **Compilar el Release de Cordova**:
   ```bash
   ionic cordova build android --release
   ```
3. **Firmar el APK**:
   ```bash
   jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore mi-release-key.keystore platforms/android/app/build/outputs/apk/release/app-release-unsigned.apk mi_alias
   ```
4. **Optimizar (Zipalign)**:
   ```bash
   zipalign -v 4 platforms/android/app/build/outputs/apk/release/app-release-unsigned.apk TodoApp.apk
   ```

---

## 6. Proceso Exportable: Generar IPA (iOS)

Para enviar a TestFlight o la App Store:

1. **Compilar el proyecto para iOS**:
   ```bash
   ionic cordova build ios --release
   ```
2. **Abrir el Workspace en Xcode**:
   Ve a la carpeta `platforms/ios/` y abre el archivo `MyApp.xcworkspace`.
3. **Configurar Firma**:
   En Xcode, selecciona el proyecto raíz -> Pestaña *Signing & Capabilities* -> Selecciona tu equipo (*Team*) de Apple Developer.
4. **Archive y Exportar**:
   - En el menú superior selecciona tu dispositivo objetivo (o "Any iOS Device (arm64)").
   - Ve a **Product > Archive**.
   - Al finalizar, el *Organizer* se abrirá. Selecciona **Distribute App** y sigue los pasos para exportar el archivo `.ipa`.
