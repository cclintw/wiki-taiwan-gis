const state = {
  data: null,
  activeIndex: 0,
  geoRunId: 0,
  map: null,
  markers: L.layerGroup(),
  hull: L.layerGroup(),
  geocodeCache: JSON.parse(localStorage.getItem("taiwanAdminGeoCache") || "{}")
};

const typeColors = {
  "省": "#0f766e",
  "道": "#2563eb",
  "府": "#a06b12",
  "州": "#7c3aed",
  "縣": "#ca8a04",
  "廳": "#dc2626",
  "安撫司": "#be185d",
  "直隸州": "#7c2d12"
};

document.addEventListener("DOMContentLoaded", init);

async function init() {
  state.data = await fetch("./data/admin_periods.json").then((response) => response.json());
  initMap();
  renderTabs();
  renderPeriod(0);
  document.getElementById("refreshGeo").addEventListener("click", () => hydratePeriodGeo(true));
}

function initMap() {
  state.map = L.map("map", { preferCanvas: true }).setView([23.7, 120.95], 7);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
  }).addTo(state.map);
  state.hull.addTo(state.map);
  state.markers.addTo(state.map);
}

function renderTabs() {
  const tabs = document.getElementById("periodTabs");
  tabs.innerHTML = "";

  state.data.periods.forEach((period, index) => {
    const button = document.createElement("button");
    button.className = "period-tab";
    button.type = "button";
    button.role = "tab";
    button.setAttribute("aria-selected", String(index === state.activeIndex));
    button.innerHTML = `<strong>${period.startYear}-${period.endYear}</strong><span>${period.label.replace(/^\d+-\d+\s*/, "")}</span>`;
    button.addEventListener("click", () => renderPeriod(index));
    tabs.appendChild(button);
  });
}

function renderPeriod(index) {
  state.activeIndex = index;
  renderTabs();

  const period = state.data.periods[index];
  const nodes = flattenTree(period.tree);
  document.getElementById("regime").textContent = period.regime;
  document.getElementById("periodTitle").textContent = period.label;
  document.getElementById("periodSummary").textContent = period.changeSummary;
  document.getElementById("startYear").textContent = period.startYear;
  document.getElementById("endYear").textContent = period.endYear;
  document.getElementById("nodeCount").textContent = nodes.length;

  renderTree(period.tree);
  renderNodeList(nodes);
  renderMap(nodes);
  hydratePeriodGeo(false);
}

function flattenTree(root) {
  const rows = [];
  const visit = (node, depth = 0, parent = "") => {
    rows.push({ ...node, depth, parent });
    (node.children || []).forEach((child) => visit(child, depth + 1, node.name));
  };
  visit(root);
  return rows;
}

function renderTree(treeData) {
  const container = document.getElementById("tree");
  container.innerHTML = "";

  const root = d3.hierarchy(treeData);
  const nodeCount = root.descendants().length;
  const width = Math.max(container.clientWidth - 20, 760);
  const height = Math.max(480, nodeCount * 34);
  const tree = d3.tree().nodeSize([32, 190]);
  tree(root);

  const xValues = root.descendants().map((node) => node.x);
  const minX = Math.min(...xValues);
  const maxX = Math.max(...xValues);
  const svgHeight = Math.max(height, maxX - minX + 80);

  const svg = d3.select(container)
    .append("svg")
    .attr("width", width)
    .attr("height", svgHeight)
    .attr("viewBox", [-80, minX - 40, width, svgHeight]);

  svg.append("g")
    .selectAll("path")
    .data(root.links())
    .join("path")
    .attr("class", "tree-link")
    .attr("d", d3.linkHorizontal().x((d) => d.y).y((d) => d.x));

  const node = svg.append("g")
    .selectAll("g")
    .data(root.descendants())
    .join("g")
    .attr("class", "tree-node")
    .attr("transform", (d) => `translate(${d.y},${d.x})`);

  node.append("circle")
    .attr("r", 5)
    .attr("stroke", (d) => typeColors[d.data.type] || "#0f766e");

  node.append("text")
    .attr("x", 12)
    .attr("y", -3)
    .attr("font-weight", (d) => d.children ? 750 : 550)
    .text((d) => d.data.name + (d.data.uncertain ? " ?" : ""));

  node.append("text")
    .attr("class", "node-type")
    .attr("x", 12)
    .attr("y", 13)
    .text((d) => d.data.type || "");
}

function renderNodeList(nodes) {
  const list = document.getElementById("nodeList");
  list.innerHTML = "";
  nodes.forEach((node) => {
    const item = document.createElement("div");
    item.className = "node-pill";
    item.style.marginLeft = `${Math.min(node.depth, 3) * 8}px`;
    item.innerHTML = `
      <span>${node.name}${node.uncertain ? ' <span class="uncertain">有爭議</span>' : ""}</span>
      <small>${node.type || "節點"}</small>
    `;
    list.appendChild(item);
  });
}

function renderMap(nodes) {
  state.markers.clearLayers();
  state.hull.clearLayers();

  const located = nodes
    .map((node) => ({ ...node, geo: getGeo(node.name) }))
    .filter((node) => node.geo);

  located.forEach((node) => {
    const color = typeColors[node.type] || "#0f766e";
    const marker = L.circleMarker([node.geo.lat, node.geo.lng], {
      radius: node.depth === 0 ? 9 : 6,
      color,
      fillColor: color,
      fillOpacity: node.uncertain ? 0.35 : 0.72,
      weight: 2
    });
    marker.bindPopup(`
      <strong>${node.name}</strong><br>
      類型：${node.type || "節點"}<br>
      ${node.parent ? `上級：${node.parent}<br>` : ""}
      座標來源：${node.geo.source}
    `);
    marker.addTo(state.markers);
  });

  const points = located.map((node) => [node.geo.lat, node.geo.lng]);
  if (points.length > 2) {
    L.polygon(points, {
      color: "#0f766e",
      weight: 1,
      fillColor: "#0f766e",
      fillOpacity: 0.07,
      interactive: false
    }).addTo(state.hull);
  }

  if (points.length) {
    state.map.fitBounds(L.latLngBounds(points), { padding: [28, 28], maxZoom: 9 });
  }
}

function getGeo(name) {
  if (state.geocodeCache[name]) {
    return { ...state.geocodeCache[name], source: "Nominatim 快取" };
  }
  const fallback = state.data.fallbackCoordinates[name];
  if (fallback) {
    return { lat: fallback.lat, lng: fallback.lng, source: "內建近似座標" };
  }
  return null;
}

async function hydratePeriodGeo(force) {
  const runId = ++state.geoRunId;
  const status = document.getElementById("geoStatus");
  const period = state.data.periods[state.activeIndex];
  const nodes = flattenTree(period.tree);
  const targets = nodes
    .filter((node) => force || !state.geocodeCache[node.name])
    .map((node) => ({ node, fallback: state.data.fallbackCoordinates[node.name] }))
    .filter((item) => item.fallback?.query);

  if (!targets.length) {
    status.textContent = "GIS 座標已載入；使用瀏覽器快取與內建近似座標。";
    return;
  }

  status.textContent = `正在讀取 GIS 座標：0 / ${targets.length}`;

  let completed = 0;
  for (const target of targets) {
    if (runId !== state.geoRunId) return;
    try {
      const geo = await geocode(target.fallback.query);
      if (geo) {
        state.geocodeCache[target.node.name] = geo;
        localStorage.setItem("taiwanAdminGeoCache", JSON.stringify(state.geocodeCache));
      }
    } catch (error) {
      console.warn(`Geocode failed: ${target.node.name}`, error);
    }
    if (runId !== state.geoRunId) return;
    completed += 1;
    status.textContent = `正在讀取 GIS 座標：${completed} / ${targets.length}`;
    await wait(850);
  }

  if (runId !== state.geoRunId) return;
  status.textContent = "GIS 座標讀取完成；無法解析者保留內建近似座標。";
  renderMap(flattenTree(period.tree));
}

async function geocode(query) {
  const url = new URL("https://nominatim.openstreetmap.org/search");
  url.searchParams.set("format", "jsonv2");
  url.searchParams.set("limit", "1");
  url.searchParams.set("accept-language", "zh-TW");
  url.searchParams.set("q", query);

  const response = await fetch(url.toString(), {
    headers: { "Accept": "application/json" }
  });
  if (!response.ok) return null;

  const results = await response.json();
  if (!results.length) return null;
  return {
    lat: Number(results[0].lat),
    lng: Number(results[0].lon),
    displayName: results[0].display_name,
    query
  };
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
