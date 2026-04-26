/* ========================================
   Cryptomath Score v2.0.8
   ======================================== */

const API_PATH = "/api/score";
const METHOD_VERSION = "2.0.8";

const $ = (id) => document.getElementById(id);

const SCORE_LANG = (document.documentElement.lang || "en").toLowerCase().startsWith("fr") ? "fr" : "en";

const SCORE_I18N = {
  en: {
    methodVersion: "Method v{v}",
    noTrade: "No trade",
    fillInputs: "Fill inputs and click Calculate.",
    ready: "Ready.",
    quickScan: "Quick Scan",
    autoFill: "Auto fill",
    simpleModeHtml: "Simple mode. Quick 3-pillar manual check.<br><span class=\"mode-teaser\" data-action=\"switch-pro\" role=\"button\" tabindex=\"0\">Quick scan runs the full scan and maps it to the 3 pillars. Switch to Pro for the full breakdown.</span>",
    proMode: "Pro mode. Full 10-signal scoring with detailed breakdown.",
    typeAssetAuto: "Type an asset to compute in Auto regime. Example BTC.",
    updated: "Updated.",
    autoDetectedSignals: "Auto detected <strong>{count} / 10</strong> signals",
    scanSuggestsOk: "Scan suggests OK",
    scanSuggestsCaution: "Scan suggests caution",
    autoDetectedRegime: "Auto detected {regime}. You can override anytime.",
    autoDetectsRegime: "Auto detects the regime using market context. You can override anytime.",
    aPlusSetup: "A+ setup",
    aPlusText: "Strong confluence. Risk-managed execution still required.",
    speculative: "Speculative",
    speculativeText: "Edge exists but risk is higher. Reduce size and keep stops tight.",
    noTradeText: "Too much noise. Wait for better alignment.",
    downgradedDueToRR: "Signal downgraded due to insufficient RR for this regime.",
    entryStopEqual: "Entry and Stop cannot be equal.",
    longInvalidStop: "For a long, Stop must be below Entry.",
    longInvalidTp: "For a long, TP must be above Entry.",
    shortInvalidStop: "For a short, Stop must be above Entry.",
    shortInvalidTp: "For a short, TP must be below Entry.",
    calculate: "Calculate",
    calculating: "Calculating...",
    ok: "OK",
    accessDenied: "Access denied. Open this page from thecryptomath.com.",
    requestError: "Request error. Try again.",
    methodNotAllowed: "Method not allowed.",
    unauthorized: "Unauthorized.",
    rateLimited: "Rate limited. Slow down and retry.",
    typeAssetFirst: "Type an asset first. Example BTC.",
    upstreamUnavailable: "Upstream temporarily unavailable. Try again.",
    upstreamError: "Upstream API error. Try again.",
    badUpstreamJson: "Upstream returned invalid JSON. Try again.",
    insufficientMarketData: "Not enough market data for this asset.",
    unknownRegime: "Regime auto requires the latest API update.",
    apiErrorCode: "API error. Code {code}",
    scanning: "Scanning...",
    autoFilling: "Auto filling...",
    quickScanComplete: "Quick scan complete.",
    quickScanFound: "Quick scan found <strong>{count}</strong> signals",
    quickScanNoSignal: "Quick scan returned no signal.",
    scanFailedCode: "Scan failed. Code {code}",
    missingAsset: "Missing asset.",
    nothingToExport: "Nothing to export yet. Click Calculate first.",
    exported: "Exported.",
    exportJson: "Export JSON",
    shareHeadlineWithAsset: "I just ran a scan on {asset} with the @thecryptomath Score",
    shareHeadlineNoAsset: "I just ran a scan with the @thecryptomath Score",
    result: "Result {score}/10",
    tryItFree: "Try it for free"
  },
  fr: {
    methodVersion: "Méthode v{v}",
    noTrade: "Pas de trade",
    fillInputs: "Renseignez les champs puis cliquez sur Calculer.",
    ready: "Prêt.",
    quickScan: "Scan rapide",
    autoFill: "Remplissage auto",
    simpleModeHtml: "Mode Simple. Vérification manuelle rapide en 3 piliers.<br><span class=\"mode-teaser\" data-action=\"switch-pro\" role=\"button\" tabindex=\"0\">Le scan rapide lance le scan complet puis le condense en 3 piliers. Passez en mode Pro pour le détail complet.</span>",
    proMode: "Mode Pro. Scoring complet sur 10 signaux avec détail par bloc.",
    typeAssetAuto: "Tapez un actif pour calculer en régime Auto. Exemple BTC.",
    updated: "Mis à jour.",
    autoDetectedSignals: "Détection automatique <strong>{count} / 10</strong> signaux",
    scanSuggestsOk: "Le scan suggère OK",
    scanSuggestsCaution: "Le scan suggère de la prudence",
    autoDetectedRegime: "Régime détecté automatiquement {regime}. Vous pouvez le modifier à tout moment.",
    autoDetectsRegime: "Le régime est détecté automatiquement via le contexte de marché. Vous pouvez le modifier à tout moment.",
    aPlusSetup: "Configuration A+",
    aPlusText: "Confluence forte. Une exécution disciplinée et un risque maîtrisé restent indispensables.",
    speculative: "Spéculatif",
    speculativeText: "Il existe un avantage, mais le risque est plus élevé. Réduisez la taille et gardez des stops serrés.",
    noTradeText: "Trop de bruit. Attendez un meilleur alignement.",
    downgradedDueToRR: "La configuration a été dégradée à cause d’un RR insuffisant pour ce régime.",
    entryStopEqual: "L’entrée et le stop ne peuvent pas être identiques.",
    longInvalidStop: "Pour un long, le stop doit être sous l’entrée.",
    longInvalidTp: "Pour un long, le take profit doit être au-dessus de l’entrée.",
    shortInvalidStop: "Pour un short, le stop doit être au-dessus de l’entrée.",
    shortInvalidTp: "Pour un short, le take profit doit être sous l’entrée.",
    calculate: "Calculer",
    calculating: "Calcul en cours...",
    ok: "OK",
    accessDenied: "Accès refusé. Ouvrez cette page depuis thecryptomath.com.",
    requestError: "Erreur de requête. Réessayez.",
    methodNotAllowed: "Méthode non autorisée.",
    unauthorized: "Non autorisé.",
    rateLimited: "Limite atteinte. Ralentissez puis réessayez.",
    typeAssetFirst: "Tapez d’abord un actif. Exemple BTC.",
    upstreamUnavailable: "Source amont temporairement indisponible. Réessayez.",
    upstreamError: "Erreur de l’API amont. Réessayez.",
    badUpstreamJson: "La source amont a renvoyé un JSON invalide. Réessayez.",
    insufficientMarketData: "Pas assez de données marché pour cet actif.",
    unknownRegime: "Le régime Auto nécessite la dernière mise à jour de l’API.",
    apiErrorCode: "Erreur API. Code {code}",
    scanning: "Scan en cours...",
    autoFilling: "Remplissage en cours...",
    quickScanComplete: "Scan rapide terminé.",
    quickScanFound: "Le scan rapide a trouvé <strong>{count}</strong> signaux",
    quickScanNoSignal: "Le scan rapide n’a renvoyé aucun signal.",
    scanFailedCode: "Échec du scan. Code {code}",
    missingAsset: "Actif manquant.",
    nothingToExport: "Rien à exporter pour le moment. Cliquez d’abord sur Calculer.",
    exported: "Exporté.",
    exportJson: "Exporter en JSON",
    shareHeadlineWithAsset: "Je viens de lancer un scan sur {asset} avec le Score de @thecryptomath",
    shareHeadlineNoAsset: "Je viens de lancer un scan avec le Score de @thecryptomath",
    result: "Résultat {score}/10",
    tryItFree: "Essayez gratuitement"
  }
};

function t(key, vars) {
  const dict = SCORE_I18N[SCORE_LANG] || SCORE_I18N.en;
  let text = dict[key] || SCORE_I18N.en[key] || key;
  if (vars) {
    for (const [k, v] of Object.entries(vars)) {
      text = text.replaceAll("{" + k + "}", String(v));
    }
  }
  return text;
}

function localizeRegime(regime) {
  if (SCORE_LANG !== "fr") return regime;
  if (regime === "Bull") return "Haussier";
  if (regime === "Bear") return "Baissier";
  if (regime === "Range") return "Range";
  if (regime === "Auto") return "Auto";
  return regime;
}

const PRO_IDS = ["mLiq", "mFlux", "mVal", "tMom", "tStr", "tVol", "tVolu", "pSent", "pDer", "pCat"];

const state = {
  lastResponse: null,
  lastScore: null,
  lastVerdict: null,
  debounceTimer: null,
  autoSet: new Set(),
  lastDebug: null,
  shadowTimer: null,
  shadowLastKey: "",
  shadowLastAt: 0,
  shadowLastResult: null
};

function setStatus(text, kind) {
  const el = $("status");
  if (!el) return;
  el.className = "status" + (kind ? " " + kind : "");
  el.textContent = text;
}

function setAutoSummary(html) {
  const el = $("autoSummary");
  if (!el) return;
  if (!html) {
    el.style.display = "none";
    el.innerHTML = "";
    return;
  }
  el.style.display = "block";
  el.innerHTML = html;
}

function setSimpleHint(id, html) {
  const el = $(id);
  if (!el) return;
  el.innerHTML = html || "";
}

function clearSimpleHints() {
  setSimpleHint("simpleHintMacro", "");
  setSimpleHint("simpleHintTech", "");
  setSimpleHint("simpleHintPsy", "");
}

function asNum(v) {
  if (v === null || v === undefined) return null;
  const s = String(v).trim().replace(",", ".");
  if (!s) return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

function fmtNum(n, digits) {
  if (n === null || n === undefined) return null;
  const x = Number(n);
  return Number.isFinite(x) ? x.toFixed(digits) : null;
}

function closestCheckWrap(id) {
  const el = $(id);
  return el ? el.closest(".check") : null;
}

function setCheckbox(id, value) {
  const el = $(id);
  if (el) el.checked = !!value;
}

function setFill(id, pct) {
  const el = $(id);
  if (el) el.style.width = Math.max(0, Math.min(100, pct)) + "%";
}

function validateTradeClient(direction, entry, stop, tp) {
  const complete = entry !== null && stop !== null && tp !== null;
  if (!complete) return null;
  if (entry === stop) return "trade_entry_equals_stop";

  if (direction === "Long") {
    if (!(stop < entry)) return "long_invalid_stop";
    if (!(tp > entry)) return "long_invalid_tp";
  } else {
    if (!(stop > entry)) return "short_invalid_stop";
    if (!(tp < entry)) return "short_invalid_tp";
  }
  return null;
}

function proPayload() {
  return {
    macro: {
      liquidite: $("mLiq").checked,
      flux: $("mFlux").checked,
      valorisation: $("mVal").checked
    },
    technique: {
      momentum: $("tMom").checked,
      structure: $("tStr").checked,
      volatilite: $("tVol").checked,
      volume: $("tVolu").checked
    },
    psycho: {
      sentiment: $("pSent").checked,
      derives: $("pDer").checked,
      catalyst: $("pCat").checked
    }
  };
}

function simplePayload() {
  return {
    macroOK: $("simpleMacro").checked,
    techOK: $("simpleTech").checked,
    psychoOK: $("simplePsy").checked
  };
}

function normalizeAssetInput(raw) {
  const s = String(raw || "").trim();
  if (!s) return "";

  const cleaned = s
    .replace(/^\$/, "")
    .replace(/\s+/g, "")
    .toUpperCase();

  const map = {
    BITCOIN: "BTC",
    ETHEREUM: "ETH"
  };

  return map[cleaned] || cleaned;
}

function buildPayloadFromState() {
  const mode = $("mode").value;
  const regime = $("regime").value;
  const direction = $("direction").value;
  const entry = asNum($("entry").value);
  const stop = asNum($("stop").value);
  const tp = asNum($("tp").value);

  const asset = normalizeAssetInput($("asset").value);

  const payload = { mode, regime, direction, trade: { entry, stop, tp } };
  if (asset) payload.asset = asset;
  if (mode === "Simple") payload.simple = simplePayload();
  else payload.pro = proPayload();

  return payload;
}

function hasMeaningfulInputs(payload) {
  if (payload.mode === "Simple") {
    const s = payload.simple || {};
    return !!(s.macroOK || s.techOK || s.psychoOK);
  }
  const p = payload.pro || {};
  const m = p.macro || {};
  const tech = p.technique || {};
  const y = p.psycho || {};
  return !!(
    m.liquidite || m.flux || m.valorisation ||
    tech.momentum || tech.structure || tech.volatilite || tech.volume ||
    y.sentiment || y.derives || y.catalyst
  );
}

function resetAutoUI() {
  for (const id of PRO_IDS) {
    const wrap = closestCheckWrap(id);
    if (wrap) wrap.classList.remove("auto");
    const cb = $(id);
    if (cb) cb.title = "";
  }
  state.autoSet.clear();
  state.lastDebug = null;
  setAutoSummary("");
}

function resetResultsUI() {
  $("scoreTotal").textContent = "–";
  $("rrVal").textContent = "–";
  $("rrMin").textContent = "–";
  $("macroTxt").textContent = "–";
  $("techTxt").textContent = "–";
  $("psyTxt").textContent = "–";
  setFill("macroFill", 0);
  setFill("techFill", 0);
  setFill("psyFill", 0);

  const vb = $("verdictBox");
  vb.classList.remove("a", "s");
  vb.classList.add("n");
  $("verdictTitle").textContent = t("noTrade");
  $("verdictText").textContent = t("fillInputs");

  const cta = $("postScoreCta");
  if (cta) cta.style.display = "none";

  state.lastResponse = null;
}

function resetAll() {
  $("asset").value = "";
  $("entry").value = "";
  $("stop").value = "";
  $("tp").value = "";
  $("regime").value = "Auto";
  $("direction").value = "Long";
  $("mode").value = "Pro";

  for (const id of PRO_IDS) setCheckbox(id, false);
  setCheckbox("simpleMacro", false);
  setCheckbox("simpleTech", false);
  setCheckbox("simplePsy", false);

  resetAutoUI();
  clearSimpleHints();
  resetResultsUI();
  applyModeUI();
  setStatus(t("ready"), "");
}

function applyAutoHighlights() {
  for (const id of PRO_IDS) {
    const wrap = closestCheckWrap(id);
    if (!wrap) continue;
    if (state.autoSet.has(id) && $(id).checked) wrap.classList.add("auto");
    else wrap.classList.remove("auto");
  }
}

function applyAutoTooltips(debug) {
  if (!debug) return;

  const macro = debug.macro || {};
  const tech = debug.tech || debug.technical || {};
  const psy = debug.psy || debug.psycho || debug.psychology || {};
  const market = debug.market || {};

  const setTitle = (id, title) => {
    const el = $(id);
    if (el) el.title = title || "";
  };

  const noData = SCORE_LANG === "fr" ? "Pas de donnée" : "No data";
  const manualCheck = SCORE_LANG === "fr" ? "Vérification manuelle requise" : "Manual check required";
  const priceLabel = SCORE_LANG === "fr" ? "Prix " : "Price ";
  const volumeRatioLabel = SCORE_LANG === "fr" ? "Ratio vol. " : "Vol ratio ";
  const fundingLabel = SCORE_LANG === "fr" ? "Funding " : "Funding ";

  const liqParts = [];
  if (macro.btcDominance != null) liqParts.push("BTC dom " + fmtNum(macro.btcDominance, 2) + "%");
  setTitle("mLiq", liqParts.length ? liqParts.join(" | ") : noData);

  const flowParts = [];
  if (macro.stablecoinChange7dPct != null) flowParts.push("7j " + fmtNum(macro.stablecoinChange7dPct, 2) + "%");
  if (macro.stablecoinMcapUsd != null) flowParts.push("$" + (Number(macro.stablecoinMcapUsd) / 1e9).toFixed(1) + "B");
  setTitle("mFlux", flowParts.length ? flowParts.join(" | ") : noData);

  setTitle("mVal", manualCheck);

  const momParts = [];
  if (tech.rsi != null) momParts.push("RSI " + fmtNum(tech.rsi, 1));
  if (tech.stochRsi != null) momParts.push("StochRSI " + fmtNum(tech.stochRsi, 1));
  setTitle("tMom", momParts.length ? momParts.join(" | ") : noData);

  const strParts = [];
  if (market.price != null) strParts.push(priceLabel + fmtNum(market.price, 2));
  if (market.ema50 != null) strParts.push("EMA50 " + fmtNum(market.ema50, 2));
  if (tech.structure && tech.structure.reason) strParts.push(tech.structure.reason);
  setTitle("tStr", strParts.length ? strParts.join(" | ") : noData);

  setTitle("tVol", tech.bbWidthPct != null ? ("BB " + fmtNum(tech.bbWidthPct, 0) + "%") : noData);
  setTitle("tVolu", tech.volumeRatio != null ? (volumeRatioLabel + fmtNum(tech.volumeRatio, 2) + "x") : noData);
  setTitle("pSent", psy.fearGreed != null ? ("F&G " + fmtNum(psy.fearGreed, 0)) : noData);
  setTitle("pDer", psy.fundingRate != null ? (fundingLabel + fmtNum(psy.fundingRate, 6)) : noData);

  setTitle("pCat", manualCheck);
}

function applyAutoDetectedToUI(autoDetected, debug) {
  if (!autoDetected) return;

  const m = autoDetected.macro || {};
  const tech = autoDetected.technique || {};
  const p = autoDetected.psycho || {};

  setCheckbox("mLiq", m.liquidite);
  setCheckbox("mFlux", m.flux);
  setCheckbox("mVal", m.valorisation);
  setCheckbox("tMom", tech.momentum);
  setCheckbox("tStr", tech.structure);
  setCheckbox("tVol", tech.volatilite);
  setCheckbox("tVolu", tech.volume);
  setCheckbox("pSent", p.sentiment);
  setCheckbox("pDer", p.derives);
  setCheckbox("pCat", p.catalyst);

  state.autoSet.clear();
  const mapping = {
    mLiq: !!m.liquidite,
    mFlux: !!m.flux,
    mVal: !!m.valorisation,
    tMom: !!tech.momentum,
    tStr: !!tech.structure,
    tVol: !!tech.volatilite,
    tVolu: !!tech.volume,
    pSent: !!p.sentiment,
    pDer: !!p.derives,
    pCat: !!p.catalyst
  };

  for (const id of PRO_IDS) {
    if (mapping[id]) state.autoSet.add(id);
  }

  applyAutoHighlights();
  applyAutoTooltips(debug);

  const count = state.autoSet.size;
  setAutoSummary(t("autoDetectedSignals", { count }));

  state.lastDebug = debug;
}

function computeBlockCounts(autoDetected) {
  const m = autoDetected && autoDetected.macro ? autoDetected.macro : {};
  const tech = autoDetected && autoDetected.technique ? autoDetected.technique : {};
  const p = autoDetected && autoDetected.psycho ? autoDetected.psycho : {};

  const macroVals = [!!m.liquidite, !!m.flux, !!m.valorisation];
  const techVals = [!!tech.momentum, !!tech.structure, !!tech.volatilite, !!tech.volume];
  const psyVals = [!!p.sentiment, !!p.derives, !!p.catalyst];

  const countTrue = (arr) => arr.reduce((a, b) => a + (b ? 1 : 0), 0);

  const macroTrue = countTrue(macroVals);
  const techTrue = countTrue(techVals);
  const psyTrue = countTrue(psyVals);

  const suggestsOK = (trueCount, total) => {
    if (!total) return false;
    return trueCount >= Math.ceil(total * 0.6);
  };

  return {
    macro: { t: macroTrue, n: macroVals.length, ok: suggestsOK(macroTrue, macroVals.length) },
    tech: { t: techTrue, n: techVals.length, ok: suggestsOK(techTrue, techVals.length) },
    psy: { t: psyTrue, n: psyVals.length, ok: suggestsOK(psyTrue, psyVals.length) }
  };
}

function renderSimpleShadowHints(autoDetected) {
  if (!autoDetected) {
    clearSimpleHints();
    return;
  }
  const c = computeBlockCounts(autoDetected);

  const line = (block) => {
    const pill = "<span class=\"pill\">" + block.t + " / " + block.n + "</span>";
    const suggest = block.ok ? "<em>" + t("scanSuggestsOk") + "</em>" : t("scanSuggestsCaution");
    return pill + suggest;
  };

  setSimpleHint("simpleHintMacro", line(c.macro));
  setSimpleHint("simpleHintTech", line(c.tech));
  setSimpleHint("simpleHintPsy", line(c.psy));
}

function applyQuickScanToSimple(autoDetected) {
  if (!autoDetected) return { macro: 0, tech: 0, psy: 0, total: 0 };

  const m = autoDetected.macro || {};
  const tech = autoDetected.technique || {};
  const p = autoDetected.psycho || {};

  const macroCount = Object.values(m).filter(Boolean).length;
  const techCount = Object.values(tech).filter(Boolean).length;
  const psyCount = Object.values(p).filter(Boolean).length;

  setCheckbox("simpleMacro", macroCount >= 1);
  setCheckbox("simpleTech", techCount >= 2);
  setCheckbox("simplePsy", psyCount >= 1);

  return { macro: macroCount, tech: techCount, psy: psyCount, total: macroCount + techCount + psyCount };
}

function switchToPro() {
  const modeSelect = $("mode");
  if (!modeSelect) return;
  modeSelect.value = "Pro";
  applyModeUI();
  scheduleAutoCalc();
}

// Channels independent. Avoids cross-cancellation between calc, shadow, autofill, autocalc.
const apiChannels = {
  calc: { controller: null, counter: 0 },
  shadow: { controller: null, counter: 0 },
  autofill: { controller: null, counter: 0 },
  autocalc: { controller: null, counter: 0 }
};

let requestCounter = 0;

const CLIENT_CACHE_TTL_MS = 60_000;
const clientCache = new Map();

function stableStringify(obj) {
  if (obj === null || typeof obj !== "object") return JSON.stringify(obj);
  if (Array.isArray(obj)) return "[" + obj.map(stableStringify).join(",") + "]";

  const keys = Object.keys(obj).sort();
  return "{" + keys.map(k => JSON.stringify(k) + ":" + stableStringify(obj[k])).join(",") + "}";
}

function cacheGet(key) {
  const hit = clientCache.get(key);
  if (!hit) return null;
  if (Date.now() - hit.t > CLIENT_CACHE_TTL_MS) {
    clientCache.delete(key);
    return null;
  }
  return hit.v;
}

function cacheSet(key, value) {
  clientCache.set(key, { t: Date.now(), v: value });
}

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function callApi(payload, channel = "calc") {
  const ch = apiChannels[channel] || apiChannels.calc;
  if (ch.controller) ch.controller.abort();
  ch.controller = new AbortController();

  const requestId = ++ch.counter;
  requestCounter = requestId;

  const key = stableStringify(payload);
  const cached = cacheGet(key);
  if (cached) return cached;

  const maxAttempts = 2;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const res = await fetch(API_PATH, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: ch.controller.signal
    });

    if (requestId !== ch.counter) throw new Error("stale_response");

    const data = await res.json().catch(() => null);

    if (data && data.ok) {
      cacheSet(key, data);
      return data;
    }

    const code = (data && data.error) ? data.error : "api_error";

    const retryable =
      code === "upstream_unavailable" ||
      code === "upstream_error" ||
      code === "bad_upstream_json";

    if (!retryable || attempt === maxAttempts) {
      throw new Error(code);
    }

    await sleep(350 * attempt);
  }

  throw new Error("api_error");
}

function maxByRegime(regime) {
  if (regime === "Bull") return { macro: 2, tech: 5, psy: 3 };
  if (regime === "Range") return { macro: 3, tech: 4, psy: 3 };
  return { macro: 4, tech: 3, psy: 3 };
}

function renderScores(data, payload) {
  $("methodVersion").textContent = t("methodVersion", { v: (data.methodVersion || METHOD_VERSION) });

  const s = data.scores || {};
  $("scoreTotal").textContent = (typeof s.total === "number") ? s.total.toFixed(1) + " / 10" : "–";
  $("rrVal").textContent = (typeof s.rr === "number") ? s.rr.toFixed(2) : "–";
  $("rrMin").textContent = (typeof s.rrMin === "number") ? s.rrMin.toFixed(1) : "–";

  const mode = payload.mode;
  const bars = $("bars");
  bars.style.display = (mode === "Simple") ? "none" : "block";

  const usedRegime = data.usedRegime || payload.regime;
  if (payload.regime === "Auto" && data.usedRegime) {
    $("regimeHint").textContent = t("autoDetectedRegime", { regime: localizeRegime(data.usedRegime) });
  } else {
    $("regimeHint").textContent = t("autoDetectsRegime");
  }

  if (mode !== "Simple") {
    const mx = maxByRegime(usedRegime === "Auto" ? "Bull" : usedRegime);
    const macro = Number(s.scoreMacro || 0);
    const tech = Number(s.scoreTech || 0);
    const psy = Number(s.scorePsy || 0);

    $("macroTxt").textContent = macro.toFixed(1) + " / " + mx.macro.toFixed(1);
    $("techTxt").textContent = tech.toFixed(1) + " / " + mx.tech.toFixed(1);
    $("psyTxt").textContent = psy.toFixed(1) + " / " + mx.psy.toFixed(1);

    setFill("macroFill", mx.macro ? (macro / mx.macro) * 100 : 0);
    setFill("techFill", mx.tech ? (tech / mx.tech) * 100 : 0);
    setFill("psyFill", mx.psy ? (psy / mx.psy) * 100 : 0);
  }

  const vb = $("verdictBox");
  vb.classList.remove("a", "s", "n");

  const v = s.finalVerdict || s.baseVerdict || "No trade";
  if (v === "A+") {
    vb.classList.add("a");
    $("verdictTitle").textContent = t("aPlusSetup");
    $("verdictText").textContent = t("aPlusText");
  } else if (v === "Speculative") {
    vb.classList.add("s");
    $("verdictTitle").textContent = t("speculative");
    $("verdictText").textContent = t("speculativeText");
  } else {
    vb.classList.add("n");
    $("verdictTitle").textContent = t("noTrade");
    $("verdictText").textContent = t("noTradeText");
  }

  if (s.baseVerdict && s.finalVerdict && s.baseVerdict !== s.finalVerdict) {
    $("verdictText").textContent = t("downgradedDueToRR");
  }

  state.lastScore = (typeof s.total === "number") ? Number(s.total).toFixed(1) : null;

  const cta = $("postScoreCta");
  if (cta) cta.style.display = state.lastScore ? "block" : "none";

  state.lastResponse = { payload, data };
}

function applyModeUI() {
  const mode = $("mode").value;
  const isSimple = (mode === "Simple");

  $("simpleBlock").style.display = isSimple ? "block" : "none";
  $("proBlock").style.display = isSimple ? "none" : "block";
  $("bars").style.display = isSimple ? "none" : "block";

  const autoBtn = $("autoFillBtn");
  if (autoBtn) autoBtn.textContent = isSimple ? t("quickScan") : t("autoFill");

  const hintEl = $("modeHint");
  if (hintEl) {
    if (isSimple) {
      hintEl.innerHTML = t("simpleModeHtml");
    } else {
      hintEl.textContent = t("proMode");
    }
  }

  if (isSimple) {
    resetAutoUI();
    scheduleShadowScan();
  } else {
    clearSimpleHints();
  }
}

function scheduleAutoCalc() {
  clearTimeout(state.debounceTimer);

  const asset = normalizeAssetInput($("asset").value);
  const regime = $("regime").value;

  if (!asset && regime === "Auto") {
    setStatus(t("typeAssetAuto"), "");
  } else {
    setStatus(t("updated"), "");
  }

  state.debounceTimer = setTimeout(() => {
    runCalculation(true).catch(() => {});
  }, 300);

  scheduleShadowScan();
}

function scheduleShadowScan() {
  clearTimeout(state.shadowTimer);

  const mode = $("mode").value;
  if (mode !== "Simple") return;

  const asset = normalizeAssetInput($("asset").value);
  if (!asset) {
    clearSimpleHints();
    return;
  }

  const regime = $("regime").value;
  const direction = $("direction").value;
  const key = asset.toUpperCase() + "|" + regime + "|" + direction;

  const now = Date.now();
  if (key === state.shadowLastKey && (now - state.shadowLastAt) < 1200 && state.shadowLastResult) {
    renderSimpleShadowHints(state.shadowLastResult);
    return;
  }

  state.shadowTimer = setTimeout(() => {
    runShadowScan(key).catch(() => {});
  }, 450);
}

async function runShadowScan(key) {
  const asset = normalizeAssetInput($("asset").value);
  if (!asset) return;

  const payload = buildPayloadFromState();
  payload.mode = "Pro";
  payload.autoFill = true;
  payload.asset = asset;

  try {
    const data = await callApi(payload, "shadow");
    const autoDetected = data.autoDetected || null;

    state.shadowLastKey = key;
    state.shadowLastAt = Date.now();
    state.shadowLastResult = autoDetected;

    renderSimpleShadowHints(autoDetected);
  } catch (e) {
    if (e && e.name === "AbortError") return;
    if (e && String(e.message) === "stale_response") return;
    clearSimpleHints();
  }
}

async function runCalculation(isAuto) {
  const payload = buildPayloadFromState();

  if (isAuto) {
    const asset = payload.asset || "";

    if (!asset && payload.regime === "Auto") {
      resetResultsUI();
      setStatus(t("typeAssetAuto"), "");
      return;
    }
  }

  if (isAuto && !hasMeaningfulInputs(payload)) {
    resetResultsUI();
    setStatus(t("ready"), "");
    return;
  }

  const { entry, stop, tp } = payload.trade;
  const tradeErr = validateTradeClient(payload.direction, entry, stop, tp);
  if (tradeErr) {
    const map = {
      trade_entry_equals_stop: t("entryStopEqual"),
      long_invalid_stop: t("longInvalidStop"),
      long_invalid_tp: t("longInvalidTp"),
      short_invalid_stop: t("shortInvalidStop"),
      short_invalid_tp: t("shortInvalidTp")
    };
    setStatus(map[tradeErr] || "Invalid trade inputs.", "err");
    return;
  }

  if (!isAuto) {
    $("calcBtn").textContent = t("calculating");
    $("calcBtn").disabled = true;
  }

  try {
    const data = await callApi(payload, isAuto ? "autocalc" : "calc");
    renderScores(data, payload);

    if (!isAuto) {
      trackScoreCalculated(state.lastScore, payload.regime, payload.direction, payload.mode);
    }

    setStatus(isAuto ? t("updated") : t("ok"), "ok");
  } catch (e) {
    if (e && e.name === "AbortError") return;
    if (e && String(e.message) === "stale_response") return;

    const code = String(e && e.message ? e.message : "api_error");
    const map = {
      forbidden_origin: t("accessDenied"),
      invalid_json: t("requestError"),
      method_not_allowed: t("methodNotAllowed"),
      unauthorized: t("unauthorized"),
      rate_limited: t("rateLimited"),
      missing_asset: t("typeAssetFirst"),
      upstream_unavailable: t("upstreamUnavailable"),
      upstream_error: t("upstreamError"),
      bad_upstream_json: t("badUpstreamJson"),
      insufficient_market_data: t("insufficientMarketData"),
      unknown_regime: t("unknownRegime"),
      trade_entry_equals_stop: t("entryStopEqual"),
      long_invalid_stop: t("longInvalidStop"),
      long_invalid_tp: t("longInvalidTp"),
      short_invalid_stop: t("shortInvalidStop"),
      short_invalid_tp: t("shortInvalidTp")
    };
    setStatus(map[code] || t("apiErrorCode", { code }), "err");
  } finally {
    if (!isAuto) {
      $("calcBtn").textContent = t("calculate");
      $("calcBtn").disabled = false;
    }
  }
}

async function runAutoFill() {
  const asset = normalizeAssetInput($("asset").value);
  if (!asset) {
    setStatus(t("typeAssetFirst"), "err");
    return;
  }

  const isSimple = ($("mode").value === "Simple");

  $("autoFillBtn").textContent = isSimple ? t("scanning") : t("autoFilling");
  $("autoFillBtn").disabled = true;
  $("autoFillBtn").classList.add("loading");

  try {
    if (isSimple) {
      resetAutoUI();

      const scanPayload = buildPayloadFromState();
      scanPayload.mode = "Pro";
      scanPayload.autoFill = true;
      scanPayload.asset = asset;

      const data = await callApi(scanPayload, "autofill");
      const autoDetected = data.autoDetected || null;

      if (autoDetected) {
        const counts = applyQuickScanToSimple(autoDetected);
        renderSimpleShadowHints(autoDetected);

        setAutoSummary(t("quickScanFound", { count: counts.total }));
        setStatus(t("quickScanComplete"), "ok");
      } else {
        clearSimpleHints();
        setAutoSummary("");
        setStatus(t("quickScanNoSignal"), "ok");
      }

      await runCalculation(false);
      return;
    }

    resetAutoUI();

    const payload = buildPayloadFromState();
    payload.mode = "Pro";
    payload.autoFill = true;
    payload.asset = asset;

    const data = await callApi(payload, "autofill");

    if (data.autoDetected) {
      applyAutoDetectedToUI(data.autoDetected, data.debug || null);
    }

    const payloadAfter = buildPayloadFromState();
    payloadAfter.mode = "Pro";
    renderScores(data, payloadAfter);
    setStatus(t("ok"), "ok");
  } catch (e) {
    if (e && e.name === "AbortError") return;
    if (e && String(e.message) === "stale_response") return;

    const code = String(e && e.message ? e.message : "api_error");
    const map = {
      missing_asset: t("missingAsset"),
      upstream_unavailable: t("upstreamUnavailable"),
      upstream_error: t("upstreamError"),
      bad_upstream_json: t("badUpstreamJson"),
      insufficient_market_data: t("insufficientMarketData"),
      forbidden_origin: t("accessDenied"),
      rate_limited: t("rateLimited")
    };
    setStatus(map[code] || t("scanFailedCode", { code }), "err");
  } finally {
    const isSimpleNow = ($("mode").value === "Simple");
    $("autoFillBtn").textContent = isSimpleNow ? t("quickScan") : t("autoFill");
    $("autoFillBtn").disabled = false;
    $("autoFillBtn").classList.remove("loading");
  }
}

function exportJSON() {
  if (!state.lastResponse) {
    setStatus(t("nothingToExport"), "err");
    return;
  }
  const blob = new Blob([JSON.stringify(state.lastResponse, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  const asset = (state.lastResponse.payload.asset || "asset").replace(/[^a-z0-9_-]/gi, "_");
  a.href = url;
  a.download = "cryptomath-score_" + asset + ".json";
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
  setStatus(t("exported"), "ok");
}

function trackScoreCalculated(score, regime, direction, mode) {
  // Cloudflare Web Analytics does not support custom events yet.
  return;
}

function trackNewsletterClick(source) {
  // Cloudflare Web Analytics does not support custom events yet.
  return;
}

function trackScoreShared(platform, score) {
  // Cloudflare Web Analytics does not support custom events yet.
  return;
}

function getScoreForShare() {
  const raw = $("scoreTotal") ? $("scoreTotal").textContent : "";
  const m = String(raw || "").match(/([0-9]+(?:\.[0-9]+)?)/);
  if (m) return m[1];
  if (state.lastScore != null) return String(state.lastScore);
  return "X";
}

function getAssetForShare() {
  const raw = $("asset") ? $("asset").value : "";
  const a = String(raw || "").trim().toUpperCase().replace(/^\$/, "");
  const clean = a.replace(/[^A-Z0-9]/g, "");
  if (!clean) return "";
  return "$" + clean;
}

function shareOnX() {
  const score = getScoreForShare();
  const asset = getAssetForShare();
  const headline = asset ? t("shareHeadlineWithAsset", { asset }) : t("shareHeadlineNoAsset");
  const text = `${headline}\n\n${t("result", { score })}\n\n${t("tryItFree")}`;
  const url = "https://thecryptomath.com/score/";
  window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, "_blank");

  trackScoreShared("x", score);
}

function shareOnTelegram() {
  const score = getScoreForShare();
  const asset = getAssetForShare();
  const headline = asset ? t("shareHeadlineWithAsset", { asset }) : t("shareHeadlineNoAsset");
  const text = `${headline}\n\n${t("result", { score })}\n\n${t("tryItFree")}`;
  const url = "https://thecryptomath.com/score/";
  window.open(`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`, "_blank");

  trackScoreShared("telegram", score);
}

function bind() {
  $("mode").addEventListener("change", () => { applyModeUI(); scheduleAutoCalc(); });
  $("regime").addEventListener("change", scheduleAutoCalc);
  $("direction").addEventListener("change", scheduleAutoCalc);

  ["asset", "entry", "stop", "tp"].forEach(id => {
    $(id).addEventListener("input", scheduleAutoCalc);
  });

  ["simpleMacro", "simpleTech", "simplePsy"].forEach(id => {
    $(id).addEventListener("change", scheduleAutoCalc);
  });

  PRO_IDS.forEach(id => {
    $(id).addEventListener("change", () => {
      if (state.autoSet.has(id)) {
        state.autoSet.delete(id);
        applyAutoHighlights();

        const count = state.autoSet.size;
        if (count > 0) setAutoSummary(t("autoDetectedSignals", { count }));
        else setAutoSummary("");
      }
      scheduleAutoCalc();
    });
  });

  $("calcBtn").addEventListener("click", () => runCalculation(false));
  $("autoFillBtn").addEventListener("click", runAutoFill);
  $("resetBtn").addEventListener("click", resetAll);
  $("exportBtn").addEventListener("click", exportJSON);

  $("ctaNewsletterBtn").addEventListener("click", () => trackNewsletterClick("score_post"));
  $("shareXBtn").addEventListener("click", shareOnX);
  $("shareTgBtn").addEventListener("click", shareOnTelegram);

  $("modeHint").addEventListener("click", (e) => {
    const target = e.target && e.target.closest ? e.target.closest("[data-action]") : null;
    if (!target) return;
    if (target.dataset.action === "switch-pro") switchToPro();
  });

  $("modeHint").addEventListener("keydown", (e) => {
    const target = e.target && e.target.closest ? e.target.closest("[data-action]") : null;
    if (!target) return;
    if (target.dataset.action !== "switch-pro") return;

    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      switchToPro();
    }
  });
}

$("methodVersion").textContent = t("methodVersion", { v: METHOD_VERSION });
if ($("exportBtn")) $("exportBtn").textContent = t("exportJson");
$("regime").value = "Auto";
applyModeUI();
bind();
