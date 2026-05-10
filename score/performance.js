// /score/performance.js — Cryptomath performance page
(function () {
  "use strict";

  const API_BASE = "/api/performance";

  const I18N = {
    en: {
      loading: "Loading…",
      empty: "No data yet. Detections will appear as the Score Tool emits them.",
      lastUpdate: (when) => `Last update: ${when}.`,
      sample: (n) => `Sample: ${n} entries.`,
      neverUpdated: "No update yet.",
      avgMfe: "Avg MFE",
      avgMae: "Avg MAE",
      avgPerf: "Avg dir-perf",
      count: "Count",
      byType: "By type",
      byRegime: "By regime",
      byDirection: "By direction",
      error: "Could not load data. Check back in a moment.",
      pending: "to come",
      statusTracked: "TRACKED",
      statusEnded: "ENDED",
      statusUnknown: "—",
      simNoData: "Waiting for detection data.",
      simNoPerf: "Performance data is not available yet.",
      simLine: (total, count, ended) => `${total} across ${count} detections · ${ended} ended`,
      simFoot: (active) => `Simulation normalized to 1 USDC per detection. ${active} still tracked. Current unrealized value only. Not realized PnL.`,
      totalBest: (v) => `${v} cumulative`,
      totalWorst: (v) => `${v} cumulative`,
      medianValue: (v) => `${v} median`,
      captureRate: (v) => `${v}%`,
      captureUnavailable: "—"
    },
    fr: {
      loading: "Chargement…",
      empty: "Aucune donnée pour l'instant. Les détections apparaîtront au fur et à mesure.",
      lastUpdate: (when) => `Dernière mise à jour : ${when}.`,
      sample: (n) => `Échantillon : ${n} entrées.`,
      neverUpdated: "Pas encore de mise à jour.",
      avgMfe: "MFE moyen",
      avgMae: "MAE moyen",
      avgPerf: "Perf dir. moyenne",
      count: "Nombre",
      byType: "Par type",
      byRegime: "Par régime",
      byDirection: "Par direction",
      error: "Impossible de charger les données. Réessayez dans un instant.",
      pending: "à venir",
      statusTracked: "SUIVI",
      statusEnded: "TERMINÉ",
      statusUnknown: "—",
      simNoData: "En attente des données de détection.",
      simNoPerf: "Les données de performance ne sont pas encore disponibles.",
      simLine: (total, count, ended) => `${total} sur ${count} détections · ${ended} terminées`,
      simFoot: (active) => `Simulation normalisée à 1 USDC par détection. ${active} encore suivies. Valeur latente actuelle uniquement. Pas un PnL réalisé.`,
      totalBest: (v) => `${v} cumulés`,
      totalWorst: (v) => `${v} cumulés`,
      medianValue: (v) => `${v} médian`,
      captureRate: (v) => `${v}%`,
      captureUnavailable: "—"
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

  function fmtUsdc(v, decimals) {
    if (v === null || v === undefined || !isFinite(v)) return "—";
    const d = decimals === undefined ? 3 : decimals;
    const sign = v > 0 ? "+" : "";
    return sign + Number(v).toFixed(d) + " USDC";
  }

  function median(values) {
    const arr = values.filter(v => typeof v === "number" && isFinite(v)).slice().sort((a, b) => a - b);
    if (!arr.length) return null;
    const mid = Math.floor(arr.length / 2);
    if (arr.length % 2) return arr[mid];
    return (arr[mid - 1] + arr[mid]) / 2;
  }

  function fmtPrice(v) {
    if (v === null || v === undefined || !isFinite(v)) return "—";
    const n = Number(v);
    if (n >= 1000) return n.toLocaleString("en-US", { maximumFractionDigits: 0 });
    if (n >= 1) return n.toFixed(2);
    if (n >= 0.01) return n.toFixed(4);
    return n.toPrecision(3);
  }

  // Map raw API status to a user-facing label that does not suggest the
  // detection is still tradable. "active" means the tracking window is still
  // open (some milestones not reached yet), not that the trade idea is live.
  function mapStatusLabel(rawStatus) {
    const s = String(rawStatus || "").toLowerCase();
    if (s === "active") return t.statusTracked;
    if (s === "expired" || s === "ended") return t.statusEnded;
    return t.statusUnknown;
  }

  function statusCssClass(rawStatus) {
    const s = String(rawStatus || "").toLowerCase();
    if (s === "active") return "tracked";
    if (s === "expired" || s === "ended") return "ended";
    return "";
  }

  function fmtDate(ts) {
    if (!ts) return "—";
    const d = new Date(ts);
    if (lang === "fr") {
      const day = d.getDate();
      const month = ["janvier","février","mars","avril","mai","juin","juillet","août","septembre","octobre","novembre","décembre"][d.getMonth()];
      const year = d.getFullYear();
      const hh = String(d.getHours()).padStart(2, "0");
      const mm = String(d.getMinutes()).padStart(2, "0");
      return `${day} ${month} ${year} à ${hh}h${mm}`;
    }
    return d.toLocaleString("en-GB", {
      year: "numeric", month: "long", day: "2-digit",
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
    if (v === null || v === undefined) {
      // Pas encore atteint = "à venir" / "to come"
      return `<span class="muted-cell">${t.pending}</span>`;
    }

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
      const rows = Object.entries(block)
        // Hide deprecated watch_emergency category when empty (kept in API
        // for historical records but no longer emitted publicly).
        .filter(([label, agg]) => !(label === "watch_emergency" && (!agg || !agg.count)))
        .map(([label, agg]) => {
        // Format X/Y correctes au lieu du % qui peut faire win-rate marketing
        let directionLine = "";
        if (agg.count > 0 && agg.directionCorrectPct !== null && agg.directionCorrectPct !== undefined) {
          const correctCount = Math.round((agg.directionCorrectPct / 100) * agg.count);
          const plural = agg.count > 1 ? (lang === "fr" ? "correctes" : "correct") : (lang === "fr" ? "correcte" : "correct");
          directionLine = ` · ${correctCount}/${agg.count} ${plural}`;
        }

        return `
          <dt>${escapeHtml(label)}</dt>
          <dd>
            <span title="${t.count}">${agg.count}</span>${directionLine}
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
          <td class="col-asset"><strong>${escapeHtml(item.asset || "—")}</strong></td>
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
          <td class="col-status"><span class="tag ${statusCssClass(item.status)}">${escapeHtml(mapStatusLabel(item.status))}</span></td>
        </tr>
      `;
    }).join("");

    tbody.innerHTML = rows;
  }


  // -------------------------------------------------------------------
  // Render 1 USDC directional simulation
  // -------------------------------------------------------------------
  function renderSimulation(data) {
    const root = document.getElementById("perfSimulation");
    if (!root) return;
    const valueEl = root.querySelector(".sim-value");
    const noteEl = root.querySelector(".sim-note");
    const mfeEl = root.querySelector("[data-sim-mfe]");
    const maeEl = root.querySelector("[data-sim-mae]");
    const mfeMedianEl = root.querySelector("[data-sim-mfe-median]");
    const maeMedianEl = root.querySelector("[data-sim-mae-median]");
    const captureEl = root.querySelector("[data-sim-capture]");

    if (!data || !data.ok || !Array.isArray(data.items) || data.items.length === 0) {
      if (valueEl) valueEl.textContent = t.simNoData;
      if (noteEl) noteEl.textContent = "";
      [mfeEl, maeEl, mfeMedianEl, maeMedianEl, captureEl].forEach(el => { if (el) el.textContent = "—"; });
      return;
    }

    const usable = data.items.filter(item => typeof item.directionalPerfPct === "number" && isFinite(item.directionalPerfPct));
    if (usable.length === 0) {
      if (valueEl) valueEl.textContent = t.simNoPerf;
      if (noteEl) noteEl.textContent = "";
      [mfeEl, maeEl, mfeMedianEl, maeMedianEl, captureEl].forEach(el => { if (el) el.textContent = "—"; });
      return;
    }

    const pnl = usable.reduce((sum, item) => sum + (item.directionalPerfPct / 100), 0);
    const ended = usable.filter(item => {
      const st = String(item.status || "").toLowerCase();
      return st === "expired" || st === "ended";
    }).length;
    const active = usable.length - ended;
    const total = fmtUsdc(pnl, 3);

    const mfeUsdcValues = usable
      .filter(item => typeof item.mfe === "number" && isFinite(item.mfe))
      .map(item => Math.max(0, item.mfe) / 100);
    const maeUsdcValues = usable
      .filter(item => typeof item.mae === "number" && isFinite(item.mae))
      .map(item => {
        const raw = item.mae;
        return (raw > 0 ? -raw : raw) / 100;
      });

    const mfeTotal = mfeUsdcValues.reduce((sum, v) => sum + v, 0);
    const maeTotal = maeUsdcValues.reduce((sum, v) => sum + v, 0);
    const mfeMed = median(mfeUsdcValues);
    const maeMed = median(maeUsdcValues);
    const capture = mfeTotal > 0 ? Math.max(0, (pnl / mfeTotal) * 100) : null;

    if (valueEl) valueEl.textContent = t.simLine(total, usable.length, ended);
    if (noteEl) noteEl.textContent = t.simFoot(active);
    if (mfeEl) mfeEl.textContent = mfeUsdcValues.length ? t.totalBest(fmtUsdc(mfeTotal, 3)) : "—";
    if (maeEl) maeEl.textContent = maeUsdcValues.length ? t.totalWorst(fmtUsdc(maeTotal, 3)) : "—";
    if (mfeMedianEl) mfeMedianEl.textContent = mfeMed !== null ? t.medianValue(fmtUsdc(mfeMed, 3)) : "—";
    if (maeMedianEl) maeMedianEl.textContent = maeMed !== null ? t.medianValue(fmtUsdc(maeMed, 3)) : "—";
    if (captureEl) captureEl.textContent = capture !== null ? t.captureRate(Math.min(999, capture).toFixed(1)) : t.captureUnavailable;
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
    renderSimulation(list);
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
