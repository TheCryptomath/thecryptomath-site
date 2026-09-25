// /score/performance.js — Cryptomath performance page
(function () {
  "use strict";

  const API_BASE = "/api/performance";

  const I18N = {
    en: {
      loading: "Loading…",
      empty: "No data yet. Detections will appear as Score Scan records them.",
      lastUpdate: (when) => `Last update: ${when}.`,
      sample: (n) => `Sample: ${n} entries.`,
      neverUpdated: "No update yet.",
      error: "Could not load data. Check back in a moment.",
      pending: "to come",
      experimentalDetection: "Experimental",
      exceptionalLegacy: "Exceptional",
      active24h: "ACTIVE · ≤24H",
      researchTracking: "RESEARCH TRACKING",
      perfInProgress: "in progress",
      researchComplete: "RESEARCH COMPLETE",
      statusUnknown: "—",
      all: "All",
      byRegime: "By regime",
      byDirection: "By direction",
      overall: "Overall",
      positive24h: "Positive at +24h",
      median24h: "Median perf. at +24h",
      sample24h: (n, total) => `${n}/${total} with +24h data`,
      median7dResearch: "Median perf. at +7d (research)",
      researchSample7d: "Research sample at +7d",
      no24hData: "Waiting for +24h data",
      primaryHorizonNote: "+24h is the primary public research window. +7d is retained as a secondary research follow-up. These are observations, not validated trading results.",
      statsAwaitingDiversity: "Aggregate breakdowns will appear once enough detections reach +24h.",
      simNoData: "Waiting for detection data.",
      simLine: (total, count, ended) => `${total} across ${count} detections · ${ended} completed`,
      simFoot: (active) => `Simulation. 1 USDC allocated per detection, no leverage. ${active} still tracked. Current unrealized value only. Experimental research, not a trading strategy.`,
      totalGroupTitle: (n) => `Across all ${n} detections`,
      totalGroupTitleFallback: "Across all detections",
      medianGroupTitle: "Per detection (median)",
      captureUnavailable: "—",
      captureBelowEntry: "Simulated value currently below entry",
      captureFormula: "current value / best move observed",
      simAllTitle: "All tracked detections",
      tgMeta: (n, since, delay) =>
        `${n} selected detections` +
        (since ? ` \u00b7 public history since ${since}` : "") +
        ` \u00b7 each detection becomes public ${delay}h after it was recorded.`,
      tgSub24: (n) => `${n} ${n === 1 ? "reading" : "readings"} at +24h`,
      tgSub7: (n) => `${n} ${n === 1 ? "reading" : "readings"} at +7d`,
      notCaptured: "not captured",
      notCapturedTitle: "No price reading within 2h of this milestone. Left empty rather than filled late.",
      tgEmpty: "No selected detection has passed the public delay yet.",
      tgError: "Could not load the selected detections. Check back in a moment.",
      tgCohortNote: "This block covers only the detections selected for publication in the Telegram channel. Selection applies anti-repetition and tier filters, so it is not a random sample of the tracked record. Selected for publication, delivery not confirmed. Publication marking started at the date above; earlier detections are not marked and are not added retroactively.",
      tgShowAll: (n, capped) => capped ? `Show the ${n} most recent` : `Show all ${n}`,
      tgShowLess: "Show the 10 most recent",
      tgTruncated: (shown, total) => `Table limited to the ${shown} most recent of ${total} selected detections. The figures above cover all of them.`
    },
    fr: {
      loading: "Chargement…",
      empty: "Aucune donnée pour l'instant. Les détections apparaîtront à mesure que Score Scan les enregistre.",
      lastUpdate: (when) => `Dernière mise à jour : ${when}.`,
      sample: (n) => `Échantillon : ${n} entrées.`,
      neverUpdated: "Pas encore de mise à jour.",
      error: "Impossible de charger les données. Réessayez dans un instant.",
      pending: "à venir",
      experimentalDetection: "Expérimentale",
      exceptionalLegacy: "Exceptional",
      active24h: "ACTIVE · ≤24H",
      researchTracking: "SUIVI RECHERCHE",
      perfInProgress: "en cours",
      researchComplete: "RECHERCHE TERMINÉE",
      statusUnknown: "—",
      all: "Toutes",
      byRegime: "Par régime",
      byDirection: "Par direction",
      overall: "Ensemble",
      positive24h: "Détections positives à +24h",
      median24h: "Perf. médiane à +24h",
      sample24h: (n, total) => `${n}/${total} avec données +24h`,
      median7dResearch: "Perf. médiane à +7j (recherche)",
      researchSample7d: "Échantillon recherche à +7j",
      no24hData: "En attente des données +24h",
      primaryHorizonNote: "+24h est la fenêtre de recherche publique principale. +7j reste un suivi de recherche secondaire. Ces chiffres sont des observations, pas des résultats de trading validés.",
      statsAwaitingDiversity: "Les détails apparaîtront dès qu'assez de détections auront atteint +24h.",
      simNoData: "En attente des données de détection.",
      simLine: (total, count, ended) => `${total} sur ${count} détections · ${ended} ${ended > 1 ? "terminées" : "terminée"}`,
      simFoot: (active) => `Simulation. 1 USDC alloué par détection, sans levier. ${active} encore suivies. Résultat actuel non clôturé. Recherche expérimentale, pas une stratégie de trading.`,
      totalGroupTitle: (n) => `Sur les ${n} détections`,
      totalGroupTitleFallback: "Sur l'ensemble des détections",
      medianGroupTitle: "Par détection (médiane)",
      captureUnavailable: "—",
      captureBelowEntry: "Valeur simulée actuellement sous le point d'entrée",
      captureFormula: "valeur actuelle / meilleur mouvement observé",
      simAllTitle: "Toutes les détections suivies",
      tgMeta: (n, since, delay) =>
        `${n} d\u00e9tections s\u00e9lectionn\u00e9es` +
        (since ? ` \u00b7 historique public depuis le ${since}` : "") +
        ` \u00b7 chaque d\u00e9tection devient publique ${delay}h apr\u00e8s son enregistrement.`,
      tgSub24: (n) => `${n} ${n > 1 ? "relev\u00e9s" : "relev\u00e9"} \u00e0 +24h`,
      tgSub7: (n) => `${n} ${n > 1 ? "relev\u00e9s" : "relev\u00e9"} \u00e0 +7j`,
      notCaptured: "non relevé",
      notCapturedTitle: "Aucun relevé de prix dans les 2h suivant ce jalon. Laissé vide plutôt que rempli en retard.",
      tgEmpty: "Aucune détection sélectionnée n'a encore passé le délai public.",
      tgError: "Impossible de charger les détections sélectionnées. Réessayez dans un instant.",
      tgCohortNote: "Ce bloc ne couvre que les détections sélectionnées pour publication dans le canal Telegram. La sélection applique des filtres anti-répétition et de niveau, ce n'est donc pas un échantillon aléatoire du registre suivi. Sélectionnées pour publication, livraison non confirmée. Le marquage des publications a démarré à la date indiquée ci-dessus, les détections antérieures ne sont pas marquées et ne le seront pas rétroactivement.",
      tgShowAll: (n, capped) => capped ? `Afficher les ${n} plus r\u00e9centes` : `Afficher les ${n}`,
      tgShowLess: "Afficher les 10 plus r\u00e9centes",
      tgTruncated: (shown, total) => `Tableau limité aux ${shown} détections sélectionnées les plus récentes sur ${total}. Les chiffres ci-dessus portent sur l'ensemble.`
    }
  };

  const lang = (document.documentElement.lang || "en").startsWith("fr") ? "fr" : "en";
  const t = I18N[lang];

  let currentFilter = "";
  let cachedList = null;
  let cachedTelegram = null;
  let telegramExpanded = false;
  const TELEGRAM_PREVIEW_ROWS = 10;

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

  function fmtCapturePct(v, decimals) {
    if (v === null || v === undefined || !isFinite(v)) return "—";
    const d = decimals === undefined ? 1 : decimals;
    return Number(v).toFixed(d) + "%";
  }

  function metricTone(v) {
    if (v === null || v === undefined || !isFinite(v)) return "";
    if (Number(v) > 0) return "perf-pos";
    if (Number(v) < 0) return "perf-neg";
    return "";
  }

  function displayBucketLabel(label) {
    const key = String(label || "");
    const labels = {
      exceptional: t.exceptionalLegacy,
      signal: t.experimentalDetection,
      watchlist: t.experimentalDetection,
      watch_emergency: t.experimentalDetection,
      all: t.overall,
      Bull: "Bull",
      Range: "Range",
      Bear: "Bear",
      Long: "Long",
      Short: "Short"
    };
    return labels[key] || key.replace(/_/g, " ");
  }

  function publicType(rawType) {
    const type = String(rawType || "").toLowerCase();
    // The public label stays a single class. The tracking window is appended so
    // a reader can see why two rows leave the table after different durations,
    // without re-exposing the internal tiers as a performance hierarchy.
    if (type === "signal") {
      return { label: t.experimentalDetection + " \u00b7 21d", css: "experimental" };
    }
    if (type === "watchlist" || type === "watch_emergency") {
      return { label: t.experimentalDetection + " \u00b7 7d", css: "experimental" };
    }
    if (type === "exceptional") return { label: t.exceptionalLegacy, css: "exceptional" };
    return { label: t.experimentalDetection, css: "experimental" };
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

  // Public status is based on the research window, not a trade recommendation.
  // A detection is "active" only during its first 24 hours. Older detections
  // remain visible as research tracking until the backend tracking ends.
  function publicStatus(item) {
    const raw = String(item && item.status || "").toLowerCase();
    if (raw === "expired" || raw === "ended") {
      return { label: t.researchComplete, css: "research-complete" };
    }
    const ts = Number(item && item.ts);
    if (Number.isFinite(ts) && Date.now() - ts <= 24 * 60 * 60 * 1000) {
      return { label: t.active24h, css: "active-24h" };
    }
    if (raw === "active") return { label: t.researchTracking, css: "research-tracking" };
    return { label: t.statusUnknown, css: "" };
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

  const MONTHS_LONG = {
    en: ["January","February","March","April","May","June","July","August","September","October","November","December"],
    fr: ["janvier","février","mars","avril","mai","juin","juillet","août","septembre","octobre","novembre","décembre"]
  };

  const MONTHS_SHORT = {
    en: ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],
    fr: ["janv.","févr.","mars","avr.","mai","juin","juil.","août","sept.","oct.","nov.","déc."]
  };

  // Date without the time part, for the "public history since" line.
  function fmtDateOnly(ts) {
    if (!ts) return null;
    const d = new Date(ts);
    if (!Number.isFinite(d.getTime())) return null;
    const month = MONTHS_LONG[lang][d.getMonth()];
    // Same day-month-year order in both languages, matching fmtDate (en-GB).
    return `${d.getDate()} ${month} ${d.getFullYear()}`;
  }

  // Compact day + month, so a reader can match a row against what the channel
  // sent that day. The full timestamp stays available as the cell title.
  function fmtDateCompact(ts) {
    if (!ts) return "\u2014";
    const d = new Date(ts);
    if (!Number.isFinite(d.getTime())) return "\u2014";
    return `${String(d.getDate()).padStart(2, "0")} ${MONTHS_SHORT[lang][d.getMonth()]}`;
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

  // Mirrors the Scanner rule TRACKING_MILESTONE_MAX_LATE_BACKFILL_MS (2h): a
  // milestone still empty 2h after its target is never filled afterwards, and
  // expired entries are no longer updated. Those cells must not say "to come".
  const MILESTONE_TARGET_MS = { "+24h": 24 * 3600 * 1000, "+7d": 7 * 24 * 3600 * 1000 };
  const MILESTONE_MAX_LATE_MS = 2 * 3600 * 1000;

  function milestoneClosed(item, key) {
    const raw = String(item && item.status || "").toLowerCase();
    if (raw === "expired" || raw === "ended") return true;
    const target = MILESTONE_TARGET_MS[key];
    const ts = Number(item && item.ts);
    if (!target || !Number.isFinite(ts)) return false;
    return Date.now() - ts > target + MILESTONE_MAX_LATE_MS;
  }

  function priceAtMilestone(item, key) {
    const v = item.priceAt && item.priceAt[key];
    if (v === null || v === undefined) {
      if (milestoneClosed(item, key)) {
        return `<span class="muted-cell" title="${escapeHtml(t.notCapturedTitle)}">${t.notCaptured}</span>`;
      }
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

  function perfAtMilestone(item, key) {
    const rawP0 = item && item.priceAtT0;
    const rawP = item && item.priceAt && item.priceAt[key];
    if (rawP0 === null || rawP0 === undefined || rawP === null || rawP === undefined) return null;
    const p0 = Number(rawP0);
    const p = Number(rawP);
    if (!Number.isFinite(p0) || p0 <= 0 || !Number.isFinite(p)) return null;
    const dir = String(item.direction || "").toLowerCase();
    if (dir === "long") return ((p - p0) / p0) * 100;
    if (dir === "short") return ((p0 - p) / p0) * 100;
    return null;
  }

  function summarizeItems(items) {
    const p24 = items.map(item => perfAtMilestone(item, "+24h")).filter(Number.isFinite);
    const p7 = items.map(item => perfAtMilestone(item, "+7d")).filter(Number.isFinite);
    return {
      count: items.length,
      n24: p24.length,
      positive24: p24.length ? (p24.filter(v => v > 0).length / p24.length) * 100 : null,
      median24: median(p24),
      n7: p7.length,
      median7: median(p7)
    };
  }

  // -------------------------------------------------------------------
  // Render summary
  // -------------------------------------------------------------------
  function renderSummary(summary, list) {
    const meta = document.getElementById("perfMeta");
    if (!summary || !summary.ok) {
      if (meta) meta.textContent = t.error;
      return;
    }

    const totals = summary.totals || {};
    const experimental = Number(totals.signal || 0) + Number(totals.watchlist || 0) + Number(totals.watch_emergency || 0);
    const experimentalEl = document.querySelector('[data-summary="experimental"]');
    if (experimentalEl) experimentalEl.textContent = String(experimental);
    const exceptionalEl = document.querySelector('[data-summary="exceptional"]');
    if (exceptionalEl) exceptionalEl.textContent = String(Number(totals.exceptional || 0));

    const items = list && list.ok && Array.isArray(list.items) ? list.items : [];
    const serverStatus = summary.researchStatus || null;
    let active24 = serverStatus ? Number(serverStatus.active24 || 0) : 0;
    let researchTracking = serverStatus ? Number(serverStatus.researchTracking || 0) : 0;
    let researchComplete = serverStatus ? Number(serverStatus.researchComplete || 0) : 0;

    // Backward-compatible fallback during deployment ordering.
    if (!serverStatus) {
      for (const item of items) {
        const status = publicStatus(item).css;
        if (status === "active-24h") active24++;
        else if (status === "research-tracking") researchTracking++;
        else if (status === "research-complete") researchComplete++;
      }
    }

    const activeEl = document.querySelector('[data-summary="active24"]');
    if (activeEl) activeEl.textContent = String(active24);
    const researchEl = document.querySelector('[data-summary="research"]');
    if (researchEl) researchEl.textContent = String(researchTracking);
    const completeEl = document.querySelector('[data-summary="complete"]');
    if (completeEl) completeEl.textContent = String(researchComplete);

    if (meta) {
      const when = summary.lastUpdateTs ? fmtDate(summary.lastUpdateTs) : t.neverUpdated;
      meta.textContent = summary.lastUpdateTs ? t.lastUpdate(when) : t.neverUpdated;
      const fullSample = Object.values(totals).reduce((sum, value) => sum + Number(value || 0), 0);
      if (fullSample) meta.textContent += " " + t.sample(fullSample);
    }
  }

  // -------------------------------------------------------------------
  // Render stats
  // -------------------------------------------------------------------
  function renderStats(data, listFallback) {
    const root = document.getElementById("perfStats");
    const note = document.getElementById("perfStatsNote");
    if (!root) return;
    if (note) note.textContent = t.primaryHorizonNote;

    const serverStats = data && data.ok && data.stats ? data.stats : null;
    let sections;

    if (serverStats && serverStats.overall) {
      sections = [
        { title: t.overall, groups: [["all", serverStats.overall]] },
        { title: t.byRegime, groups: ["Bull", "Range", "Bear"].map(key => [key, serverStats.byRegime && serverStats.byRegime[key]]) },
        { title: t.byDirection, groups: ["Long", "Short"].map(key => [key, serverStats.byDirection && serverStats.byDirection[key]]) }
      ];
    } else {
      // Backward-compatible fallback while the Worker update propagates.
      const items = listFallback && listFallback.ok && Array.isArray(listFallback.items) ? listFallback.items : [];
      if (!items.length) {
        root.textContent = t.empty;
        return;
      }
      const adapt = group => {
        const agg = summarizeItems(group);
        return {
          count: agg.count,
          sample24h: agg.n24,
          positivePct24h: agg.positive24,
          medianPerf24h: agg.median24,
          sample7d: agg.n7,
          medianPerf7d: agg.median7
        };
      };
      sections = [
        { title: t.overall, groups: [["all", adapt(items)]] },
        { title: t.byRegime, groups: ["Bull", "Range", "Bear"].map(key => [key, adapt(items.filter(item => item.regime === key))]) },
        { title: t.byDirection, groups: ["Long", "Short"].map(key => [key, adapt(items.filter(item => item.direction === key))]) }
      ];
    }

    const html = sections.map(section => {
      const buckets = section.groups
        .filter(([, agg]) => agg && Number(agg.count || 0) > 0)
        .map(([label, agg]) => {
          const count = Number(agg.count || 0);
          const n24 = Number(agg.sample24h || 0);
          const n7 = Number(agg.sample7d || 0);
          const sampleText = n24 ? t.sample24h(n24, count) : t.no24hData;
          return `
            <div class="stats-bucket">
              <div class="stats-bucket-head">
                <h4>${escapeHtml(displayBucketLabel(label))}</h4>
                <span class="stats-sample">${escapeHtml(sampleText)}</span>
              </div>
              <dl class="stats-metrics">
                <dt class="metric-primary">${t.positive24h}</dt>
                <dd class="metric-primary">${fmtCapturePct(agg.positivePct24h, 1)}</dd>
                <dt>${t.median24h}</dt>
                <dd class="${metricTone(agg.medianPerf24h)}">${fmtPct(agg.medianPerf24h, 2)}</dd>
                <dt>${t.median7dResearch}</dt>
                <dd class="${metricTone(agg.medianPerf7d)}">${fmtPct(agg.medianPerf7d, 2)}</dd>
                <dt>${t.researchSample7d}</dt>
                <dd>${n7}</dd>
              </dl>
            </div>
          `;
        }).join("");
      return `<div class="stats-block"><h3>${section.title}</h3>${buckets}</div>`;
    }).join("");

    root.innerHTML = html || `<p class="muted">${t.statsAwaitingDiversity}</p>`;
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

    let visibleItems = data.items;
    if (currentFilter === "experimental") {
      visibleItems = visibleItems.filter(item => ["signal", "watchlist", "watch_emergency"].includes(String(item.type || "").toLowerCase()));
    } else if (currentFilter === "exceptional") {
      visibleItems = visibleItems.filter(item => String(item.type || "").toLowerCase() === "exceptional");
    }

    if (!visibleItems.length) {
      tbody.innerHTML = `<tr><td colspan="14" class="empty">${t.empty}</td></tr>`;
      return;
    }

    const rows = visibleItems.map(item => {
      const dirClass = (item.direction || "").toLowerCase() === "long" ? "dir-long" : "dir-short";
      const perf = item.directionalPerfPct;
      const type = publicType(item.type);
      const status = publicStatus(item);
      // The live directional performance is provisional while a detection is
      // still active or under research tracking. Reserve green/red for records
      // whose tracking window is complete.
      const perfCompleted = status.css === "research-complete";
      const perfClass = perfCompleted
        ? (perf > 0 ? "perf-pos" : (perf < 0 ? "perf-neg" : ""))
        : "perf-pending";

      return `
        <tr>
          <td title="${escapeHtml(fmtDate(item.ts))}">${fmtAge(item.ts)}</td>
          <td><span class="tag ${escapeHtml(type.css)}">${escapeHtml(type.label)}</span></td>
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
          <td class="${perfClass}">${fmtPct(perf, 1)}${perfCompleted ? "" : `<span class="perf-pending-tag">${t.perfInProgress}</span>`}</td>
          <td class="col-status"><span class="tag ${escapeHtml(status.css)}">${escapeHtml(status.label)}</span></td>
        </tr>
      `;
    }).join("");

    tbody.innerHTML = rows;
  }


  // -------------------------------------------------------------------
  // Render the Telegram publication block (R7B step 2)
  // -------------------------------------------------------------------
  // Reads /api/performance/telegram. The 24h delay and the emittedToTelegram
  // filter are enforced server-side; nothing here can widen them. The block
  // reports what was selected for publication, not a delivery confirmation.
  function renderTelegram(data) {
    const tbody = document.getElementById("perfTelegramTableBody");
    const metaEl = document.getElementById("perfTelegramMeta");
    const noteEl = document.getElementById("perfTelegramCohortNote");
    const truncEl = document.getElementById("perfTelegramTruncated");
    const COLS = 9;

    const setCard = (key, text, tone) => {
      const el = document.querySelector(`[data-telegram="${key}"]`);
      if (!el) return;
      el.textContent = text;
      el.className = tone ? `value ${tone}` : "value";
    };
    // Each outcome card states its own sample: a median over 4 readings must
    // not read like one over 30.
    const setSub = (key, text) => {
      const el = document.querySelector(`[data-telegram-sub="${key}"]`);
      if (el) el.textContent = text;
    };

    if (noteEl) noteEl.textContent = t.tgCohortNote;
    if (truncEl) truncEl.textContent = "";

    if (!data || !data.ok) {
      ["count", "positive24", "median24", "median7"].forEach(key => setCard(key, "\u2014", ""));
      ["positive24", "median24", "median7"].forEach(key => setSub(key, ""));
      if (metaEl) metaEl.textContent = t.tgError;
      if (tbody) tbody.innerHTML = `<tr><td colspan="${COLS}" class="empty">${t.tgError}</td></tr>`;
      return;
    }

    const stats = data.stats && data.stats.overall ? data.stats.overall : null;
    const total = Number.isFinite(Number(data.count)) ? Number(data.count) : 0;

    setCard("count", String(total), "");
    setCard("positive24", stats ? fmtCapturePct(stats.positivePct24h, 1) : "\u2014", "");
    setCard("median24", stats ? fmtPct(stats.medianPerf24h, 2) : "\u2014", stats ? metricTone(stats.medianPerf24h) : "");
    setCard("median7", stats ? fmtPct(stats.medianPerf7d, 2) : "\u2014", stats ? metricTone(stats.medianPerf7d) : "");

    const n24 = stats && Number.isFinite(Number(stats.sample24h)) ? Number(stats.sample24h) : 0;
    const n7 = stats && Number.isFinite(Number(stats.sample7d)) ? Number(stats.sample7d) : 0;
    setSub("positive24", t.tgSub24(n24));
    setSub("median24", t.tgSub24(n24));
    setSub("median7", t.tgSub7(n7));

    if (metaEl) {
      const sinceTs = Date.parse(data.historyStartsAt || "");
      const since = Number.isFinite(sinceTs) ? fmtDateOnly(sinceTs) : null;
      const delay = Number(data.publicDelayHours);
      metaEl.textContent = t.tgMeta(total, since, Number.isFinite(delay) ? delay : 24);
    }

    if (!tbody) return;

    const items = Array.isArray(data.items) ? data.items : [];
    if (!items.length) {
      tbody.innerHTML = `<tr><td colspan="${COLS}" class="empty">${t.tgEmpty}</td></tr>`;
      return;
    }

    // Top-of-page block: show the most recent rows by default so the table
    // does not push the rest of the page down as the history grows.
    const toggle = document.getElementById("perfTelegramToggle");
    const collapsible = items.length > TELEGRAM_PREVIEW_ROWS;
    const shown = collapsible && !telegramExpanded ? items.slice(0, TELEGRAM_PREVIEW_ROWS) : items;
    if (toggle) {
      toggle.hidden = !collapsible;
      toggle.textContent = telegramExpanded ? t.tgShowLess : t.tgShowAll(items.length, data.itemsTruncated === true);
      toggle.setAttribute("aria-expanded", telegramExpanded ? "true" : "false");
    }

    tbody.innerHTML = shown.map(item => {
      const dirClass = String(item.direction || "").toLowerCase() === "long" ? "dir-long" : "dir-short";
      const status = publicStatus(item);
      const perf = item.directionalPerfPct;
      const perfCompleted = status.css === "research-complete";
      const perfClass = perfCompleted
        ? (perf > 0 ? "perf-pos" : (perf < 0 ? "perf-neg" : ""))
        : "perf-pending";

      return `
        <tr>
          <td title="${escapeHtml(fmtDate(item.ts))}">${escapeHtml(fmtDateCompact(item.ts))}</td>
          <td class="col-asset"><strong>${escapeHtml(item.asset || "\u2014")}</strong></td>
          <td class="${dirClass}">${escapeHtml(item.direction || "\u2014")}</td>
          <td>${escapeHtml(item.regime || "\u2014")}</td>
          <td>${item.score !== null && item.score !== undefined ? Number(item.score).toFixed(1) : "\u2014"}</td>
          <td>${fmtPrice(item.priceAtT0)}</td>
          <td>${priceAtMilestone(item, "+24h")}</td>
          <td>${priceAtMilestone(item, "+7d")}</td>
          <td class="${perfClass}">${fmtPct(perf, 1)}${perfCompleted ? "" : `<span class="perf-pending-tag">${t.perfInProgress}</span>`}</td>
        </tr>
      `;
    }).join("");

    if (truncEl && data.itemsTruncated === true && (telegramExpanded || !collapsible)) {
      truncEl.textContent = t.tgTruncated(items.length, total);
    }
  }

  function setupTelegramToggle() {
    const toggle = document.getElementById("perfTelegramToggle");
    if (!toggle) return;
    toggle.addEventListener("click", () => {
      telegramExpanded = !telegramExpanded;
      renderTelegram(cachedTelegram);
      if (!telegramExpanded) {
        const section = document.getElementById("telegram");
        if (section) section.scrollIntoView({ block: "start" });
      }
    });
  }

  // -------------------------------------------------------------------
  // Render 1 USDC directional simulation
  // -------------------------------------------------------------------
  function renderSimulation(data) {
    const root = document.getElementById("perfSimulation");
    if (!root) return;
    const valueEl = root.querySelector(".sim-value");
    const noteEl = root.querySelector(".sim-note");
    const totalTitleEl = root.querySelector("[data-sim-total-title]");
    const medianTitleEl = root.querySelector("[data-sim-median-title]");
    const mfeEl = root.querySelector("[data-sim-mfe]");
    const maeEl = root.querySelector("[data-sim-mae]");
    const mfeMedianEl = root.querySelector("[data-sim-mfe-median]");
    const maeMedianEl = root.querySelector("[data-sim-mae-median]");
    const captureEl = root.querySelector("[data-sim-capture]");
    const captureNoteEl = root.querySelector("[data-sim-capture-note]");
    const allTitleEl = root.querySelector("[data-sim-all-title]");

    // Static / idempotent labels
    if (medianTitleEl) medianTitleEl.textContent = t.medianGroupTitle;
    if (allTitleEl) allTitleEl.textContent = t.simAllTitle;

    // v2.7.8: simulation is computed server-side over the FULL universe
    // (loadAllTracked), exposed as data.simulation.{allTracked,signalsOnly}.
    // This stays exact past 200 detections, unlike the old /list-based math.
    const sim = data && data.ok ? data.simulation : null;
    const all = sim ? sim.allTracked : null;

    if (!all || !Number.isFinite(Number(all.count)) || all.count === 0 ||
        all.currentSimulatedValue === null || all.currentSimulatedValue === undefined) {
      if (valueEl) valueEl.textContent = t.simNoData;
      if (noteEl) noteEl.textContent = "";
      if (totalTitleEl) totalTitleEl.textContent = t.totalGroupTitleFallback;
      if (captureNoteEl) captureNoteEl.textContent = t.captureFormula;
      [mfeEl, maeEl, mfeMedianEl, maeMedianEl, captureEl].forEach(el => { if (el) el.textContent = "—"; });
      return;
    }

    // All tracked
    if (valueEl) valueEl.textContent = t.simLine(fmtUsdc(all.currentSimulatedValue, 3), all.count, all.ended);
    if (noteEl) noteEl.textContent = t.simFoot(all.active);
    if (totalTitleEl) totalTitleEl.textContent = t.totalGroupTitle(all.count);


    // Observed amplitude (computed over all tracked detections)
    if (mfeEl) mfeEl.textContent = all.mfeTotal !== null && all.mfeTotal !== undefined ? fmtUsdc(all.mfeTotal, 3) : "—";
    if (maeEl) maeEl.textContent = all.maeTotal !== null && all.maeTotal !== undefined ? fmtUsdc(all.maeTotal, 3) : "—";
    if (mfeMedianEl) mfeMedianEl.textContent = all.mfeMedian !== null && all.mfeMedian !== undefined ? fmtUsdc(all.mfeMedian, 3) : "—";
    if (maeMedianEl) maeMedianEl.textContent = all.maeMedian !== null && all.maeMedian !== undefined ? fmtUsdc(all.maeMedian, 3) : "—";

    // Capture rate: backend returns null when simulated value <= 0
    const capture = (all.captureRate === null || all.captureRate === undefined) ? null : Number(all.captureRate);
    if (captureEl) captureEl.textContent = capture !== null ? fmtCapturePct(Math.min(999, capture), 1) : t.captureUnavailable;
    if (captureNoteEl) captureNoteEl.textContent = capture === null ? t.captureBelowEntry : t.captureFormula;
  }

  // -------------------------------------------------------------------
  // Filters
  // -------------------------------------------------------------------
  function setupFilters() {
    const chips = document.querySelectorAll(".chip[data-filter]");
    chips.forEach(chip => {
      chip.addEventListener("click", () => {
        chips.forEach(c => c.classList.remove("active"));
        chip.classList.add("active");
        currentFilter = chip.getAttribute("data-filter") || "";
        renderList(cachedList);
      });
    });
  }

  // -------------------------------------------------------------------
  // Loaders
  // -------------------------------------------------------------------
  async function loadAll() {
    const [summary, stats, list, telegram] = await Promise.all([
      fetchJSON("/summary"),
      fetchJSON("/stats"),
      fetchJSON("/list?limit=200"),
      fetchJSON("/telegram")
    ]);
    cachedList = list;
    cachedTelegram = telegram;
    renderSummary(summary, list);
    renderStats(stats, list);
    renderSimulation(stats);
    renderTelegram(telegram);
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
      setupTelegramToggle();
      loadAll();
    });
  } else {
    setupFilters();
    setupTelegramToggle();
    loadAll();
  }
})();
