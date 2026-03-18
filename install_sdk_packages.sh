#!/bin/bash

# قائمة الحزم المطلوبة
packages=(
  "platform-tools"
  "platforms;android-34"
  "build-tools;34.0.0"
  "emulator"
  "system-images;android-34;google_apis;x86_64"
  "cmdline-tools;latest"
  "ndk;25.2.9519653"
  "cmake;3.22.1"
  "sources;android-34"
)

# فحص كل حزمة وتثبيتها إذا لم تكن موجودة
for pkg in "${packages[@]}"; do
  if ! sdkmanager --list_installed | grep -q "^$pkg"; then
    echo "تثبيت أو تحديث: $pkg"
    sdkmanager "$pkg"
  else
    echo "موجود بالفعل: $pkg"
  fi
done
