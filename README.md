# LLM Monitor 銷售網站

這是為 **LLM Monitor**（本地 LLM API 用量監控軟體）打造的完整銷售網站，包含：

- **產品官網（Landing Page）**：展示產品特色與定價方案
- **用戶系統**：註冊、登入、JWT 認證
- **授權管理**：自動產生 14 天試用序號，用戶可在後台查看
- **授權驗證 API**：供你的桌面軟體呼叫，驗證序號合法性

---

## 技術架構

| 層級 | 技術 | 說明 |
|------|------|------|
| 前端 | React 19 + TypeScript + Vite + Tailwind CSS v4 | 現代響應式 UI |
| 後端 | Express + TypeScript | RESTful API |
| 資料庫 | SQLite | 零配置、本地儲存、符合產品精神 |

---

## 快速開始

### 1. 安裝依賴

```bash
npm run setup
```

### 2. 啟動開發伺服器

```bash
npm run dev
```

這會同時啟動：
- **前端**：http://localhost:5173
- **後端 API**：http://localhost:3001

### 3. 瀏覽網站

開啟 http://localhost:5173 即可看到產品官網。

---

## API 端點（供桌面軟體串接）

你的桌面軟體可以呼叫以下 API 來驗證授權：

### 驗證授權碼
```
POST /api/licenses/verify
Body: { "license_key": "TRIAL-..." }
Response: { "valid": true, "plan": "trial", "expires_at": "..." }
```

### 啟動授權
```
POST /api/licenses/activate
Body: { "license_key": "...", "device_id": "..." }
Response: { "success": true, "plan": "trial" }
```

---

## 專案結構

```
llm-monitor-sales/
├── frontend/          # React + Vite + Tailwind
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Home.tsx       # 產品 Landing Page
│   │   │   ├── Login.tsx      # 登入頁
│   │   │   ├── Register.tsx   # 註冊頁
│   │   │   └── Dashboard.tsx  # 授權管理後台
│   │   ├── App.tsx
│   │   └── main.tsx
│   └── index.html
├── backend/           # Express + SQLite
│   ├── src/
│   │   ├── index.ts           # 伺服器入口
│   │   ├── database.ts        # SQLite 初始化
│   │   ├── middleware/
│   │   │   └── auth.ts        # JWT 驗證中間件
│   │   └── routes/
│   │       ├── auth.ts        # 登入/註冊
│   │       └── licenses.ts    # 授權碼管理
│   └── .env
├── database/          # SQLite 檔案（自動建立）
└── package.json       # 根層級啟動腳本
```

---

## 接下來你可以做的

1. **串接金流**：在定價頁面的「立即購買」按鈕加入 Stripe / 綠界 / TapPay 等付款流程
2. **郵件通知**：註冊後發送確認信，試用到期前提醒
3. **擴展後台**：加入更多管理功能（用戶列表、銷售統計、授權撤銷）
4. **桌面軟體串接**：讓你的桌面 app 呼叫 `/api/licenses/verify` 驗證序號

---

## 注意事項

- 這是一個**功能完整的基礎骨架**，可以直接運行和擴展
- `.env` 中的 `JWT_SECRET` 在正式上線前請務必更換為強密碼
- SQLite 資料庫檔案位於 `database/app.db`，建議定期備份
