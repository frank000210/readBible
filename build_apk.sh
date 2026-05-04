#!/bin/bash
# ============================================================
# 一年讀經一遍 - APK 自動打包腳本
# 使用 Capacitor 在本機建置 Android APK
# ============================================================
# 前置需求：
#   - Node.js 18+
#   - Android Studio + Android SDK (API 33+)
#   - JDK 11+
# ============================================================

set -e

cd "$(dirname "$0")/capacitor-project"

echo "=== 步驟 1：安裝 npm 相依套件 ==="
npm install

echo ""
echo "=== 步驟 2：同步最新 PWA 檔案到 www/ ==="
cp ../bible-app/*.html www/
cp ../bible-app/*.css www/
cp ../bible-app/*.js www/
cp ../bible-app/*.png www/
cp ../bible-app/*.json www/

if [ ! -d "android" ]; then
  echo ""
  echo "=== 步驟 3：初次設定 Capacitor + Android 專案 ==="
  npx cap add android
else
  echo ""
  echo "=== 步驟 3：同步到 Android 專案 ==="
  npx cap sync android
fi

echo ""
echo "=== 步驟 4：使用 Gradle 建置 APK (Debug 版本) ==="
cd android
chmod +x ./gradlew 2>/dev/null || true
./gradlew assembleDebug

echo ""
echo "✅ 建置完成！"
echo ""
echo "APK 位置："
echo "  $(pwd)/app/build/outputs/apk/debug/app-debug.apk"
echo ""
echo "可直接傳到 Android 手機安裝（需開啟「不明的來源」）"
echo ""
echo "若要產生 release 版本，請執行："
echo "  ./gradlew assembleRelease"
echo "  並依說明簽章 APK"
