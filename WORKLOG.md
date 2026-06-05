# TokenMeter 網站開發工作記錄

## 專案概述
- **專案名稱**: TokenMeter 本地 LLM API 監控工具銷售/反饋網站
- **專案路徑**: `~/Desktop/llm-monitor-sales/`
- **技術棧**: React 19 + Vite + Tailwind CSS v4 + Express + TypeScript + SQLite
- **開發時間**: 2026-06-05

---

## 第一階段：基礎架構搭建

### 完成內容
1. **全端專案初始化**
   - 前端：React 19 + Vite + Tailwind CSS v4
   - 後端：Express + TypeScript + SQLite3
   - 資料庫：SQLite（本地檔案儲存）

2. **Apple 風格深色主題**
   - `neutral-950` 深色背景
   - 玻璃態導航欄（`backdrop-blur-xl`）
   - 藍色漸變強調色（blue → cyan → teal）
   - 圓角設計（`rounded-2xl`, `rounded-3xl`）

3. **7 語言國際化系統**
   - 繁體中文 (zh)、English (en)、日本語 (ja)、한국어 (ko)
   - Français (fr)、Deutsch (de)、Español (es)
   - `I18nContext` + `useI18n` + `translations.ts`
   - 手動翻譯鍵值對（不依賴 i18n 函式庫）

4. **首頁設計**
   - Hero 區：產品名稱 + 標語 + CTA 按鈕
   - 產品展示：3 張截圖（overview, settings, floating）
   - 6 個功能卡片（全自動監控、即時費用計算、100%本地運作等）
   - 頁尾

---

## 第二階段：用戶系統與授權管理

### 完成內容
1. **用戶認證系統**
   - 註冊頁（姓名、電子郵件、密碼）
   - 登入頁（電子郵件、密碼）
   - JWT Token 認證
   - 密碼 bcrypt 加密儲存

2. **儀表板（Dashboard）**
   - 顯示用戶資訊
   - 自動生成 14 天試用授權碼
   - 授權碼複製功能

3. **後端 API**
   - `POST /api/auth/register`
   - `POST /api/auth/login`
   - `GET /api/licenses/my`
   - `POST /api/licenses/verify`
   - `POST /api/licenses/activate`

---

## 第三階段：免費模式轉型 + 留言板

### 完成內容
1. **從收費改為免費模式**
   - 移除「$4.99 定價區」
   - Hero CTA 改為「免費下載使用」+「留下反饋」
   - 註冊頁副標題改為「免費開始使用 TokenMeter」
   - 文案強調「完全免費使用，開源精神」

2. **儀表板重新設計**
   - 移除「授權碼 / License Key」顯示
   - 改為「歡迎回來」歡迎卡片
   - 新增「留言反饋」快速入口
   - 新增「下載軟體」卡片（Coming Soon）

3. **留言板功能（Feedback Board）**
   - 前端頁面：`/guestbook`
   - 表單：姓名 + 電子郵件 + 留言內容
   - 成功/錯誤提示
   - 顯示所有歷史留言（含時間戳）
   - 空狀態提示
   - 後端 API：`GET /api/guestbook`, `POST /api/guestbook`
   - SQLite 資料表：`guestbook`

4. **導航欄更新**
   - 新增「留言板」連結
   - 頁尾新增「留言板」連結

---

## 第四階段：語言系統改進 + 訂閱通知 + 管理員後台

### 完成內容

#### 1. 語言系統改進
- **移除所有國旗 emoji**（🇹🇼 🇺🇸 🇯🇵 等）
  - `LOCALES` 陣列移除 `flag` 屬性
  - `LanguageSwitcher` 只顯示純文字語言名稱
- **預設語言改為英文**
  - `getInitialLocale()` 無儲存語言時回傳 `'en'`
- **自動偵測瀏覽器語言**
  - `navigator.language` 自動匹配
  - 映射表：`zh`, `zh-CN`, `zh-TW` → 繁中；`en`, `en-US` → English；`ja`, `jp` → 日本語 等
  - 不支援的語言自動 fallback 到英文

#### 2. 訂閱通知系統
- **首頁新增訂閱區塊**（Features 與 CTA 之間）
  - 姓名（選填）+ 電子郵件輸入框
  - 訂閱成功後顯示綠色確認訊息
  - 重複訂閱會提示「此電子郵件已訂閱」
  - 隱私聲明：「我們不會發送垃圾郵件，隨時可以取消訂閱」
- **後端 API**
  - `POST /api/subscriptions` — 訂閱（含 email 格式驗證）
  - `GET /api/subscriptions/unsubscribe?email=...` — 取消訂閱
- **SQLite 資料表**：`subscriptions`（id, email, name, active, created_at）

#### 3. 管理員後台（Admin Dashboard）
- **獨立管理頁面**：`/admin`
  - 受 JWT 認證 + `role === 'admin'` 雙重保護
  - 無權限者顯示「Permission denied: Admin access required」
- **統計卡片**（4 個）
  - 總用戶數、留言數、訂閱者數、通知數
- **四大分頁**
  - **總覽（Overview）**：發送通知表單
    - 通知標題輸入框
    - 通知內容輸入框
    - 發送按鈕（儲存至資料庫）
  - **留言（Entries）**：所有留言板內容列表
  - **訂閱者（Subscribers）**：訂閱者表格（含狀態：Active/Inactive）
  - **通知記錄（Notifications）**：歷史通知列表（含收件人數）
- **後端 API**
  - `GET /api/admin/stats` — 統計數據
  - `GET /api/admin/users` — 用戶列表
  - `GET /api/admin/entries` — 留言列表
  - `GET /api/admin/subscribers` — 訂閱者列表
  - `GET /api/admin/notifications` — 通知記錄
  - `POST /api/notifications` — 發送通知（儲存至資料庫）
- **安全機制**
  - `authMiddleware` — JWT Token 驗證
  - `adminMiddleware` — 檢查 `role === 'admin'`
  - 管理員 API 全部受雙重保護

---

## 檔案結構

```
~/Desktop/llm-monitor-sales/
├── frontend/
│   ├── src/
│   │   ├── main.tsx
│   │   ├── App.tsx
│   │   ├── components/
│   │   │   └── LanguageSwitcher.tsx    # 無國旗語言切換器
│   │   ├── i18n/
│   │   │   ├── I18nContext.tsx         # 自動偵測瀏覽器語言
│   │   │   └── translations.ts         # 7語言翻譯（含admin/subscribe）
│   │   └── pages/
│   │       ├── Home.tsx                # 首頁（含訂閱區塊）
│   │       ├── Login.tsx               # 登入頁
│   │       ├── Register.tsx            # 註冊頁
│   │       ├── Dashboard.tsx           # 用戶中心
│   │       ├── Guestbook.tsx           # 留言板
│   │       └── AdminDashboard.tsx      # 管理員後台
│   ├── public/
│   │   ├── app-icon.png
│   │   └── screenshots/
│   │       ├── overview.png
│   │       ├── settings.png
│   │       └── floating.png
│   └── package.json
├── backend/
│   ├── src/
│   │   ├── index.ts                    # Express 主入口
│   │   ├── database.ts                 # SQLite 初始化（含所有表）
│   │   ├── middleware/
│   │   │   └── auth.ts                 # authMiddleware + adminMiddleware
│   │   └── routes/
│   │       ├── auth.ts                 # 登入/註冊
│   │       ├── licenses.ts             # 授權管理
│   │       ├── guestbook.ts            # 留言板 API
│   │       ├── subscriptions.ts        # 訂閱 API
│   │       ├── admin.ts                # 管理員資料 API
│   │       └── notifications.ts        # 通知發送 API
│   └── package.json
├── database/
│   └── app.db                          # SQLite 資料庫
├── DEPLOY.md                           # 部署指南
├── README.md
└── package.json
```

---

## 資料庫 Schema

```sql
-- 用戶表
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  role TEXT DEFAULT 'user',          -- 'user' | 'admin'
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 授權表
CREATE TABLE licenses (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,
  license_key TEXT NOT NULL UNIQUE,
  plan TEXT NOT NULL DEFAULT 'trial',
  status TEXT NOT NULL DEFAULT 'trial',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  activated_at DATETIME,
  expires_at DATETIME,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 訂單表
CREATE TABLE orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  license_id INTEGER,
  plan TEXT NOT NULL,
  amount INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (license_id) REFERENCES licenses(id)
);

-- 留言板
CREATE TABLE guestbook (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 訂閱通知
CREATE TABLE subscriptions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL UNIQUE,
  name TEXT,
  active INTEGER DEFAULT 1,          -- 1 = active, 0 = unsubscribed
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 通知記錄
CREATE TABLE notifications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  sent_count INTEGER DEFAULT 0,      -- 當時的訂閱者人數
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

---

## API 端點總覽

### 認證
| 方法 | 端點 | 說明 |
|:---|:---|:---|
| POST | `/api/auth/register` | 註冊（自動生成試用授權） |
| POST | `/api/auth/login` | 登入 |

### 留言板
| 方法 | 端點 | 說明 |
|:---|:---|:---|
| GET | `/api/guestbook` | 取得所有留言 |
| POST | `/api/guestbook` | 新增留言 |

### 訂閱
| 方法 | 端點 | 說明 |
|:---|:---|:---|
| POST | `/api/subscriptions` | 訂閱更新通知 |
| GET | `/api/subscriptions/unsubscribe` | 取消訂閱 |

### 管理員（需 JWT + admin 角色）
| 方法 | 端點 | 說明 |
|:---|:---|:---|
| GET | `/api/admin/stats` | 統計數據 |
| GET | `/api/admin/users` | 用戶列表 |
| GET | `/api/admin/entries` | 留言列表 |
| GET | `/api/admin/subscribers` | 訂閱者列表 |
| GET | `/api/admin/notifications` | 通知記錄 |
| POST | `/api/notifications` | 發送通知 |

---

## 翻譯鍵統計

- 導航列：`nav.login`, `nav.getStarted`, `nav.feedback`
- Hero：`hero.badge`, `hero.title1`, `hero.title2`, `hero.desc`, `hero.cta1`, `hero.cta2`
- 展示：`showcase.*`（5 個鍵）
- 功能：`features.*`（12 個鍵）
- CTA：`cta.title`, `cta.subtitle`, `cta.button`, `cta.feedbackButton`
- 頁尾：`footer.copy`, `footer.login`, `footer.register`
- 登入：`login.*`（9 個鍵）
- 註冊：`register.*`（11 個鍵）
- 儀表板：`dashboard.*`（10 個鍵）
- 留言板：`guestbook.*`（16 個鍵）
- 訂閱：`subscribe.*`（9 個鍵）
- 管理員：`admin.*`（30+ 個鍵）
- 語言切換：`lang.select`

**總計：約 120+ 個翻譯鍵，每個鍵支援 7 種語言**

---

## 如何設定管理員

預設註冊的用戶角色為 `user`，要進入 `/admin` 需手動將用戶設為 `admin`：

```bash
cd ~/Desktop/llm-monitor-sales
sqlite3 database/app.db "UPDATE users SET role='admin' WHERE email='你的帳號@example.com';"
```

之後登入該帳號，訪問 `/admin` 即可進入管理後台。

---

## 部署準備

部署前需修改以下檔案中的 `API_URL`：
- `frontend/src/pages/Login.tsx`
- `frontend/src/pages/Register.tsx`
- `frontend/src/pages/Dashboard.tsx`
- `frontend/src/pages/Guestbook.tsx`
- `frontend/src/pages/AdminDashboard.tsx`

將 `const API_URL = '/api'` 改為：
```typescript
const API_URL = 'https://你的後端網址.onrender.com/api'
```

參考 `DEPLOY.md` 進行 Vercel + Render 部署。

---

## 已知限制

1. **Render 免費版休眠**：15 分鐘無訪問後進入休眠，下次訪問需 30 秒喚醒
2. **SQLite 資料重置**：Render 免費版重新部署時資料會重置（留言板、訂閱者資料會丟失）
3. **通知僅儲存未發送**：目前通知僅儲存在資料庫中，尚未接入 SMTP 真正發送電子郵件
4. **下載功能待實現**：Dashboard 的「下載軟體」按鈕目前為占位符（Coming Soon）

---

## 接下來可擴展的功能

1. **SMTP 電子郵件發送** — 接入 SendGrid/Resend 真正發送通知郵件
2. **用戶頭像** — Gravatar 或上傳頭像
3. **留言回覆** — 管理員可在後台回覆留言
4. **CSV 匯出** — 管理後台匯出訂閱者/用戶資料
5. **分析儀表板** — 訪問量統計、用戶活躍度
6. **深色/淺色主題切換**
7. **PWA 支援** — 可安裝為桌面應用

---

## 補充：遺漏的配置與細節

### 1. 前端配置檔案（WORKLOG 未列出）

#### `frontend/vite.config.ts`
```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
})
```
- **開發時自動轉發**：所有 `/api/*` 請求自動轉發到 `localhost:3001`
- 生產環境需修改 `API_URL` 為實際後端位址

#### `frontend/tailwind.config.js`
```javascript
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: { extend: {} },
  plugins: [],
}
```

#### `frontend/postcss.config.js`
```javascript
export default {
  plugins: { '@tailwindcss/postcss': {} },
}
```
- 使用 Tailwind CSS v4 的 PostCSS 插件

#### `frontend/src/index.css`
```css
@import "tailwindcss";
@layer base {
  body {
    background-color: #f8fafc;
    color: #0f172a;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }
}
```
- Tailwind CSS v4 新語法：`@import "tailwindcss"`（非舊版 directives）
- `index.css` 中的 `body` 背景色會被各頁面 `bg-neutral-950` 覆蓋

#### `frontend/src/main.tsx`
```tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { I18nProvider } from './i18n/I18nContext'
import App from './App.tsx'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <I18nProvider>
        <App />
      </I18nProvider>
    </BrowserRouter>
  </StrictMode>,
)
```
- 包裹順序：`StrictMode` → `BrowserRouter` → `I18nProvider` → `App`

#### `frontend/index.html`
```html
<!doctype html>
<html lang="zh-TW">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/png" href="/app-icon.png" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>TokenMeter - 本地 LLM API 用量監控</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```
- ⚠️ `<title>` 目前是**固定中文**，未隨語言切換變化
- ⚠️ `<html lang="zh-TW">` 目前是固定值

#### `frontend/vercel.json`
```json
{
  "rewrites": [
    { "source": "/api/(.*)", "destination": "https://你的後端網址/api/$1" }
  ]
}
```
- ⚠️ **部署前必須修改**：`你的後端網址` 需替換為 Render 實際網址

---

### 2. 後端配置檔案（WORKLOG 未列出）

#### `backend/.env`
```
PORT=3001
JWT_SECRET=llm-monitor-super-secret-key-change-in-production
```
- ⚠️ **部署前必須修改**：`JWT_SECRET` 應改為隨機強密碼
- `PORT` 在 Render 生產環境會被覆蓋為 `10000`

#### `backend/tsconfig.json`
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```
- `module: commonjs`（後端使用 CommonJS）
- `outDir: ./dist`（編譯輸出到 `dist/`）

---

### 3. 根目錄 `package.json`（WORKLOG 未列出）

```json
{
  "name": "llm-monitor-sales",
  "version": "1.0.0",
  "scripts": {
    "dev": "concurrently "npm run dev:backend" "npm run dev:frontend"",
    "dev:backend": "cd backend && npx tsx src/index.ts",
    "dev:frontend": "cd frontend && npm run dev",
    "build": "cd frontend && npm run build",
    "setup": "cd backend && npm install && cd ../frontend && npm install"
  },
  "devDependencies": {
    "concurrently": "^9.0.0"
  }
}
```
- `concurrently` 同時啟動前後端（`npm run dev`）
- `setup` 一鍵安裝前後端依賴

---

### 4. 前端依賴清單（`frontend/package.json`）

**生產依賴：**
| 套件 | 版本 | 用途 |
|:---|:---|:---|
| react | ^19.2.6 | React 核心 |
| react-dom | ^19.2.6 | React DOM |
| react-router-dom | ^7.16.0 | 路由管理 |
| lucide-react | ^1.17.0 | 圖示（Icon） |

**開發依賴：**
| 套件 | 版本 | 用途 |
|:---|:---|:---|
| vite | ^8.0.12 | 建置工具 |
| @vitejs/plugin-react | ^6.0.1 | React 插件 |
| tailwindcss | ^4.3.0 | CSS 框架 |
| @tailwindcss/postcss | ^4.3.0 | Tailwind PostCSS 插件 |
| autoprefixer | ^10.4.21 | CSS 前綴自動補充 |
| typescript | ~6.0.2 | TypeScript |
| @types/react | ^19.2.14 | React 型別 |
| @types/react-dom | ^19.2.3 | React DOM 型別 |
| eslint | ^10.3.0 | 程式碼檢查 |

---

### 5. 後端依賴清單（`backend/package.json`）

| 套件 | 版本 | 用途 |
|:---|:---|:---|
| express | ^4.21.2 | Web 框架 |
| cors | ^2.8.5 | 跨域支援 |
| dotenv | ^16.4.7 | 環境變數 |
| bcryptjs | ^2.4.3 | 密碼雜湊 |
| jsonwebtoken | ^9.0.2 | JWT 認證 |
| sqlite | ^5.1.1 | SQLite 驅動 |
| sqlite3 | ^5.1.7 | SQLite3 原生綁定 |
| tsx | ^4.19.2 | TypeScript 執行器 |
| typescript | ^5.7.3 | TypeScript 編譯器 |

---

### 6. 部署前必須修改的檔案清單

| # | 檔案 | 修改內容 | 重要性 |
|:---|:---|:---|:---|
| 1 | `frontend/src/pages/Login.tsx` | `const API_URL = '/api'` → 生產環境網址 | 🔴 必要 |
| 2 | `frontend/src/pages/Register.tsx` | 同上 | 🔴 必要 |
| 3 | `frontend/src/pages/Dashboard.tsx` | 同上 | 🔴 必要 |
| 4 | `frontend/src/pages/Guestbook.tsx` | 同上 | 🔴 必要 |
| 5 | `frontend/src/pages/AdminDashboard.tsx` | 同上 | 🔴 必要 |
| 6 | `frontend/vercel.json` | `你的後端網址` → Render 實際網址 | 🔴 必要 |
| 7 | `backend/.env` | `JWT_SECRET` → 隨機強密碼 | 🔴 必要 |
| 8 | `frontend/index.html` | `<title>` 和 `<html lang>` 是否需動態化 | 🟡 建議 |

**建議做法**：不必手動改 5 個檔案，可在 `vite.config.ts` 使用 `define` 注入 `API_URL` 環境變數，或建立統一的 `config.ts`。

---

### 7. 已知問題（未來需修正）

1. **`<title>` 未 i18n 化**：`index.html` 的標題固定為中文，切換語言時不會變化。可用 `react-helmet-async` 或 `document.title` 動態修改。
2. **`<html lang>` 未動態化**：影響螢幕閱讀器語言識別。
3. **vercel.json 佔位符**：目前含有 `你的後端網址`，部署前易遺漏修改。
4. **API_URL 分散在 5 個檔案**：建議統一為單一 `config.ts` 檔案。
5. **後端錯誤訊息為中文**：`auth.ts` 中的錯誤訊息（「請填寫所有欄位」、「此電子郵件已被註冊」等）未 i18n 化，前端會直接顯示中文錯誤。

---

---

記錄時間：2026-06-05
