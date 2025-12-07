# Guía de Instalación de Flutter

Flutter no está instalado en tu sistema. Aquí están las instrucciones para instalarlo en Fedora Linux.

## Instalación Rápida en Fedora

### 1. Descargar Flutter SDK

```bash
cd $HOME
wget https://storage.googleapis.com/flutter_infra_release/releases/stable/linux/flutter_linux_3.24.5-stable.tar.xz
tar xf flutter_linux_3.24.5-stable.tar.xz
```

### 2. Agregar Flutter al PATH

Edita tu `~/.bashrc` o `~/.zshrc`:

```bash
echo 'export PATH="$PATH:$HOME/flutter/bin"' >> ~/.bashrc
source ~/.bashrc
```

### 3. Instalar Dependencias

```bash
sudo dnf install clang cmake ninja-build gtk3-devel
```

### 4. Verificar Instalación

```bash
flutter doctor
```

---

## Alternativa: Usar Snap (MÁS FÁCIL)

```bash
sudo snap install flutter --classic
flutter doctor
```

---

## Configuración Android (para emulador/dispositivo)

### 1. Instalar Android Studio

```bash
# Descargar desde: https://developer.android.com/studio
# O usar snap:
sudo snap install android-studio --classic
```

### 2. Configurar Android SDK

1. Abre Android Studio
2. Ve a: **Settings > Appearance & Behavior > System Settings > Android SDK**
3. Instala:
   - Android SDK Platform-Tools
   - Android SDK Build-Tools
   - Android SDK Command-line Tools

### 3. Aceptar Licencias

```bash
flutter doctor --android-licenses
```

---

## Verificación Final

Ejecuta este comando y asegúrate de tener checkmarks (✓) en:

```bash
flutter doctor -v
```

Deberías ver:
- ✓ Flutter (Channel stable)
- ✓ Android toolchain
- ✓ Linux toolchain

---

## Crear Emulador Android (Opcional)

```bash
# Listar AVDs disponibles
flutter emulators

# Crear un emulador
flutter emulators --create

# O desde Android Studio:
# Tools > Device Manager > Create Device
```

---

## Después de Instalar

Una vez que Flutter esté instalado, vuelve aquí y ejecuta:

```bash
cd /home/cristhianM/Documentos/paginafullstack/EcommerceAI-Pro
flutter create --org com.ecommerceai --project-name ecommerce_app flutter_app
```

Esto creará el proyecto Flutter y continuaremos con la implementación.

---

## Recursos

- [Documentación oficial de Flutter](https://docs.flutter.dev/get-started/install/linux)
- [Android Studio](https://developer.android.com/studio)
- [Flutter Doctor](https://docs.flutter.dev/get-started/install/linux#run-flutter-doctor)
