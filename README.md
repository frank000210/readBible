# 一年讀經一遍 — Android 應用程式

## 📦 內容

| 檔案/資料夾 | 說明 |
|------------|------|
| `bible-app/` | 主要 PWA 應用程式（HTML/CSS/JS） |
| `bible-app-pwa.zip` | PWA 壓縮檔，供 PWABuilder.com 上傳使用 |
| `capacitor-project/` | Capacitor 專案骨架，可在本機建置 APK |
| `README.md` | 本說明檔 |

## 🌟 功能特色

1. **365 天讀經進度** — 內建從創世記到啟示錄的標準一年讀經計畫
2. **網上恢復本聖經連結** — 每天直接連到對應的恢復本聖經章節
   - 主要連結：恢復本網站每日讀經 (`bible_reading.php?f_day=N`)
   - 個別章節：連到書本綱目 (`outline_List.php?Bx=N`)
   - 可選 Bible.com 恢復本繁中版
3. **讀經記錄打勾** — 完成每天讀經後勾選，自動計算進度
4. **讀經感言記錄** — 每天可寫下感想，自動儲存
5. **離線可用** — Service Worker 快取，無網路時也能使用
6. **資料備份** — 可匯出/匯入 JSON 備份檔
7. **自訂起始日** — 可從任何日期開始讀經計畫
8. **完全本機儲存** — 所有資料只存在您的手機，不上傳任何伺服器

---

## 🚀 在手機上使用（三種方式）

### 方式 1：直接安裝 PWA（最快，免 APK） ⭐ 推薦

這是最簡單的方法，不需要 APK 檔：

1. 將 `bible-app/` 整個資料夾上傳到任何提供 HTTPS 的網站（GitHub Pages、Netlify、Cloudflare Pages 都免費）
   - **GitHub Pages**：建立新 repo → 上傳檔案 → Settings → Pages → 啟用 → 取得網址
   - **Netlify Drop**：到 https://app.netlify.com/drop → 拖入 `bible-app` 資料夾 → 即時取得網址
2. 在 Android 手機 Chrome 開啟該網址
3. 點選右上角選單 → **「安裝應用程式」** 或 **「加到主畫面」**
4. App 圖示會出現在主畫面，看起來和原生 App 一樣

✅ **優點**：免費、不需簽章、可隨時更新、5 分鐘內完成  
✅ 安裝後可離線使用

---

### 方式 2：使用 PWABuilder.com 線上產生 APK ⭐ 推薦

不需任何開發工具，5 分鐘產出可安裝的 APK：

1. 完成「方式 1」第 1 步（將 PWA 託管到 HTTPS 網站）
2. 前往 https://www.pwabuilder.com/
3. 輸入您的 PWA 網址 → 按 **Start**
4. 確認分數通過（PWA 可安裝）→ 點 **Package For Stores**
5. 選擇 **Android** → 設定：
   - Package ID：`tw.bible.reading`
   - App name：`一年讀經一遍`
   - Version：`1.0.0`
6. 點 **Generate Package** → 下載 zip
7. zip 中會有 **signed APK**（已簽章），可直接傳到手機安裝

📌 **注意**：Android 7+ 需在「設定 → 安全性 → 不明的來源」開啟安裝權限

---

### 方式 3：使用 Capacitor 本機建置 APK（適合開發者）

如果您有 Android 開發環境，使用本目錄附的 `capacitor-project/`：

#### 前置需求
- Node.js 18+
- Android Studio（包含 Android SDK 23+）
- JDK 11+

#### 步驟
```bash
cd capacitor-project

# 1. 安裝相依套件
npm install

# 2. 加入 Android 平台（會建立 android/ 資料夾）
npx cap add android

# 3. 同步 PWA 檔案到 Android 專案
npx cap sync android

# 4. 用 Android Studio 開啟（推薦）
npx cap open android
# 然後在 Android Studio 中：Build → Build Bundle(s)/APK(s) → Build APK(s)

# 或直接用 gradle 命令列建置
cd android
./gradlew assembleDebug      # 產生 debug APK（無需簽章，但僅限測試用）
./gradlew assembleRelease    # 產生 release APK（需簽章）

# APK 輸出位置：
# android/app/build/outputs/apk/debug/app-debug.apk
# android/app/build/outputs/apk/release/app-release.apk
```

#### 簽章 release APK（首次需要）
```bash
# 1. 產生 keystore
keytool -genkey -v -keystore bible.keystore -alias bible \
  -keyalg RSA -keysize 2048 -validity 10000

# 2. 用 apksigner 簽章
$ANDROID_HOME/build-tools/<version>/apksigner sign \
  --ks bible.keystore \
  --out signed.apk \
  app/build/outputs/apk/release/app-release-unsigned.apk
```

---

### 方式 4：使用 Bubblewrap（Google 官方 PWA→APK 工具）

```bash
# 安裝
npm i -g @bubblewrap/cli

# 初始化（需要您 PWA 的 manifest.json URL）
bubblewrap init --manifest=https://yoursite.com/manifest.json

# 建置 APK
bubblewrap build
```

---

## 🛠️ 在電腦上預覽 PWA

```bash
cd bible-app
# Python
python3 -m http.server 8000
# Node
npx http-server -p 8000
```
然後開啟 http://localhost:8000

---

## 📱 Android 手機 APK 安裝步驟

1. 將 APK 檔傳到手機（USB / Email / Google Drive / LINE）
2. 點選 APK 檔開啟
3. 若提示「未信任的來源」：
   - **Android 8+**：設定 → 應用程式 → 特殊存取 → 安裝未知應用程式 → 選擇開啟 APK 的 App（如檔案管理員）→ 允許
   - **Android 7 以下**：設定 → 安全性 → 開啟「不明的來源」
4. 點選「安裝」即可完成

---

## ⚙️ 自訂讀經來源

開啟 App → 設定 → 「聖經文本連結」可選：

- **恢復本網站 - 每日讀經 (f_day)**：使用恢復本官方每日讀經 URL（`recoveryversion.com.tw/Style0A/026/bible_reading.php?f_day=N`）
- **恢復本網站 - 書本綱目 (Bx)**：點擊章節時連到書本綱目頁
- **Bible.com - 恢復本繁中**：使用 Bible.com 的恢復本（免費 App、有語音朗讀）

---

## 🐛 疑難排解

**Q: 安裝 APK 時提示「應用程式未安裝」？**  
A: 通常是簽章問題。請使用 PWABuilder.com 產生的 signed APK，或自行簽章 release APK。Debug APK 應該可以直接安裝。

**Q: 為何資料消失了？**  
A: 資料儲存在瀏覽器 LocalStorage 中。清除瀏覽器資料、重新安裝 App 都會清空。建議定期到「設定 → 資料備份 → 匯出 JSON」備份。

**Q: 網上恢復本聖經頁面打不開？**  
A: 該網站 (`recoveryversion.com.tw`) 偶爾連線不穩，可在「設定」切換到 Bible.com 來源。

**Q: 想換成日曆式進度（每天從 1/1 開始）？**  
A: 到「設定 → 讀經起始日」設為 `2026-01-01` 並儲存。

---

## 📜 授權

- 本應用程式可自由修改、散佈
- 聖經恢復本內容版權屬於台灣福音書房，本 App 僅提供連結到其官網
