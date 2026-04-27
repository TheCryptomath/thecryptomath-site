// /score/performance.js — Cryptomath performance page
(function () {
  "use strict";

  const API_BASE = "/api/performance";

  const I18N = {
    en: {
      loading: "Loading…",
      empty: "No data yet. Signals will appear as they are emitted by the Score Tool.",
      lastUpdate: (when) => `Last update ${when}.`,
      sample: (n) => `Sample size: ${n} entries.`,
      neverUpdated: "No update yet.",
      directionCorrect: "Direction-correct",
      avgMfe: "Avg MFE",
      avgMae: "Avg MAE",
      avgPerf: "Avg dir-perf",
      count: "Count",
      byType: "By type",
      byRegime: "By regime",
      byDirection: "By direction",
      error: "Could not load data. Check back in a moment."
    },
    fr: {
      loading: "Chargement…",
      empty: "Aucune donnée pour l'instant. Les signaux apparaîtront au fur et à mesure.",
      lastUpdate: (when) => `Dernière mise à jour ${when}.`,
      sample: (n) => `Échantillon : ${n} entrées.`,
      neverUpdated: "Pas encore de mise à jour.",
      directionCorrect: "Direction correcte",
      avgMfe: "MFE moyen",
      avgMae: "MAE moyen",
      avgPerf: "Perf dir. moyenne",
      count: "Nombre",
      byType: "Par type",
      byRegime: "Par régime",
      byDirection: "Par direction"
    }
  };

  const lang = (document.documentElement.lang || "en").startsWith("fr") ? "fr" : "en";
  const t = I18N[lang];

  let currentFilter = "";

  // -------------------------------------------------------------------
  // Fetch helpers
  // -------------------------------------------------------------------
  async function fetchJSON(path) {
    try {
      const res = await fetch(API_BASE + path, { headers: { accept: "application/json" } });
      if (!res.ok) return null;
      return await res.json();
    } catch (_e) {
      return null;
    }
  }

  // -------------------------------------------------------------------
  // Formatting
  // -------------------------------------------------------------------
  function fmtPct(v, decimals) {
    if (v === null || v === undefined || !isFinite(v)) return "—";
    const d = decimals === undefined ? 2 : decimals;
    const sign = v > 0 ? "+" : "";
    return sign + Number(v).toFixed(d) + "%";
  }

  function fmtPrice(v) {
    if (v === null || v === undefined || !isFinite(v)) return "—";
    const n = Number(v);
    if (n >= 1000) return n.toLocaleString("en-US", { maximumFractionDigits: 0 });
    if (n >= 1) return n.toFixed(2);
    if (n >= 0.01) return n.toFixed(4);
    return n.toPrecision(3);
  }

  function fmtDate(ts) {
    if (!ts) return "—";
    const d = new Date(ts);
    return d.toLocaleString(lang === "fr" ? "fr-FR" : "en-GB", {
      year: "numeric", month: "short", day: "2-digit",
      hour: "2-digit", minute: "2-digit"
    });
  }

  function fmtAge(ts) {
    if (!ts) return "—";
    const diff = Date.now() - ts;
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return lang === "fr" ? "à l'instant" : "just now";
    if (minutes < 60) return minutes + (lang === "fr" ? " min" : "m");
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return hours + "h";
    const days = Math.floor(hours / 24);
    return days + "d";
  }

  function priceAtMilestone(item, key) {
    const v = item.priceAt && item.priceAt[key];
    if (v === null || v === undefined) return "—";

    // Calculer la perf entre T0 et milestone
    const p0 = item.priceAtT0;
    if (typeof p0 !== "number" || p0 <= 0) return fmtPrice(v);

    const dir = (item.direction || "").toLowerCase();
    let perf = 0;
    if (dir === "long")  perf = (v - p0) / p0 * 100;
    if (dir === "short") perf = (p0 - v) / p0 * 100;

    const cls = perf > 0 ? "perf-pos" : (perf < 0 ? "perf-neg" : "");
    return `<span class="${cls}">${fmtPct(perf, 1)}</span>`;
  }

  // -------------------------------------------------------------------
  // Render summary
  // -------------------------------------------------------------------
  function renderSummary(data) {
    const meta = document.getElementById("perfMeta");
    if (!data || !data.ok) {
      if (meta) meta.textContent = t.error || "Error";
      return;
    }

    if (data.totals) {
      for (const type of Object.keys(data.totals)) {
        const el = document.querySelector(`[data-summary="${type}"]`);
        if (el) el.textContent = String(data.totals[type]);
      }
    }
    const activeEl = document.querySelector('[data-summary="active"]');
    if (activeEl) activeEl.textContent = String(data.activeCount || 0);
    const expiredEl = document.querySelector('[data-summary="expired"]');
    if (expiredEl) expiredEl.textContent = String(data.expiredCount || 0);

    if (meta) {
      const when = data.lastUpdateTs ? fmtDate(data.lastUpdateTs) : t.neverUpdated;
      meta.textContent = data.lastUpdateTs ? t.lastUpdate(when) : t.neverUpdated;
    }
  }

  // -------------------------------------------------------------------
  // Render stats
  // -------------------------------------------------------------------
  function renderStats(data) {
    const root = document.getElementById("perfStats");
    if (!root) return;
    if (!data || !data.ok || !data.stats) {
      root.textContent = t.empty;
      return;
    }

    const sections = [
      { key: "byType", title: t.byType },
      { key: "byRegime", title: t.byRegime },
      { key: "byDirection", title: t.byDirection }
    ];

    const html = sections.map(section => {
      const block = data.stats[section.key] || {};
      const rows = Object.entries(block).map(([label, agg]) => {
        return `
          <dt>${escapeHtml(label)}</dt>
          <dd>
            <span title="${t.count}">${agg.count}</span>
            ${agg.directionCorrectPct !== null && agg.directionCorrectPct !== undefined
              ? ` · ${fmtPct(agg.directionCorrectPct, 1)} ${t.directionCorrect}` : ""}
          </dd>
        `;
      }).join("");

      return `
        <div class="stats-block">
          <h3>${section.title}</h3>
          <dl>${rows || `<dt class="muted">—</dt><dd></dd>`}</dl>
        </div>
      `;
    }).join("");

    root.innerHTML = html;

    if (data.sample !== undefined) {
      const meta = document.getElementById("perfMeta");
      if (meta) {
        const cur = meta.textContent || "";
        meta.textContent = cur + " " + t.sample(data.sample);
      }
    }
  }

  // -------------------------------------------------------------------
  // Render list
  // -------------------------------------------------------------------
  function renderList(data) {
    const tbody = document.getElementById("perfTableBody");
    if (!tbody) return;

    if (!data || !data.ok) {
      tbody.innerHTML = `<tr><td colspan="14" class="empty">${t.error || "Error"}</td></tr>`;
      return;
    }

    if (!data.items || data.items.length === 0) {
      tbody.innerHTML = `<tr><td colspan="14" class="empty">${t.empty}</td></tr>`;
      return;
    }

    const rows = data.items.map(item => {
      const dirClass = (item.direction || "").toLowerCase() === "long" ? "dir-long" : "dir-short";
      const perf = item.directionalPerfPct;
      const perfClass = perf > 0 ? "perf-pos" : (perf < 0 ? "perf-neg" : "");

      return `
        <tr>
          <td title="${escapeHtml(fmtDate(item.ts))}">${fmtAge(item.ts)}</td>
          <td><span class="tag ${escapeHtml(item.type || "")}">${escapeHtml(item.type || "—")}</span></td>
          <td><strong>${escapeHtml(item.asset || "—")}</strong></td>
          <td class="${dirClass}">${escapeHtml(item.direction || "—")}</td>
          <td>${escapeHtml(item.regime || "—")}</td>
          <td>${item.score !== null && item.score !== undefined ? Number(item.score).toFixed(1) : "—"}</td>
          <td>${fmtPrice(item.priceAtT0)}</td>
          <td>${fmtPrice(item.priceCurrent)}</td>
          <td>${priceAtMilestone(item, "+24h")}</td>
          <td>${priceAtMilestone(item, "+7d")}</td>
          <td class="perf-pos">${fmtPct(item.mfe, 1)}</td>
          <td class="perf-neg">${fmtPct(item.mae, 1)}</td>
          <td class="${perfClass}">${fmtPct(perf, 1)}</td>
          <td><span class="tag">${escapeHtml(item.status || "—")}</span></td>
        </tr>
      `;
    }).join("");

    tbody.innerHTML = rows;
  }

  // -------------------------------------------------------------------
  // Filters
  // -------------------------------------------------------------------
  function setupFilters() {
    const chips = document.querySelectorAll(".chip[data-filter]");
    chips.forEach(chip => {
      chip.addEventListener("click", async () => {
        chips.forEach(c => c.classList.remove("active"));
        chip.classList.add("active");
        currentFilter = chip.getAttribute("data-filter") || "";
        await loadList();
      });
    });
  }

  // -------------------------------------------------------------------
  // Loaders
  // -------------------------------------------------------------------
  async function loadAll() {
    const [summary, stats, list] = await Promise.all([
      fetchJSON("/summary"),
      fetchJSON("/stats"),
      fetchJSON(`/list?limit=50${currentFilter ? "&type=" + encodeURIComponent(currentFilter) : ""}`)
    ]);
    renderSummary(summary);
    renderStats(stats);
    renderList(list);
  }

  async function loadList() {
    const list = await fetchJSON(`/list?limit=50${currentFilter ? "&type=" + encodeURIComponent(currentFilter) : ""}`);
    renderList(list);
  }

  // -------------------------------------------------------------------
  // Utils
  // -------------------------------------------------------------------
  function escapeHtml(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  // -------------------------------------------------------------------
  // Boot
  // -------------------------------------------------------------------
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      setupFilters();
      loadAll();
    });
  } else {
    setupFilters();
    loadAll();
  }
})();
