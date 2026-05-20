# AI Agent 與數位人文實作：只用一句提示詞，讓 Codex 打造視覺化的台灣行政區劃沿革網站

這篇文章記錄一個完整的數位人文實作案例：從在 Codex 新增專案、命名專案、輸入一段任務指令，到由 Codex 自動讀取維基百科資料、整理 1661-1895 年台灣行政區劃沿革，最後產生一個包含 D3.js 樹狀圖與 Leaflet GIS map 的靜態網站。

成果網站：

- https://wiki-taiwan-gis.cclin.cc/
- https://cclintw.github.io/wiki-taiwan-gis/

GitHub 專案：

- https://github.com/cclintw/wiki-taiwan-gis

> 截圖說明：本文的圖片路徑先以 `docs/images/*.png` 標示。實際發布文章前，可依每個步驟補上對應截圖。

## 一、為什麼這是一個數位人文案例

過去要完成這類網站，通常需要多種技能：

- 讀懂史料或資料來源。
- 判斷資料如何分期與分類。
- 將非結構化文字整理成 JSON。
- 撰寫前端網頁。
- 使用 D3.js 繪製樹狀圖。
- 使用 Leaflet 與 OpenStreetMap 建立 GIS 地圖。
- 部署到 GitHub Pages。

這些工作以往往往需要文史研究者、資料整理者、前端工程師、GIS 工程師一起合作。但在 AI agent 時代，具備領域知識的人，可以直接把需求轉化成任務指令，交給 Codex 這類 agent 執行。

這不代表專業不重要，而是專業的重心正在改變。技術門檻下降後，真正重要的是：你是否知道要問什麼問題、如何判斷資料是否合理、如何設計分類標準，以及如何檢查成果是否符合研究目的。

## 二、AI 時代，文史科系反而更有優勢

AI 時代常被描述成技術人員的時代，但從數位人文的角度來看，文史科系反而可能更有優勢。

原因在於，文史研究者過去常受限於技術工具。想做資料庫、地圖、時間軸、視覺化網站，往往需要求助資訊專業領域者。這個門檻一旦下降，文史研究者就能更直接地把自己的研究問題轉化成可操作的數位成果。

技術能力仍然重要，但許多技術操作已經可以在短期內透過 AI 輔助完成。相對地，人文素養、史料閱讀能力、脈絡判斷能力、分類意識與詮釋能力，並不是一朝一夕可以養成的。

換句話說，在產業界常說的 know-how，在人文社會學界就是長期訓練出來的人文素養。AI 可以幫你寫程式、整理格式、生成網站，但它不會自動知道什麼資料值得整理、怎麼切分才有意義、哪些地方需要懷疑、哪些詮釋需要保留彈性。

這正是文史科系在 AI 時代的競爭力。

## 三、AI 不會搶走人類工作，善用 AI 的人會

AI 不會單純搶走人類的工作。真正會發生的是：善於利用 AI 的人，會搶走不會使用 AI 的人的工作。

這句話的重點不是恐嚇，而是提醒。AI agent 已經能協助完成許多過去需要跨領域團隊才能完成的工作。未來的差異不只在於「會不會寫程式」，而在於「能不能把自己的專業知識轉化成清楚的任務」。

對文史與人文社會領域的人來說，這是一個很大的機會。因為 AI 可以補足技術執行能力，而領域知識仍然掌握在研究者自己手中。

## 四、本案例要做什麼

本案例的目標是建立一個示範網站：

- 資料來源：維基百科「臺灣行政區劃」頁面。
- 整理範圍：1661-1895 年。
- 整理方式：只要行政區劃發生變革，就切成一個歷史階段。
- 輸出資料：JSON 檔。
- 視覺化一：各階段行政區劃樹狀圖。
- 視覺化二：各階段 GIS map。
- 樹狀圖工具：D3.js。
- 地圖工具：Leaflet + OpenStreetMap。
- GIS 座標：可由 API 自動讀取，失敗時使用 fallback 座標。

最重要的是，這些工作不是人工逐檔撰寫，而是透過一段 prompt 交給 Codex agent 自動完成。

## 五、Step by Step 操作流程

### Step 1：開啟 Codex 並新增專案

先開啟 Codex，建立一個新的專案或工作區。這個專案可以是完全空白的資料夾。

建議專案名稱：

```txt
wiki-taiwan-gis
```

截圖位置：

![新增 Codex 專案](./images/01-new-codex-project.png)

### Step 2：確認專案資料夾

建立專案後，確認 Codex 的工作目錄指向新資料夾。

如果你打算之後推上 GitHub，可以先初始化 git：

```bash
git init
```

截圖位置：

![確認專案資料夾](./images/02-project-folder.png)

### Step 3：輸入任務指令 Prompt

在 Codex 對話框貼上以下任務指令：

```txt
https://zh.wikipedia.org/zh-tw/%E8%87%BA%E7%81%A3%E8%A1%8C%E6%94%BF%E5%8D%80%E5%8A%83

前往上述網站 根據文中關於台灣行政區劃的表格 和描述 整理出 1661-1895年台灣行政區劃沿革,只要行政區劃有變革即分段,存成 json 檔, 並生成 一個靜態網站 內容有各階段 樹狀圖 gis map, 樹狀圖用 d3.js, gis map 用 leaflet + openstreetmap, gis 座標參照 可用的 api 自動讀取 gis 座標
```

這段 prompt 的重點是：

- 指定資料來源。
- 指定整理範圍。
- 指定分段規則。
- 指定輸出 JSON。
- 指定網站形式。
- 指定視覺化工具。
- 指定 GIS 座標處理方式。

截圖位置：

![貼上 Codex prompt](./images/03-paste-prompt.png)

### Step 4：讓 Codex 讀取資料來源

Codex 會前往維基百科頁面，讀取台灣行政區劃相關表格與描述，並依照任務指令整理資料。

在這個階段，Codex 會判斷 1661-1895 年間有哪些行政區劃變革，例如：

- 明鄭時期的承天府、天興縣、萬年縣。
- 清初臺灣府一府三縣。
- 彰化縣、淡水廳、噶瑪蘭廳等增設。
- 1887 年建省後三府一直隸州格局。

截圖位置：

![Codex 讀取維基百科資料](./images/04-codex-reading-wikipedia.png)

### Step 5：產生 JSON 資料

Codex 會建立：

```txt
data/admin_periods.json
```

這個檔案保存各階段行政區劃資料，包含：

- 時期 ID。
- 起訖年份。
- 階段標題。
- 政權或時期。
- 變革摘要。
- 行政層級樹狀資料。
- GIS fallback 座標。
- 資料來源說明。

截圖位置：

![產生 JSON 資料](./images/05-json-output.png)

### Step 6：產生靜態網站

Codex 接著會建立靜態網站檔案：

```txt
index.html
styles.css
app.js
```

網站主要包含：

- 時期切換按鈕。
- 行政區劃摘要。
- D3.js 樹狀圖。
- Leaflet + OpenStreetMap 地圖。
- 各階段行政區清單。

截圖位置：

![產生靜態網站檔案](./images/06-generated-files.png)

### Step 7：本機預覽網站

在專案資料夾中啟動本機伺服器：

```bash
python3 -m http.server 8000
```

然後打開：

```txt
http://localhost:8000/
```

注意：不建議直接點開 `index.html`，因為瀏覽器可能會阻擋 JavaScript 讀取本機 JSON 檔。

截圖位置：

![本機預覽網站](./images/07-local-preview.png)

### Step 8：檢查樹狀圖

確認 D3.js 樹狀圖是否正確呈現每個階段的行政層級。

例如某些階段會呈現：

```txt
福建臺灣省
└── 臺灣道
    ├── 臺南府
    ├── 臺灣府
    ├── 臺北府
    └── 臺東直隸州
```

截圖位置：

![檢查 D3 樹狀圖](./images/08-d3-tree.png)

### Step 9：檢查 GIS map

確認 Leaflet 地圖是否載入 OpenStreetMap 圖磚，並顯示行政區節點座標。

這些座標有些來自 API 查詢，有些則使用內建近似座標。歷史行政區的實際範圍與現代地名不同，因此本案例的 GIS 圖主要用於教學示範與視覺化參考。

截圖位置：

![檢查 Leaflet GIS map](./images/09-gis-map.png)

### Step 10：推送到 GitHub

確認網站可正常預覽後，將專案提交到 GitHub。

```bash
git add .
git commit -m "Build Taiwan historical admin GIS site"
git branch -M main
git remote add origin https://github.com/你的帳號/wiki-taiwan-gis.git
git push -u origin main
```

截圖位置：

![推送到 GitHub](./images/10-github-repo.png)

### Step 11：啟用 GitHub Pages

到 GitHub repository 的 Pages 設定頁：

```txt
Settings -> Pages
```

設定：

```txt
Source: Deploy from a branch
Branch: main
Folder: / root
```

儲存後，GitHub Pages 會產生網站網址。

截圖位置：

![設定 GitHub Pages](./images/11-github-pages-settings.png)

### Step 12：完成成果網站

完成後，就可以用瀏覽器開啟成果網站：

```txt
https://cclintw.github.io/wiki-taiwan-gis/
```

如果設定 custom domain，也可以使用：

```txt
https://wiki-taiwan-gis.cclin.cc/
```

截圖位置：

![完成成果網站](./images/12-final-site.png)

## 六、如何改成自己的題目

這個案例不只適用於台灣行政區劃。你可以把 prompt 改成自己的資料來源與研究主題，例如：

- 某個歷史事件的時間線。
- 某位人物的生平與活動地圖。
- 某個地方志中的地名整理。
- 某份政策文件的章節架構圖。
- 某個產業資料的公司關係圖。

改寫 prompt 時，最好明確指定：

- 資料來源。
- 時間範圍。
- 分類或分段規則。
- 輸出資料格式。
- 視覺化形式。
- 使用的前端工具。
- 是否需要地圖、時間軸或互動功能。

## 七、使用這類 AI agent 工作流時要注意什麼

AI agent 可以大幅降低技術門檻，但使用者仍然需要負責判斷成果。

尤其是文史資料，必須注意：

- 資料來源是否可靠。
- AI 是否誤讀表格或段落。
- 時代分期是否合理。
- 名稱、年份、層級是否需要校對。
- GIS 座標是否只是近似位置。
- 成果是否應標示「僅供參考」。

因此，這類工具不是取代研究者，而是讓研究者能更快把想法做成原型。

## 八、結語

這個案例展示了 AI agent 與數位人文結合的可能性。

只要一句清楚的任務指令，Codex 就能從公開文本出發，自動完成資料整理、結構化 JSON、樹狀圖、GIS map 與靜態網站建置。

但真正關鍵的不是那一句 prompt 本身，而是提出 prompt 的人是否具備足夠的領域知識。知道該整理什麼、如何分段、怎麼檢查、哪些結果可信、哪些地方需要保留疑問，這些能力都來自長期的人文訓練。

AI 時代不會讓人文素養失去價值。相反地，當技術門檻下降，人文素養會變得更重要。

會使用 AI 的文史研究者，將能把過去只能停留在想法中的研究構想，更快變成可以展示、分享、檢查與延伸的數位成果。
