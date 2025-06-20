# QA Builder - 決策樹問答系統產生器

一個可視化介面工具，讓使用者能快速建立以問答流程為基礎的決策樹系統。適用於客服回覆流程、自助診斷、互動問卷等場景，協助降低維運負擔與提升互動品質。

## 🎯 專案目標

打造直觀易用的決策樹建構工具，支援：
- 客服自動回覆流程設計
- 健康症狀判斷問答流程
- 商品推薦互動引導
- 表單填寫流程引導

## 🚀 功能特色

### 📝 流程編輯器
- **節點操作**：新增、編輯、刪除問句節點與選項節點
- **連線操作**：建立選項節點到問句節點的連線關係
- **可視化設計**：拖拽式操作介面，直觀呈現決策流程

### 🎮 流程模擬器
- **即時預覽**：模擬真實問答流程體驗
- **對話歷史**：記錄完整的問答路徑
- **流程統計**：顯示節點數量與流程深度資訊

### 💾 資料管理
- **匯出功能**：將設計的流程匯出為 JSON 格式
- **匯入功能**：從 JSON 檔案載入既有流程
- **即時儲存**：編輯過程中自動保存狀態

## 🛠 技術架構

### 核心技術
- **Vue 3** (^3.5.13) - 採用 Composition API 與 `<script setup>` 語法
- **Vite** (^5.4.11) - 快速開發建構工具
- **Pinia** (^2.2.6) - 現代化狀態管理
- **Vue Router** (^4.4.5) - 路由管理

### UI 與樣式
- **PrimeVue** (^4.2.5) - 豐富的 UI 元件庫
- **@primevue/themes** (^4.2.5) - 主題系統
- **TailwindCSS** (^3.4.17) - 實用優先的 CSS 框架
- **@vue-flow/core** (^1.44.0) - 節點流程圖核心元件

### 開發工具
- **ESLint** + **Prettier** - 程式碼品質與格式化
- **@ianvs/prettier-plugin-sort-imports** - 自動匯入排序
- **Stylelint** - CSS 程式碼品質檢查
- **Vitest** - 單元測試框架
- **SASS** (^1.83.0) - CSS 預處理器

### 自動化工具
- **unplugin-auto-import** - 自動匯入 Vue API
- **unplugin-vue-components** - 自動匯入元件
- **@primevue/auto-import-resolver** - PrimeVue 元件自動匯入

## 📋 系統需求

- **Node.js**: v18.18.2 (建議版本)
- **pnpm**: 9.15.9 (建議版本)

## 🚀 快速開始

### 安裝依賴
```bash
pnpm install
```

### 開發環境運行
```bash
pnpm dev
```
開發伺服器將在 `http://localhost:5173` 啟動

### 建置生產版本
```bash
pnpm build
```

### 預覽建置結果
```bash
pnpm preview
```

## 🧪 開發指令

### 程式碼品質
```bash
# 執行 ESLint 檢查與自動修復
pnpm lint

# 執行程式碼格式化
pnpm format
```

### 測試
```bash
# 執行單元測試
pnpm test:unit
```

## 📁 專案結構

```
qa-builder/
├── src/
│   ├── components/          # 可重用元件
│   │   ├── QuestionNode.vue # 問句節點元件
│   │   └── OptionNode.vue   # 選項節點元件
│   ├── views/               # 頁面元件
│   │   ├── HomeView/        # 流程編輯器頁面
│   │   └── SimulatorView/   # 流程模擬器頁面
│   ├── stores/              # Pinia 狀態管理
│   │   └── flow.js          # 流程資料狀態
│   ├── utils/               # 工具函式
│   │   └── flow-transformer.js # 流程資料轉換
│   ├── types/               # TypeScript 型別定義
│   └── router/              # 路由配置
├── public/                  # 靜態資源
│   ├── sample-flow.json     # 範例流程檔案
│   └── complete-example.json # 完整範例
└── tests/                   # 測試檔案
```

## 💡 使用說明

### 1. 建立決策流程
1. 進入「流程編輯器」頁面
2. 新增問句節點，輸入問題內容
3. 新增選項節點，輸入選項文字
4. 建立選項到問句的連線關係

### 2. 測試流程
1. 切換到「流程模擬器」頁面
2. 按照問答流程進行互動測試
3. 查看對話歷史與流程統計

### 3. 匯出匯入
- 使用工具欄的匯出功能，將流程存為 JSON 檔案
- 使用匯入功能，載入既有的流程檔案

## 🎨 建議的開發環境

### VS Code 擴充套件
- [Vue - Official](https://marketplace.visualstudio.com/items?itemName=Vue.volar)
- [Prettier - Code formatter](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)
- [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)
- [Stylelint](https://marketplace.visualstudio.com/items?itemName=stylelint.vscode-stylelint)
- [Tailwind CSS IntelliSense](https://marketplace.visualstudio.com/items?itemName=bradlc.vscode-tailwindcss)

## 📚 參考文件

- [Vue 3 官方文件](https://vuejs.org/)
- [Pinia 狀態管理](https://pinia.vuejs.org/)
- [PrimeVue UI 元件庫](https://primevue.org/)
- [TailwindCSS 樣式框架](https://tailwindcss.com/)
- [Vue Flow 流程圖元件](https://vueflow.dev/)
- [Vite 建構工具](https://vitejs.dev/)

