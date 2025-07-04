## 1️⃣ 專案初始化與基本架構

* ✅ 初始化專案（`pnpm create vue`）
* ✅ 安裝與設定 Vue Router、Pinia
* ✅ 安裝並設定 PrimeVue、TailwindCSS
* ✅ 安裝 Vue Flow

---

## 2️⃣ UI 畫面與操作區域規劃

* ✅ 畫面分為左側工具欄 + 中央編輯畫布
* ✅ 設計節點新增工具欄（新增問句 / 選項節點）
* ✅ 設計節點屬性編輯面板（滑出或側欄）

---

## 3️⃣ 節點資料結構設計

* ✅ 設計節點資料格式（`id`, `type`, `text`, `options`, `next` 等）
* ✅ 設計連線資料格式（`sourceId` → `targetId`）
* ✅ 撰寫轉換為 Vue Flow 格式的轉換 utility 函式

---

## 4️⃣ 節點操作功能

* ✅ 支援新增節點至畫布
* ✅ 支援拖曳節點調整位置
* ✅ 支援編輯節點內容（問句與選項）
* ✅ 支援刪除節點與其相關連線

---

## 5️⃣ 連線操作功能

* ✅ 啟用 Vue Flow edge 拖曳功能
* ✅ 選項節點可連接至其他節點
* ✅ 支援刪除節點連線

---

## 6️⃣ 儲存 / 載入功能

* ✅ 建立匯出 JSON 的函式（`exportNodeGraph()`）
* ✅ 建立載入 JSON 的函式（`importNodeGraph()`）
* ✅ 將節點與連線資料儲存到 Pinia store

---

## 7️⃣ 問答流程模擬功能

* ✅ 建立 `simulator` 頁面
* ✅ 從 start node 開始模擬問答流程
* ✅ 顯示選項並跳轉至對應節點
* ✅ 遇到 end node 顯示結果訊息

---

## 8️⃣ 匯出 JSON 檔案功能

* ✅ 提供使用者一鍵下載整個流程 JSON
* ✅ 檔案格式符合實際可載入結構
* ✅ JSON 結構預留相容性擴充欄位（如 version, metadata 等） 