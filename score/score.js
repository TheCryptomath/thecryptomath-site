/* ========================================
       Cryptomath Score v1.4.7
       ======================================== */

    const API_PATH = "/api/score";
    const METHOD_VERSION = "1.4.7";

    const $ = (id) => document.getElementById(id);

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
      const t = p.technique || {};
      const y = p.psycho || {};
      return !!(
        m.liquidite || m.flux || m.valorisation ||
        t.momentum || t.structure || t.volatilite || t.volume ||
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
      $("verdictTitle").textContent = "No trade";
      $("verdictText").textContent = "Fill inputs and click Calculate.";

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
      setStatus("Ready.", "");
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

      const liqParts = [];
      if (macro.btcDominance != null) liqParts.push("BTC dom " + fmtNum(macro.btcDominance, 2) + "%");
      setTitle("mLiq", liqParts.length ? liqParts.join(" | ") : "No data");

      const flowParts = [];
      if (macro.stablecoinChange7dPct != null) flowParts.push("7d " + fmtNum(macro.stablecoinChange7dPct, 2) + "%");
      if (macro.stablecoinMcapUsd != null) flowParts.push("$" + (Number(macro.stablecoinMcapUsd) / 1e9).toFixed(1) + "B");
      setTitle("mFlux", flowParts.length ? flowParts.join(" | ") : "No data");

      setTitle("mVal", "Manual check required");

      const momParts = [];
      if (tech.rsi != null) momParts.push("RSI " + fmtNum(tech.rsi, 1));
      if (tech.stochRsi != null) momParts.push("StochRSI " + fmtNum(tech.stochRsi, 1));
      setTitle("tMom", momParts.length ? momParts.join(" | ") : "No data");

      const strParts = [];
      if (market.price != null) strParts.push("Price " + fmtNum(market.price, 2));
      if (market.ema50 != null) strParts.push("EMA50 " + fmtNum(market.ema50, 2));
      if (tech.structure && tech.structure.reason) strParts.push(tech.structure.reason);
      setTitle("tStr", strParts.length ? strParts.join(" | ") : "No data");

      setTitle("tVol", tech.bbWidthPct != null ? ("BB " + fmtNum(tech.bbWidthPct, 0) + "%") : "No data");
      setTitle("tVolu", tech.volumeRatio != null ? ("Vol ratio " + fmtNum(tech.volumeRatio, 2) + "x") : "No data");
      setTitle("pSent", psy.fearGreed != null ? ("F&G " + fmtNum(psy.fearGreed, 0)) : "No data");
      setTitle("pDer", psy.fundingRate != null ? ("Funding " + fmtNum(psy.fundingRate, 6)) : "No data");

      setTitle("pCat", "Manual check required");
    }

    function applyAutoDetectedToUI(autoDetected, debug) {
      if (!autoDetected) return;

      const m = autoDetected.macro || {};
      const t = autoDetected.technique || {};
      const p = autoDetected.psycho || {};

      setCheckbox("mLiq", m.liquidite);
      setCheckbox("mFlux", m.flux);
      setCheckbox("mVal", m.valorisation);
      setCheckbox("tMom", t.momentum);
      setCheckbox("tStr", t.structure);
      setCheckbox("tVol", t.volatilite);
      setCheckbox("tVolu", t.volume);
      setCheckbox("pSent", p.sentiment);
      setCheckbox("pDer", p.derives);
      setCheckbox("pCat", p.catalyst);

      state.autoSet.clear();
      const mapping = {
        mLiq: !!m.liquidite,
        mFlux: !!m.flux,
        mVal: !!m.valorisation,
        tMom: !!t.momentum,
        tStr: !!t.structure,
        tVol: !!t.volatilite,
        tVolu: !!t.volume,
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
      setAutoSummary("Auto detected <strong>" + count + " / 10</strong> signals");

      state.lastDebug = debug;
    }

    function computeBlockCounts(autoDetected) {
      const m = autoDetected && autoDetected.macro ? autoDetected.macro : {};
      const t = autoDetected && autoDetected.technique ? autoDetected.technique : {};
      const p = autoDetected && autoDetected.psycho ? autoDetected.psycho : {};

      const macroVals = [!!m.liquidite, !!m.flux, !!m.valorisation];
      const techVals = [!!t.momentum, !!t.structure, !!t.volatilite, !!t.volume];
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
        const suggest = block.ok ? "<em>Scan suggests OK</em>" : "Scan suggests caution";
        return pill + suggest;
      };

      setSimpleHint("simpleHintMacro", line(c.macro));
      setSimpleHint("simpleHintTech", line(c.tech));
      setSimpleHint("simpleHintPsy", line(c.psy));
    }

    function applyQuickScanToSimple(autoDetected) {
      if (!autoDetected) return { macro: 0, tech: 0, psy: 0, total: 0 };

      const m = autoDetected.macro || {};
      const t = autoDetected.technique || {};
      const p = autoDetected.psycho || {};

      const macroCount = Object.values(m).filter(Boolean).length;
      const techCount = Object.values(t).filter(Boolean).length;
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

    let currentController = null;
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

    async function callApi(payload) {
      if (currentController) currentController.abort();
      currentController = new AbortController();

      const requestId = ++requestCounter;

      const key = stableStringify(payload);
      const cached = cacheGet(key);
      if (cached) return cached;

      const maxAttempts = 2;

      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        const res = await fetch(API_PATH, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
          signal: currentController.signal
        });

        if (requestId !== requestCounter) throw new Error("stale_response");

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
      $("methodVersion").textContent = "Method v" + (data.methodVersion || METHOD_VERSION);

      const s = data.scores || {};
      $("scoreTotal").textContent = (typeof s.total === "number") ? s.total.toFixed(1) + " / 10" : "–";
      $("rrVal").textContent = (typeof s.rr === "number") ? s.rr.toFixed(2) : "–";
      $("rrMin").textContent = (typeof s.rrMin === "number") ? s.rrMin.toFixed(1) : "–";

      const mode = payload.mode;
      const bars = $("bars");
      bars.style.display = (mode === "Simple") ? "none" : "block";

      const usedRegime = data.usedRegime || payload.regime;
      if (payload.regime === "Auto" && data.usedRegime) {
        $("regimeHint").textContent = "Auto detected " + data.usedRegime + ". You can override anytime.";
      } else {
        $("regimeHint").textContent = "Auto detects the regime using market context. You can override anytime.";
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
        $("verdictTitle").textContent = "A+ setup";
        $("verdictText").textContent = "Strong confluence. Risk-managed execution still required.";
      } else if (v === "Speculative") {
        vb.classList.add("s");
        $("verdictTitle").textContent = "Speculative";
        $("verdictText").textContent = "Edge exists but risk is higher. Reduce size and keep stops tight.";
      } else {
        vb.classList.add("n");
        $("verdictTitle").textContent = "No trade";
        $("verdictText").textContent = "Too much noise. Wait for better alignment.";
      }

      if (s.baseVerdict && s.finalVerdict && s.baseVerdict !== s.finalVerdict) {
        $("verdictText").textContent = "Setup downgraded due to insufficient RR for this regime.";
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
      if (autoBtn) autoBtn.textContent = isSimple ? "Quick Scan" : "Auto fill";

      const hintEl = $("modeHint");
      if (hintEl) {
        if (isSimple) {
          hintEl.innerHTML =
            "Simple mode. Quick 3-pillar manual check.<br>" +
            "<span class=\"mode-teaser\" data-action=\"switch-pro\" role=\"button\" tabindex=\"0\">" +
            "Quick scan runs the full scan and maps it to the 3 pillars. Switch to Pro for the full breakdown." +
            "</span>";
        } else {
          hintEl.textContent = "Pro mode. Full 10-signal scoring with detailed breakdown.";
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
        setStatus("Type an asset to compute in Auto regime. Example BTC.", "");
      } else {
        setStatus("Updated.", "");
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
        const data = await callApi(payload);
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
          setStatus("Type an asset to compute in Auto regime. Example BTC.", "");
          return;
        }
      }

      if (isAuto && !hasMeaningfulInputs(payload)) {
        resetResultsUI();
        setStatus("Ready.", "");
        return;
      }

      const { entry, stop, tp } = payload.trade;
      const tradeErr = validateTradeClient(payload.direction, entry, stop, tp);
      if (tradeErr) {
        const map = {
          trade_entry_equals_stop: "Entry and Stop cannot be equal.",
          long_invalid_stop: "For a long, Stop must be below Entry.",
          long_invalid_tp: "For a long, TP must be above Entry.",
          short_invalid_stop: "For a short, Stop must be above Entry.",
          short_invalid_tp: "For a short, TP must be below Entry."
        };
        setStatus(map[tradeErr] || "Invalid trade inputs.", "err");
        return;
      }

      if (!isAuto) {
        $("calcBtn").textContent = "Calculating...";
        $("calcBtn").disabled = true;
      }

      try {
        const data = await callApi(payload);
        renderScores(data, payload);

        if (!isAuto) {
          trackScoreCalculated(state.lastScore, payload.regime, payload.direction, payload.mode);
        }

        setStatus(isAuto ? "Updated." : "OK", "ok");
      } catch (e) {
        if (e && e.name === "AbortError") return;
        if (e && String(e.message) === "stale_response") return;

        const code = String(e && e.message ? e.message : "api_error");
        const map = {
          forbidden_origin: "Access denied. Open this page from thecryptomath.com.",
          invalid_json: "Request error. Try again.",
          method_not_allowed: "Method not allowed.",
          unauthorized: "Unauthorized.",
          rate_limited: "Rate limited. Slow down and retry.",
          missing_asset: "Type an asset first. Example BTC.",
          upstream_unavailable: "Upstream temporarily unavailable. Try again.",
          upstream_error: "Upstream API error. Try again.",
          bad_upstream_json: "Upstream returned invalid JSON. Try again.",
          insufficient_market_data: "Not enough market data for this asset.",
          unknown_regime: "Regime auto requires the latest API update.",
          trade_entry_equals_stop: "Entry and Stop cannot be equal.",
          long_invalid_stop: "For a long, Stop must be below Entry.",
          long_invalid_tp: "For a long, TP must be above Entry.",
          short_invalid_stop: "For a short, Stop must be above Entry.",
          short_invalid_tp: "For a short, TP must be below Entry."
        };
        setStatus(map[code] || ("API error. Code " + code), "err");
      } finally {
        if (!isAuto) {
          $("calcBtn").textContent = "Calculate";
          $("calcBtn").disabled = false;
        }
      }
    }

    async function runAutoFill() {
      const asset = normalizeAssetInput($("asset").value);
      if (!asset) {
        setStatus("Type an asset first. Example BTC.", "err");
        return;
      }

      const isSimple = ($("mode").value === "Simple");

      $("autoFillBtn").textContent = isSimple ? "Scanning..." : "Auto filling...";
      $("autoFillBtn").disabled = true;
      $("autoFillBtn").classList.add("loading");

      try {
        if (isSimple) {
          resetAutoUI();

          const scanPayload = buildPayloadFromState();
          scanPayload.mode = "Pro";
          scanPayload.autoFill = true;
          scanPayload.asset = asset;

          const data = await callApi(scanPayload);
          const autoDetected = data.autoDetected || null;

          if (autoDetected) {
            const counts = applyQuickScanToSimple(autoDetected);
            renderSimpleShadowHints(autoDetected);

            setAutoSummary("Quick scan found <strong>" + counts.total + "</strong> signals");
            setStatus("Quick scan complete.", "ok");
          } else {
            clearSimpleHints();
            setAutoSummary("");
            setStatus("Quick scan returned no signal.", "ok");
          }

          await runCalculation(false);
          return;
        }

        resetAutoUI();

        const payload = buildPayloadFromState();
        payload.mode = "Pro";
        payload.autoFill = true;
        payload.asset = asset;

        const data = await callApi(payload);

        if (data.autoDetected) {
          applyAutoDetectedToUI(data.autoDetected, data.debug || null);
        }

        const payloadAfter = buildPayloadFromState();
        payloadAfter.mode = "Pro";
        renderScores(data, payloadAfter);
        setStatus("OK", "ok");
      } catch (e) {
        if (e && e.name === "AbortError") return;
        if (e && String(e.message) === "stale_response") return;

        const code = String(e && e.message ? e.message : "api_error");
        const map = {
          missing_asset: "Missing asset.",
          upstream_unavailable: "Upstream temporarily unavailable. Try again.",
          upstream_error: "Upstream API error. Try again.",
          bad_upstream_json: "Upstream returned invalid JSON. Try again.",
          insufficient_market_data: "Not enough market data for this asset.",
          forbidden_origin: "Access denied. Open this page from thecryptomath.com.",
          rate_limited: "Rate limited. Slow down and retry."
        };
        setStatus(map[code] || ("Scan failed. Code " + code), "err");
      } finally {
        const isSimpleNow = ($("mode").value === "Simple");
        $("autoFillBtn").textContent = isSimpleNow ? "Quick Scan" : "Auto fill";
        $("autoFillBtn").disabled = false;
        $("autoFillBtn").classList.remove("loading");
      }
    }

    function exportJSON() {
      if (!state.lastResponse) {
        setStatus("Nothing to export yet. Click Calculate first.", "err");
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
      setStatus("Exported.", "ok");
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
      const headline = asset ? `I just ran a scan on ${asset} with the @thecryptomath Score` : `I just ran a scan with the @thecryptomath Score`;
      const text = `${headline}\n\nResult ${score}/10\n\nTry it for free`;
      const url = "https://thecryptomath.com/score/";
      window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, "_blank");

      trackScoreShared("x", score);
    }

    function shareOnTelegram() {
      const score = getScoreForShare();
      const asset = getAssetForShare();
      const headline = asset ? `I just ran a scan on ${asset} with the @thecryptomath Score` : `I just ran a scan with the @thecryptomath Score`;
      const text = `${headline}\n\nResult ${score}/10\n\nTry it for free`;
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
            if (count > 0) setAutoSummary("Auto detected <strong>" + count + " / 10</strong> signals");
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

    $("methodVersion").textContent = "Method v" + METHOD_VERSION;
    $("regime").value = "Auto";
    applyModeUI();
    bind();
