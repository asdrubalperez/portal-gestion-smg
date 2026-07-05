// ============================================================
// PORTAL EJECUTIVO — APP LOGIC (router + render)
// ============================================================

// REPORT contiene los datos del período actualmente visible.
// PERIODS_META y DEFAULT_PERIOD_ID vienen declarados inline en index.html.
var REPORT;

const ICONS = {
  dashboard: `<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="2.5" y="2.5" width="6.5" height="6.5" rx="1.2"/><rect x="11" y="2.5" width="6.5" height="4" rx="1.2"/><rect x="11" y="8.5" width="6.5" height="9" rx="1.2"/><rect x="2.5" y="11" width="6.5" height="6.5" rx="1.2"/></svg>`,
  iniciativas: `<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M3 6.5a2 2 0 012-2h3l1.5 2H15a2 2 0 012 2v5.5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5.5z"/></svg>`,
  indicadores: `<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M3 16.5V3.5M3 16.5h14M6.5 13.5v-4M10.5 13.5v-7M14.5 13.5v-2.5"/></svg>`,
  frentes: `<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="10" cy="10" r="7"/><path d="M10 3v14M3 10h14"/></svg>`,
  pasos: `<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M4 10h9M13 10l-3-3M13 10l-3 3M4 4.5h5M4 15.5h5"/></svg>`,
  check: `<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 10.5l3.5 3.5L16 5.5"/></svg>`,
  arrowRight: `<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 10h11M11 5l5 5-5 5"/></svg>`,
  arrowLeft: `<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M16 10H5M9 5l-5 5 5 5"/></svg>`,
  external: `<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M8 5H5.5A1.5 1.5 0 004 6.5v8A1.5 1.5 0 005.5 16h8a1.5 1.5 0 001.5-1.5V12M11 4h5v5M16 4l-7 7"/></svg>`,
  doc: `<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M6 2.5h6l3 3v11a1 1 0 01-1 1H6a1 1 0 01-1-1v-13a1 1 0 011-1z"/><path d="M12 2.5V6h3.5"/></svg>`,
  menu: `<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3 5.5h14M3 10h14M3 14.5h14"/></svg>`,
  close: `<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M5 5l10 10M15 5L5 15"/></svg>`,
  download: `<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M10 3v9.5M6.5 9l3.5 3.5L13.5 9"/><path d="M4 14.5v1.3a1.2 1.2 0 001.2 1.2h9.6a1.2 1.2 0 001.2-1.2v-1.3"/></svg>`,
};

const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard", icon: "dashboard" },
  { id: "iniciativas", label: "Iniciativas", icon: "iniciativas" },
  { id: "indicadores", label: "Indicadores", icon: "indicadores" },
  { id: "frentes", label: "Frentes de Trabajo", icon: "frentes" },
  { id: "pasos", label: "Próximos Pasos", icon: "pasos" },
];

function fmtUSD(n) {
  return "USD " + Math.round(n).toLocaleString("es-AR");
}
function fmtHoras(n) {
  return n.toLocaleString("es-AR", { minimumFractionDigits: n % 1 !== 0 ? 1 : 0, maximumFractionDigits: 1 }) + "h";
}
function badgeClass(estado) {
  if (estado === "Finalizada") return "badge-finalizada";
  if (estado === "Entrega") return "badge-entrega";
  return "badge-en-curso";
}
function getIniciativa(id) { return REPORT.iniciativas.find(i => i.id === id); }
function getFrente(id) { return REPORT.frentes.find(f => f.id === id); }
function frenteNombre(id) { const f = getFrente(id); return f ? f.nombre : id; }
function jiraUrl(codigo) { return REPORT.jiraBaseUrl + codigo; }

// Período actualmente mostrado (se actualiza en cada render() según la URL)
var CURRENT_PERIOD_ID = DEFAULT_PERIOD_ID;
function periodPath(path) { return `#/${CURRENT_PERIOD_ID}/${path}`; }

// ------------------------------------------------------------
// CARGA DE DATOS POR PERÍODO (bajo demanda, con caché en memoria)
// ------------------------------------------------------------
var PERIODS = {}; // caché: { [periodId]: datos ya cargados }
var RENDER_TOKEN = 0; // evita que una carga vieja pise a una más reciente

function getPeriodMeta(id) { return PERIODS_META.find(p => p.id === id); }

function loadPeriod(id) {
  if (PERIODS[id]) return Promise.resolve(PERIODS[id]);
  const meta = getPeriodMeta(id);
  if (!meta) return Promise.reject(new Error(`Período desconocido: ${id}`));
  return fetch(meta.file)
    .then(res => {
      if (!res.ok) throw new Error(`HTTP ${res.status} al pedir ${meta.file}`);
      return res.json();
    })
    .then(data => { PERIODS[id] = data; return data; });
}

// ------------------------------------------------------------
// ROUTER
// ------------------------------------------------------------
function parseHash() {
  const h = location.hash.replace(/^#\/?/, "");
  const parts = h.split("/").filter(Boolean);

  let periodId = DEFAULT_PERIOD_ID;
  if (parts.length && getPeriodMeta(parts[0])) {
    periodId = parts.shift();
  }

  if (parts.length === 0) return { period: periodId, view: "dashboard" };
  if (parts[0] === "iniciativa" && parts[1]) return { period: periodId, view: "iniciativa-detalle", id: parts[1] };
  if (parts[0] === "frente" && parts[1]) return { period: periodId, view: "frente-detalle", id: parts[1] };
  return { period: periodId, view: parts[0] };
}

function navigate(hash) {
  location.hash = hash;
}

function render() {
  const route = parseHash();
  CURRENT_PERIOD_ID = getPeriodMeta(route.period) ? route.period : DEFAULT_PERIOD_ID;
  updateActiveNav(route);
  syncPeriodSelect();

  const root = document.getElementById("view-root");
  const myToken = ++RENDER_TOKEN;

  if (PERIODS[CURRENT_PERIOD_ID]) {
    REPORT = PERIODS[CURRENT_PERIOD_ID];
    root.innerHTML = "";
    renderRoute(route, root);
    return;
  }

  root.innerHTML = "";
  root.appendChild(buildLoadingState());

  loadPeriod(CURRENT_PERIOD_ID)
    .then(data => {
      if (myToken !== RENDER_TOKEN) return; // el usuario ya navegó a otra cosa
      REPORT = data;
      root.innerHTML = "";
      renderRoute(route, root);
    })
    .catch(err => {
      if (myToken !== RENDER_TOKEN) return;
      root.innerHTML = "";
      root.appendChild(buildErrorState(err, CURRENT_PERIOD_ID));
    });
}

function renderRoute(route, root) {
  updateSidebarFooter();
  updateBreadcrumb(route);

  switch (route.view) {
    case "dashboard": root.appendChild(renderDashboard()); break;
    case "iniciativas": root.appendChild(renderIniciativas()); break;
    case "iniciativa-detalle": root.appendChild(renderIniciativaDetalle(route.id)); break;
    case "indicadores": root.appendChild(renderIndicadores()); break;
    case "frentes": root.appendChild(renderFrentes()); break;
    case "frente-detalle": root.appendChild(renderFrenteDetalle(route.id)); break;
    case "pasos": root.appendChild(renderProximosPasos()); break;
    default: root.appendChild(renderDashboard());
  }
  window.scrollTo(0, 0);
  closeMobileSidebar();
}

function buildLoadingState() {
  return el(`
    <div class="period-loading">
      <div class="spinner"></div>
      <p>Cargando información del período…</p>
    </div>
  `);
}

function buildErrorState(err, periodId) {
  console.error(err);
  return el(`
    <div class="period-error">
      <div class="icon">${ICONS.close}</div>
      <h3>No se pudo cargar este período</h3>
      <p>
        No se encontró o no se pudo leer <code>data/${periodId}.json</code>.
        Si abriste este archivo con doble clic (<code>file://</code>), los navegadores bloquean
        esa carga por seguridad — probá con la versión publicada en Vercel, o corré un servidor
        local (por ejemplo <code>npx serve</code>) en esta carpeta.
      </p>
    </div>
  `);
}

function updateActiveNav(route) {
  const topLevel = (route.view === "iniciativa-detalle") ? "iniciativas" :
                    (route.view === "frente-detalle") ? "frentes" : route.view;
  document.querySelectorAll(".nav-item").forEach(el => {
    el.classList.toggle("active", el.dataset.nav === topLevel);
  });
}

function syncPeriodSelect() {
  const select = document.getElementById("period-select");
  if (select) select.value = CURRENT_PERIOD_ID;
}

function updateSidebarFooter() {
  const el = document.getElementById("sidebar-footer");
  if (el) el.innerHTML = `${REPORT.meta.autor}<br>${REPORT.meta.rol.split(" · ")[0]}`;
}

function updateBreadcrumb(route) {
  const el = document.getElementById("breadcrumb");
  const labels = {
    dashboard: "Dashboard", iniciativas: "Iniciativas", indicadores: "Indicadores Consolidados",
    frentes: "Frentes de Trabajo", pasos: "Próximos Pasos",
  };
  if (route.view === "iniciativa-detalle") {
    const ini = getIniciativa(route.id);
    el.innerHTML = `Iniciativas <span class="sep">/</span> <b>${ini ? ini.nombreCorto : ""}</b>`;
  } else if (route.view === "frente-detalle") {
    const f = getFrente(route.id);
    el.innerHTML = `Frentes de Trabajo <span class="sep">/</span> <b>${f ? f.nombre : ""}</b>`;
  } else {
    el.innerHTML = `<b>${labels[route.view] || "Dashboard"}</b>`;
  }
}

// helper to build DOM from HTML string
function el(html) {
  const t = document.createElement("template");
  t.innerHTML = html.trim();
  return t.content.firstElementChild;
}

// ------------------------------------------------------------
// VIEW: DASHBOARD
// ------------------------------------------------------------
function renderDashboard() {
  const wrap = el(`<div></div>`);

  wrap.appendChild(el(`
    <div class="page-head">
      <div class="eyebrow">${REPORT.meta.periodoLabel} · ${REPORT.meta.periodoFechas}</div>
      <h1>Gestión de Agilidad, Metodologías e IA — Swiss Medical Group</h1>
      <p class="desc">Visión ejecutiva de lo realizado durante el período: qué se hizo, por qué se hizo y qué impacto generó. ${REPORT.meta.autor} · ${REPORT.meta.rol}</p>
    </div>
  `));

  // KPI grid
  const kpiGrid = el(`<div class="kpi-grid"></div>`);
  REPORT.kpis.forEach(k => {
    kpiGrid.appendChild(el(`
      <div class="kpi-card">
        <div class="kpi-label">${k.label}</div>
        <div class="kpi-value">${k.value}<span class="suffix">${k.suffix}</span></div>
      </div>
    `));
  });
  wrap.appendChild(kpiGrid);

  // Logros
  const logrosSection = el(`
    <div class="section">
      <div class="section-head"><h2>Principales logros del período</h2></div>
      <div class="logros-list"></div>
    </div>
  `);
  const logrosList = logrosSection.querySelector(".logros-list");
  REPORT.logros.forEach(l => {
    logrosList.appendChild(el(`<div class="logro-item"><span class="dot"></span><p>${l}</p></div>`));
  });
  wrap.appendChild(logrosSection);

  // Iniciativas estratégicas (preview)
  const iniSection = el(`
    <div class="section">
      <div class="section-head">
        <h2>Iniciativas estratégicas</h2>
        <a class="link-all" href="${periodPath("iniciativas")}">Ver todas →</a>
      </div>
      <div class="cards-grid"></div>
    </div>
  `);
  const grid = iniSection.querySelector(".cards-grid");
  REPORT.iniciativas.forEach(ini => grid.appendChild(renderIniciativaCard(ini)));
  wrap.appendChild(iniSection);

  return wrap;
}

function renderIniciativaCard(ini) {
  const impactoTexto = ini.indicadores.find(i => i.label.toLowerCase().includes("ahorro"))?.value
    || ini.indicadores[0]?.value || "";
  const impactoLabel = ini.indicadores.find(i => i.label.toLowerCase().includes("ahorro"))?.label
    || ini.indicadores[0]?.label || "";

  const card = el(`
    <div class="ini-card" role="button" tabindex="0">
      <div class="ini-card-top">
        <div>
          <div class="ini-card-code">${ini.codigo}</div>
          <h3>${ini.nombre}</h3>
        </div>
        <span class="badge ${badgeClass(ini.estado)}">${ini.estado}</span>
      </div>
      <div class="ini-card-stats">
        <div class="ini-stat"><span class="n">${fmtHoras(ini.horasIns)}</span><span class="l">Horas</span></div>
        <div class="ini-stat"><span class="n">${fmtUSD(ini.inversion)}</span><span class="l">Inversión</span></div>
        <div class="ini-stat"><span class="n">${ini.roi}</span><span class="l">ROI</span></div>
      </div>
      <div class="ini-card-impact">${impactoLabel}: ${impactoTexto}</div>
      <div class="ini-card-frentes">${ini.frentes.map(f => `<span class="chip">${frenteNombre(f)}</span>`).join("")}</div>
    </div>
  `);
  card.addEventListener("click", () => navigate(periodPath(`iniciativa/${ini.id}`)));
  card.addEventListener("keydown", e => { if (e.key === "Enter") navigate(periodPath(`iniciativa/${ini.id}`)); });
  return card;
}

// ------------------------------------------------------------
// VIEW: INICIATIVAS (listado con filtro por estado)
// ------------------------------------------------------------
function renderIniciativas() {
  const wrap = el(`
    <div>
      <div class="page-head">
        <div class="eyebrow">${REPORT.meta.periodoLabel}</div>
        <h1>Iniciativas Estratégicas</h1>
        <p class="desc">Las 6 iniciativas dirigidas y concretadas por el frente de Agilidad durante el período. Seleccioná una para ver su detalle completo.</p>
      </div>
      <div class="filters-bar"></div>
      <div class="cards-grid"></div>
    </div>
  `);

  const estados = ["Todas", ...Array.from(new Set(REPORT.iniciativas.map(i => i.estado)))];
  const filtersBar = wrap.querySelector(".filters-bar");
  const grid = wrap.querySelector(".cards-grid");

  function paint(filter) {
    grid.innerHTML = "";
    const list = filter === "Todas" ? REPORT.iniciativas : REPORT.iniciativas.filter(i => i.estado === filter);
    list.forEach(ini => grid.appendChild(renderIniciativaCard(ini)));
  }

  estados.forEach((estado, idx) => {
    const chip = el(`<button class="filter-chip ${idx === 0 ? "active" : ""}">${estado}</button>`);
    chip.addEventListener("click", () => {
      filtersBar.querySelectorAll(".filter-chip").forEach(c => c.classList.remove("active"));
      chip.classList.add("active");
      paint(estado);
    });
    filtersBar.appendChild(chip);
  });

  paint("Todas");
  return wrap;
}

// ------------------------------------------------------------
// VIEW: DETALLE DE INICIATIVA
// ------------------------------------------------------------
function renderIniciativaDetalle(id) {
  const ini = getIniciativa(id);
  if (!ini) {
    return el(`<div><p>Iniciativa no encontrada.</p><a class="back-link" href="${periodPath("iniciativas")}">${ICONS.arrowLeft} Volver a Iniciativas</a></div>`);
  }

  const wrap = el(`<div></div>`);
  wrap.appendChild(el(`<a class="back-link" href="${periodPath("iniciativas")}">${ICONS.arrowLeft} Volver a Iniciativas</a>`));

  wrap.appendChild(el(`
    <div class="detail-head">
      <div class="titles">
        <a class="code" href="${jiraUrl(ini.codigo)}" target="_blank" rel="noopener">${ini.codigo} ${ICONS.external}</a>
        <h1>${ini.nombre}</h1>
      </div>
      <span class="badge ${badgeClass(ini.estado)}">${ini.estado}</span>
    </div>
  `));

  const metaRow = el(`<div class="detail-meta-row"></div>`);
  const metaItems = [
    { l: "Estado", v: ini.estado },
    { l: "Iniciativa Jira", v: `<a href="${jiraUrl(ini.codigo)}" target="_blank" rel="noopener">${ini.codigo}</a>` },
    ini.horasEst ? { l: "Horas estimadas", v: fmtHoras(ini.horasEst) } : null,
    { l: "Horas insumidas", v: fmtHoras(ini.horasIns) },
    { l: "Inversión", v: fmtUSD(ini.inversion) },
    { l: "ROI", v: ini.roi },
    { l: "Frentes", v: ini.frentes.map(f => frenteNombre(f)).join(", ") },
  ].filter(Boolean);
  metaItems.forEach(m => metaRow.appendChild(el(`<div class="detail-meta-item"><span class="l">${m.l}</span><span class="v">${m.v}</span></div>`)));
  wrap.appendChild(metaRow);

  wrap.appendChild(el(`
    <div class="detail-block">
      <h2>Resumen</h2>
      <p class="resumen-text">${ini.resumen}</p>
    </div>
  `));

  wrap.appendChild(el(`
    <div class="detail-block">
      <h2>Objetivo</h2>
      <p class="resumen-text">${ini.objetivo}</p>
    </div>
  `));

  const trabajoBlock = el(`<div class="detail-block"><h2>Trabajo realizado</h2><div class="check-list"></div></div>`);
  const trabajoList = trabajoBlock.querySelector(".check-list");
  ini.trabajoRealizado.forEach(t => trabajoList.appendChild(el(`<div class="check-item">${ICONS.check}<p>${t}</p></div>`)));
  wrap.appendChild(trabajoBlock);

  // Tabla de agentes (solo iniciativa IA)
  if (ini.tablaAgentes) {
    const tblBlock = el(`
      <div class="detail-block">
        <h2>Agentes de IA construidos</h2>
        <table class="data-table">
          <thead><tr><th>Agente</th><th>Función</th><th>Plataformas</th></tr></thead>
          <tbody></tbody>
        </table>
      </div>
    `);
    const tbody = tblBlock.querySelector("tbody");
    ini.tablaAgentes.forEach(a => {
      tbody.appendChild(el(`<tr><td>${a.agente}</td><td>${a.funcion}</td><td>${a.plataformas}</td></tr>`));
    });
    wrap.appendChild(tblBlock);
  }

  const resultadosBlock = el(`<div class="detail-block"><h2>Resultados</h2><div class="check-list"></div></div>`);
  const resultadosList = resultadosBlock.querySelector(".check-list");
  ini.resultados.forEach(r => resultadosList.appendChild(el(`<div class="check-item">${ICONS.check}<p>${r}</p></div>`)));
  wrap.appendChild(resultadosBlock);

  const indBlock = el(`<div class="detail-block"><h2>Indicadores</h2><div class="indicadores-row"></div></div>`);
  const indRow = indBlock.querySelector(".indicadores-row");
  ini.indicadores.forEach(i => indRow.appendChild(el(`<div class="indicador-pill"><div class="v">${i.value}</div><div class="l">${i.label}</div></div>`)));
  wrap.appendChild(indBlock);

  if (ini.entregablesIds && ini.entregablesIds.length) {
    const entBlock = el(`<div class="detail-block"><h2>Entregables</h2><div class="entregables-list"></div></div>`);
    const entList = entBlock.querySelector(".entregables-list");
    ini.entregablesIds.forEach(eid => {
      const e = REPORT.entregables[eid];
      if (!e) return;
      entList.appendChild(el(`
        <div class="entregable-row">
          <div class="entregable-icon">${ICONS.doc}</div>
          <div class="entregable-body">
            <div class="name">${e.nombre}</div>
            <div class="desc">${e.descripcion}</div>
          </div>
          <span class="entregable-tag">${e.tipo}</span>
          ${e.link ? `<a class="entregable-link" href="${e.link}" target="_blank" rel="noopener">Abrir ${ICONS.external}</a>` : ""}
        </div>
      `));
    });
    wrap.appendChild(entBlock);
  }

  return wrap;
}

// ------------------------------------------------------------
// VIEW: INDICADORES CONSOLIDADOS
// ------------------------------------------------------------
function renderIndicadores() {
  const wrap = el(`
    <div>
      <div class="page-head">
        <div class="eyebrow">${REPORT.meta.periodoLabel}</div>
        <h1>Indicadores Consolidados</h1>
        <p class="desc">Principales indicadores agregados del período, correspondientes a las 6 iniciativas propias del frente de Agilidad.</p>
      </div>
    </div>
  `);

  const grid = el(`<div class="kpi-grid" style="grid-template-columns: repeat(3, 1fr); margin-bottom:32px;"></div>`);
  REPORT.indicadoresConsolidados.forEach(i => {
    grid.appendChild(el(`
      <div class="kpi-card">
        <div class="kpi-label">${i.label}</div>
        <div class="kpi-value">${i.value}</div>
        ${i.detalle ? `<div style="font-size:11.5px;color:var(--slate);margin-top:6px;">${i.detalle}</div>` : ""}
      </div>
    `));
  });
  wrap.appendChild(grid);

  // Tabla consolidado de iniciativas
  const tblSection = el(`
    <div class="section">
      <div class="section-head"><h2>Consolidado de iniciativas propias</h2></div>
      <table class="data-table">
        <thead><tr><th>Iniciativa</th><th>Código</th><th class="num">Hs. Est.</th><th class="num">Hs. Ins.</th><th class="num">Inversión</th><th class="num">ROI</th></tr></thead>
        <tbody></tbody>
      </table>
    </div>
  `);
  const tbody = tblSection.querySelector("tbody");
  REPORT.tablaConsolidadoIniciativas.forEach(t => {
    tbody.appendChild(el(`
      <tr>
        <td>${t.nombre}</td>
        <td style="font-family:var(--font-mono);font-size:11.5px;"><a href="${jiraUrl(t.codigo)}" target="_blank" rel="noopener">${t.codigo}</a></td>
        <td class="num">${t.horasEst}</td>
        <td class="num">${fmtHoras(t.horasIns)}</td>
        <td class="num">${fmtUSD(t.usd)}</td>
        <td class="num">${t.roi}</td>
      </tr>
    `));
  });
  tbody.appendChild(el(`
    <tr class="total-row">
      <td>Totales</td><td></td>
      <td class="num">${REPORT.totales.horasEst}</td>
      <td class="num">${fmtHoras(REPORT.totales.horasIns)}</td>
      <td class="num">${fmtUSD(REPORT.totales.usd)}</td>
      <td class="num">—</td>
    </tr>
  `));
  wrap.appendChild(tblSection);

  // Distribución de horas de recobro
  const maxHoras = Math.max(...REPORT.recobro.porFrente.map(f => f.horas));
  const colors = { "Dirección de Sistemas (Cross Org.)": "var(--chart-gray)", "Seguros": "var(--chart-blue)", "Procesos Corporativos y Digitales": "var(--chart-amber)" };

  const chartSection = el(`
    <div class="section">
      <div class="section-head"><h2>Distribución de horas de recobro de servicios internos</h2></div>
      <div class="chart-card">
        <h3>Horas facturadas por frente — H1 2026</h3>
        <p class="chart-sub">Base para la meta de rebalanceo hacia H2: hoy el 83% de las horas se concentra en Sistemas.</p>
        <div class="bars"></div>
      </div>
    </div>
  `);
  const bars = chartSection.querySelector(".bars");
  REPORT.recobro.porFrente.forEach(f => {
    bars.appendChild(el(`
      <div class="bar-row">
        <span class="bar-label">${f.frente}</span>
        <div class="bar-track"><div class="bar-fill" style="width:${(f.horas / maxHoras) * 100}%; background:${colors[f.frente]};"></div></div>
        <span class="bar-value">${f.horas}h (${f.pct}%)</span>
      </div>
    `));
  });
  wrap.appendChild(chartSection);

  // Evolución mensual (stacked)
  const monthlySection = el(`
    <div class="section">
      <div class="chart-card">
        <h3>Evolución mensual — Horas de recobro</h3>
        <p class="chart-sub">A partir de abril se incorpora facturación a Seguros y Procesos Corporativos y Digitales.</p>
        <div class="stack-bar-wrap"></div>
        <div class="legend-row">
          <span class="legend-item"><span class="legend-dot" style="background:var(--chart-gray);"></span> Dirección de Sistemas</span>
          <span class="legend-item"><span class="legend-dot" style="background:var(--chart-blue);"></span> Seguros</span>
          <span class="legend-item"><span class="legend-dot" style="background:var(--chart-amber);"></span> Procesos Corp. y Digitales</span>
        </div>
      </div>
    </div>
  `);
  const stackWrap = monthlySection.querySelector(".stack-bar-wrap");
  const maxMonthTotal = Math.max(...REPORT.recobro.porMes.map(m => m.sistemas + m.seguros + m.pcd));
  REPORT.recobro.porMes.forEach(m => {
    const total = m.sistemas + m.seguros + m.pcd;
    const scale = 150 / maxMonthTotal; // px height budget
    const col = el(`<div class="stack-col"><span class="month-label">${m.mes}</span></div>`);
    if (m.pcd > 0) col.appendChild(el(`<div class="stack-seg" style="height:${m.pcd * scale}px; background:var(--chart-amber);" title="PCD: ${m.pcd}h"></div>`));
    if (m.seguros > 0) col.appendChild(el(`<div class="stack-seg" style="height:${m.seguros * scale}px; background:var(--chart-blue);" title="Seguros: ${m.seguros}h"></div>`));
    col.appendChild(el(`<div class="stack-seg" style="height:${m.sistemas * scale}px; background:var(--chart-gray);" title="Sistemas: ${m.sistemas}h"></div>`));
    stackWrap.appendChild(col);
  });
  wrap.appendChild(monthlySection);

  return wrap;
}

// ------------------------------------------------------------
// VIEW: FRENTES DE TRABAJO
// ------------------------------------------------------------
function renderFrentes() {
  const wrap = el(`
    <div>
      <div class="page-head">
        <div class="eyebrow">${REPORT.meta.periodoLabel}</div>
        <h1>Frentes de Trabajo</h1>
        <p class="desc">Gestión distribuida por área o frente de negocio. Seleccioná un frente para ver únicamente sus iniciativas relacionadas.</p>
      </div>
      <div class="frentes-grid"></div>
    </div>
  `);
  const grid = wrap.querySelector(".frentes-grid");
  REPORT.frentes.forEach(f => {
    const card = el(`
      <div class="frente-card" role="button" tabindex="0">
        <h3>${f.nombre}</h3>
        <p>${f.descripcion}</p>
        <span class="count">${f.iniciativasPropias.length} iniciativa${f.iniciativasPropias.length === 1 ? "" : "s"} propia${f.iniciativasPropias.length === 1 ? "" : "s"}</span>
      </div>
    `);
    card.addEventListener("click", () => navigate(periodPath(`frente/${f.id}`)));
    card.addEventListener("keydown", e => { if (e.key === "Enter") navigate(periodPath(`frente/${f.id}`)); });
    grid.appendChild(card);
  });
  return wrap;
}

function renderFrenteDetalle(id) {
  const f = getFrente(id);
  if (!f) return el(`<div><p>Frente no encontrado.</p><a class="back-link" href="${periodPath("frentes")}">${ICONS.arrowLeft} Volver a Frentes</a></div>`);

  const wrap = el(`<div></div>`);
  wrap.appendChild(el(`<a class="back-link" href="${periodPath("frentes")}">${ICONS.arrowLeft} Volver a Frentes de Trabajo</a>`));
  wrap.appendChild(el(`
    <div class="page-head">
      <h1>${f.nombre}</h1>
      <p class="desc">${f.descripcion}</p>
    </div>
  `));

  if (f.iniciativasPropias.length) {
    const section = el(`<div class="section"><div class="section-head"><h2>Iniciativas propias relacionadas</h2></div><div class="cards-grid"></div></div>`);
    const grid = section.querySelector(".cards-grid");
    f.iniciativasPropias.forEach(iid => {
      const ini = getIniciativa(iid);
      if (ini) grid.appendChild(renderIniciativaCard(ini));
    });
    wrap.appendChild(section);
  }

  if (f.equipos && f.equipos.length) {
    const section = el(`
      <div class="section">
        <div class="section-head"><h2>Iniciativas acompañadas (acompañamiento ágil mensual)</h2></div>
        <table class="data-table equipo-table">
          <thead><tr><th>Product Manager / Product Owner</th><th>Ejemplos de iniciativas</th></tr></thead>
          <tbody></tbody>
        </table>
      </div>
    `);
    const tbody = section.querySelector("tbody");
    f.equipos.forEach(e => tbody.appendChild(el(`<tr><td>${e.pm}</td><td>${e.ejemplos}</td></tr>`)));
    wrap.appendChild(section);
  }

  if (!f.iniciativasPropias.length && !(f.equipos && f.equipos.length)) {
    wrap.appendChild(el(`<p style="color:var(--slate); font-size:13.5px;">Este frente fue parte del alcance del acompañamiento ágil mensual multi-frente durante H1, sin registro de iniciativas o equipos individualizados en el informe de origen.</p>`));
  }

  return wrap;
}

// ------------------------------------------------------------
// VIEW: PRÓXIMOS PASOS
// ------------------------------------------------------------
function renderProximosPasos() {
  const wrap = el(`
    <div>
      <div class="page-head">
        <div class="eyebrow">Foco estratégico ${REPORT.meta.proximoPeriodoLabel}</div>
        <h1>Próximos Pasos</h1>
        <p class="desc">Líneas de trabajo estratégicas previstas para el siguiente período, ordenadas por prioridad. No reemplaza al backlog operativo de cada iniciativa.</p>
      </div>
    </div>
  `);

  const grupos = [
    { key: "Alta", label: "Prioridad Alta", color: "var(--coral)", css: "alta" },
    { key: "Media", label: "Prioridad Media", color: "var(--yellow)", css: "media" },
    { key: "Normal", label: "Prioridad Normal", color: "var(--green)", css: "normal" },
  ];

  grupos.forEach(g => {
    const items = REPORT.proximosPasos.filter(p => p.prioridad === g.key);
    if (!items.length) return;
    const group = el(`
      <div class="prioridad-group">
        <div class="prioridad-title"><span class="prioridad-dot" style="background:${g.color};"></span>${g.label}</div>
      </div>
    `);
    items.forEach(p => {
      const card = el(`
        <div class="pasos-card ${g.css}">
          <div class="pasos-card-head">
            <h3>${p.eje}</h3>
            <span class="impacto-tag">→ ${p.impacto}</span>
          </div>
          <p class="descripcion">${p.descripcion}</p>
          ${p.meta ? `<div class="meta-text">🎯 Meta: ${p.meta}</div>` : ""}
          <div class="acciones"></div>
        </div>
      `);
      const acciones = card.querySelector(".acciones");
      p.acciones.forEach(a => acciones.appendChild(el(`<div class="accion-item"><span class="bullet">—</span><span>${a}</span></div>`)));
      group.appendChild(card);
    });
    wrap.appendChild(group);
  });

  return wrap;
}

// ------------------------------------------------------------
// SHELL: sidebar, topbar, period picker
// ------------------------------------------------------------
function buildShell() {
  const app = document.getElementById("app");

  const sidebar = el(`
    <aside class="sidebar" id="sidebar">
      <div class="sidebar-brand">
        <div class="org">Swiss Medical Group</div>
        <div class="sub">Portal Ejecutivo de Gestión</div>
      </div>
      <nav class="sidebar-nav" id="sidebar-nav"></nav>
      <div class="sidebar-footer" id="sidebar-footer"></div>
    </aside>
  `);
  const nav = sidebar.querySelector("#sidebar-nav");
  NAV_ITEMS.forEach(item => {
    const btn = el(`<button class="nav-item" data-nav="${item.id}">${ICONS[item.icon]}<span>${item.label}</span></button>`);
    btn.addEventListener("click", () => navigate(periodPath(item.id)));
    nav.appendChild(btn);
  });

  const overlay = el(`<div class="sidebar-overlay" id="sidebar-overlay"></div>`);
  overlay.addEventListener("click", closeMobileSidebar);

  const main = el(`
    <div class="main">
      <div class="mobile-topbar">
        <button id="mobile-menu-btn" aria-label="Abrir menú">${ICONS.menu}</button>
        <span class="org">Swiss Medical Group</span>
      </div>
      <header class="topbar">
        <div class="breadcrumb" id="breadcrumb"></div>
        <div class="topbar-actions">
          <div class="period-picker">
            <label for="period-select">Período</label>
            <select id="period-select" class="period-select"></select>
          </div>
          <div class="download-wrap">
            <button id="download-btn" class="icon-btn" title="Descargar Informe en PDF" aria-haspopup="true" aria-expanded="false">
              ${ICONS.download}
            </button>
            <div class="download-menu" id="download-menu">
              <button class="download-menu-item" data-mode="ejecutivo">
                <span class="dmi-title">Informe Ejecutivo</span>
                <span class="dmi-desc">Las 5 secciones principales del portal</span>
              </button>
              <button class="download-menu-item" data-mode="detallado">
                <span class="dmi-title">Informe Detallado</span>
                <span class="dmi-desc">Secciones principales + detalle de cada iniciativa y frente</span>
              </button>
            </div>
          </div>
        </div>
      </header>
      <main class="view-root" id="view-root"></main>
    </div>
  `);

  const select = main.querySelector("#period-select");
  PERIODS_META.forEach(p => {
    const opt = document.createElement("option");
    opt.value = p.id;
    opt.textContent = p.label;
    select.appendChild(opt);
  });
  select.addEventListener("change", () => {
    navigate(`#/${select.value}/dashboard`);
  });

  main.querySelector("#mobile-menu-btn").addEventListener("click", openMobileSidebar);

  const downloadBtn = main.querySelector("#download-btn");
  const downloadMenu = main.querySelector("#download-menu");
  downloadBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    const willOpen = !downloadMenu.classList.contains("open");
    downloadMenu.classList.toggle("open", willOpen);
    downloadBtn.classList.toggle("active", willOpen);
    downloadBtn.setAttribute("aria-expanded", String(willOpen));
  });
  downloadMenu.querySelectorAll(".download-menu-item").forEach(btn => {
    btn.addEventListener("click", () => {
      downloadMenu.classList.remove("open");
      downloadBtn.classList.remove("active");
      printReport(btn.dataset.mode);
    });
  });
  document.addEventListener("click", () => {
    downloadMenu.classList.remove("open");
    downloadBtn.classList.remove("active");
  });

  app.appendChild(sidebar);
  app.appendChild(overlay);
  app.appendChild(main);

  const printRoot = document.createElement("div");
  printRoot.id = "print-root";
  document.body.appendChild(printRoot);
}

function openMobileSidebar() {
  document.getElementById("sidebar").classList.add("open");
  document.getElementById("sidebar-overlay").classList.add("open");
}
function closeMobileSidebar() {
  const sb = document.getElementById("sidebar");
  const ov = document.getElementById("sidebar-overlay");
  if (sb) sb.classList.remove("open");
  if (ov) ov.classList.remove("open");
}

// ------------------------------------------------------------
// DESCARGA DE INFORME (PDF vía impresión nativa del navegador)
// ------------------------------------------------------------
function stripInteractive(node) {
  node.querySelectorAll(".back-link, .filters-bar, .link-all").forEach(n => n.remove());
  return node;
}

function buildPrintSection(titleText, contentEl) {
  const section = document.createElement("div");
  section.className = "print-page-break";
  section.appendChild(el(`<h2 class="print-section-title">${titleText}</h2>`));
  section.appendChild(contentEl);
  return section;
}

function buildPrintReport(mode) {
  const root = document.createElement("div");
  root.className = "print-report";

  const fecha = new Date().toLocaleDateString("es-AR", { day: "2-digit", month: "long", year: "numeric" });
  root.appendChild(el(`
    <div class="print-cover">
      <div class="print-cover-eyebrow">Swiss Medical Group</div>
      <h1>Portal Ejecutivo de Gestión</h1>
      <p>${mode === "detallado" ? "Informe Detallado" : "Informe Ejecutivo"} — ${REPORT.meta.periodoLabel} (${REPORT.meta.periodoFechas})</p>
      <p class="print-cover-meta">${REPORT.meta.autor} · ${REPORT.meta.rol}</p>
      <p class="print-cover-date">Generado el ${fecha}</p>
    </div>
  `));

  root.appendChild(buildPrintSection("1. Resumen Ejecutivo", stripInteractive(renderDashboard())));

  if (mode === "detallado") {
    const iniWrap = document.createElement("div");
    REPORT.iniciativas.forEach(ini => {
      iniWrap.appendChild(stripInteractive(renderIniciativaDetalle(ini.id)));
    });
    root.appendChild(buildPrintSection("2. Iniciativas Estratégicas — Detalle", iniWrap));
  } else {
    root.appendChild(buildPrintSection("2. Iniciativas Estratégicas", stripInteractive(renderIniciativas())));
  }

  root.appendChild(buildPrintSection("3. Indicadores Consolidados", stripInteractive(renderIndicadores())));

  if (mode === "detallado") {
    const frWrap = document.createElement("div");
    REPORT.frentes.forEach(f => {
      frWrap.appendChild(stripInteractive(renderFrenteDetalle(f.id)));
    });
    root.appendChild(buildPrintSection("4. Frentes de Trabajo — Detalle", frWrap));
  } else {
    root.appendChild(buildPrintSection("4. Frentes de Trabajo", stripInteractive(renderFrentes())));
  }

  root.appendChild(buildPrintSection("5. Próximos Pasos", stripInteractive(renderProximosPasos())));

  return root;
}

function showPrintConfirm(onConfirm) {
  const overlay = el(`
    <div class="print-modal-overlay">
      <div class="print-modal" role="dialog" aria-modal="true" aria-labelledby="print-modal-title">
        <div class="print-modal-icon">${ICONS.download}</div>
        <h3 id="print-modal-title">Se abrirá el diálogo de impresión</h3>
        <p>Elegí <b>Guardar como PDF</b> como destino y activá <b>Gráficos de fondo</b> (en "Más opciones") para conservar los colores del informe.</p>
        <div class="print-modal-actions">
          <button class="btn-secondary" id="print-modal-cancel">Cancelar</button>
          <button class="btn-primary" id="print-modal-continue">Continuar</button>
        </div>
      </div>
    </div>
  `);
  document.body.appendChild(overlay);

  function close() { overlay.remove(); }
  overlay.querySelector("#print-modal-cancel").addEventListener("click", close);
  overlay.addEventListener("click", (e) => { if (e.target === overlay) close(); });
  overlay.querySelector("#print-modal-continue").addEventListener("click", () => {
    close();
    onConfirm();
  });
}

function printReport(mode) {
  showPrintConfirm(() => {
    const printRoot = document.getElementById("print-root");
    printRoot.innerHTML = "";
    printRoot.appendChild(buildPrintReport(mode));

    const prevTitle = document.title;
    document.title = `Portal_Ejecutivo_SMG_${REPORT.meta.periodoLabel.replace(/\s+/g, "_")}_${mode === "detallado" ? "Detallado" : "Ejecutivo"}`;
    document.body.classList.add("is-printing");

    requestAnimationFrame(() => requestAnimationFrame(() => window.print()));

    window.onafterprint = () => {
      document.body.classList.remove("is-printing");
      document.title = prevTitle;
      printRoot.innerHTML = "";
    };
  });
}

// ------------------------------------------------------------
// INIT
// ------------------------------------------------------------
buildShell();
window.addEventListener("hashchange", render);
render();
