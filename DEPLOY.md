# 部署指南：讓全世界看到你的 TokenMeter 網站

---

## 📋 部署架構

```
使用者瀏覽器 → Vercel（前端網頁）→ Render（後端 API + SQLite 資料庫）
```

| 服務 | 用途 | 費用 |
|:---|:---|:---|
| **Vercel** | 前端網站託管 | 免費 |
| **Render** | 後端 API + 資料庫 | 免費 |

---

## 🚀 步驟一：部署後端到 Render

### 1. 前往 https://render.com
- 用 GitHub 帳號登入（沒有就免費註冊一個）

### 2. 建立 Web Service
- 點擊「New +」→「Web Service」
- 選擇你的 GitHub 帳號（你需要先上傳程式碼到 GitHub）

#### 如果還沒上傳到 GitHub：
```bash
cd ~/Desktop/llm-monitor-sales
git init
git add .
git commit -m "Initial commit"
# 去 GitHub 建立新專案，然後：
git remote add origin https://github.com/你的帳號/你的專案名稱.git
git push -u origin main
```

### 3. 設定 Render
- **Build Command**: `cd backend && npm install`
- **Start Command**: `cd backend && npm start`
- **Plan**: 選 Free

### 4. 環境變數
在 Render Dashboard → Environment 加上：
```
PORT=10000
JWT_SECRET=你的超級密碼（隨便打一串英文數字）
NODE_ENV=production
```

### 5. 部署
- 點「Create Web Service」
- 等待幾分鐘，會得到一個網址：`https://你的專案名稱.onrender.com`
- **記下這個網址！**

---

## 🎨 步驟二：部署前端到 Vercel

### 1. 修改 API 位址

開啟 `frontend/src/pages/Login.tsx`、`Register.tsx`、`Dashboard.tsx`、`Guestbook.tsx`，找到：

```ts
const API_URL = '/api'
```

改成：
```ts
const API_URL = 'https://你的後端網址.onrender.com/api'
```

（把 `你的後端網址` 替換成 Render 給你的實際網址）

### 2. 重新打包

```bash
cd ~/Desktop/llm-monitor-sales/frontend
npm run build
```

### 3. 前往 https://vercel.com
- 用 GitHub 登入
- 點「Add New Project」
- 選擇你的 GitHub 專案
- **Framework Preset**: 選「Vite」
- **Root Directory**: 改成 `frontend/`
- 點「Deploy」

### 4. 完成！
- Vercel 會給你一個網址：`https://你的專案名稱.vercel.app`
- 任何人打開這個網址都能看到你的 TokenMeter 網站！

---

## 🔄 之後要更新怎麼辦？

### 更新前端
```bash
cd ~/Desktop/llm-monitor-sales
git add .
git commit -m "更新網站"
git push
# Vercel 會自動重新部署！
```

### 更新後端
```bash
cd ~/Desktop/llm-monitor-sales
git add .
git commit -m "更新 API"
git push
# Render 會自動重新部署！
```

---

## ⚠️ 注意事項

1. **Render 免費版**會在 15 分鐘沒人訪問後進入休眠，下次訪問要等 30 秒喚醒
   - 如果要 24/7 運行，可以每 5 分鐘 ping 一次（有免費服務可以做這件事）

2. **SQLite 資料庫**在 Render 免費版上每次重新部署會重置
   - 留言板資料會被清空（這是免費版的限制）
   - 如果希望留言長期保存，建議改用 **PostgreSQL**（Render 也提供免費 PostgreSQL）

3. **自訂域名**
   - Vercel 和 Render 都支援綁定自己的域名（如 `tokemeter.com`）
   - 需要先去 Namecheap/Cloudflare 買域名

---

## 🆘 如果懶得用 GitHub

### 最懶人的方式：直接上傳靜態檔案

如果不想用 GitHub + Vercel，也可以直接把打包好的檔案上傳到：

- **Netlify Drop**: https://app.netlify.com/drop
  - 直接把 `frontend/dist/` 資料夾拖曳到網頁上，立即上線！

不過這種方式**只能顯示前端頁面**，留言板功能不會運作（因為沒有後端 API）。

---

## ✅ 部署完成後的檢查清單

- [ ] 打開 `https://你的專案名稱.vercel.app` 能看到首頁
- [ ] 能點「免費開始」註冊帳號
- [ ] 註冊後跳轉到 Dashboard 看到用戶中心
- [ ] 登入登出功能正常
- [ ] 留言板能正常顯示和提交留言

---

需要我幫你設定 GitHub 上傳，或是有任何部署問題嗎？
