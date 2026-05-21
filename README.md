# Wiki Taiwan GIS: Codex Agent 示範網站

這個專案是一個示範網站，主要示範如何只用 Codex agent，透過一句提示用語（任務指令），自動完成資料整理、JSON 產出、D3.js 樹狀圖，以及 Leaflet + OpenStreetMap GIS 視覺化網站。

本成果網站是 Codex 依原始 prompt 產生的成果範例，保留原汁原味的生成結果，未再針對內容、資料或介面做人工改寫。

本範例的任務是指派 Codex 前往維基百科閱讀「臺灣行政區劃」頁面，根據頁面中的表格與描述，整理 1661-1895 年臺灣行政區劃沿革。只要行政區劃發生變革，即切分為一個新的歷史階段，並為每個階段建立行政層級樹狀圖與 GIS 地圖。

本成果網站是依維基百科頁面內容整理，僅供參考。本專案主要提供方法示範：使用者可以自行更換文本來源、資料主題、視覺化類型與發布方式，讓 Codex agent 依新的任務指令自動生成不同的資料整理與互動網站成果。

## Demo

- https://projects.cclin.cc/wiki-taiwan-gis/

## 專案內容

這個靜態網站包含：

- `data/admin_periods.json`：1661-1895 年臺灣行政區劃沿革資料。
- `index.html`：靜態網站入口。
- `app.js`：D3.js 樹狀圖、Leaflet 地圖、階段切換與 GIS 座標讀取邏輯。
- `styles.css`：網站版面與視覺樣式。
- `.nojekyll`：讓 GitHub Pages 直接發布靜態檔案。

網站功能包含：

- 依行政區劃變革分段的時序資料。
- 每個階段的行政層級樹狀圖。
- 每個階段的 GIS map。
- 使用 D3.js 繪製樹狀圖。
- 使用 Leaflet + OpenStreetMap 繪製地圖。
- 使用 Nominatim/OpenStreetMap API 嘗試自動讀取 GIS 座標。
- API 無法解析時，使用內建近似座標作為 fallback。

## 給 Codex 的 Prompt

以下是本範例使用的原始任務指令。你可以在 Codex 中建立一個空白專案，貼上這段 prompt，讓 Codex 自動產生類似的資料與靜態網站。你也可以根據自己的需求，變更任務指令（prompt）、資料來源、整理規則或網站呈現方式。

```txt
https://zh.wikipedia.org/zh-tw/%E8%87%BA%E7%81%A3%E8%A1%8C%E6%94%BF%E5%8D%80%E5%8A%83

前往上述網站 根據文中關於台灣行政區劃的表格 和描述 整理出 1661-1895年台灣行政區劃沿革,只要行政區劃有變革即分段,存成 json 檔, 並生成 一個靜態網站 內容有各階段 樹狀圖 gis map, 樹狀圖用 d3.js, gis map 用 leaflet + openstreetmap, gis 座標參照 可用的 api 自動讀取 gis 座標
```

## 如何下載

使用 Git clone：

```bash
git clone https://github.com/cclintw/wiki-taiwan-gis.git
cd wiki-taiwan-gis
```

或到 GitHub 專案頁下載 ZIP：

- https://github.com/cclintw/wiki-taiwan-gis

## 如何使用

這是純靜態網站，不需要安裝 npm 套件。

在專案目錄啟動本機伺服器：

```bash
python3 -m http.server 8000
```

開啟瀏覽器：

```txt
http://localhost:8000/
```

不建議直接用檔案總管開啟 `index.html`，因為瀏覽器可能會阻擋 `fetch("./data/admin_periods.json")` 讀取本機 JSON 檔案。

## 如何用 Codex 重做一次

1. 建立一個新的空白資料夾。
2. 在該資料夾初始化 git repo。
3. 開啟 Codex agent。
4. 貼上「給 Codex 的 Prompt」中的任務指令。
5. 讓 Codex 讀取維基百科頁面，整理資料，建立 JSON 與靜態網站。
6. 檢查輸出的 `data/admin_periods.json`、樹狀圖、GIS map 是否符合需求。
7. 使用本機伺服器預覽。
8. 推送到 GitHub，並使用 GitHub Pages 發布。

詳細的 Step by Step Codex 操作流程，請參考：

- [https://cclin.cc](https://cclin.cc/?p=5322)

## 資料來源

- 維基百科：臺灣行政區劃  
  https://zh.wikipedia.org/zh-tw/%E8%87%BA%E7%81%A3%E8%A1%8C%E6%94%BF%E5%8D%80%E5%8A%83

## 技術

- HTML
- CSS
- JavaScript
- D3.js
- Leaflet
- OpenStreetMap
- Nominatim
- GitHub Pages

## 注意事項

- 本成果網站是依維基百科頁面內容整理，僅供參考。
- 本專案是教學示範與成果範例，不是正式史料資料庫。
- 本專案主要提供方法示範；使用者可自行更換文本來源、資料主題、視覺化方式與網站呈現形式。
- GIS 座標以現代地名或歷史轄區治所作近似點位。
- 歷史行政區劃的實際範圍可能與現代行政區不同。
- 若 Nominatim API 查詢失敗，網站會使用內建近似座標。
- 若要大量查詢地理座標，應遵守 Nominatim 使用政策，避免高頻率請求。

如果這個專案對你有幫助，歡迎 star、引用或開 issue 討論。
