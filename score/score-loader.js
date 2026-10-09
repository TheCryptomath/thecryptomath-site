(function () {
  const load = () => {
    if (window.__scoreLoaded) return;
    window.__scoreLoaded = true;

    const s = document.createElement("script");
    s.src = "/score/score.js?v=20261009-audit-scorefix1";
    s.async = true;
    s.onerror = () => {
      for (const id of ["autoFillBtn", "calcBtn", "resetBtn", "exportBtn", "shareXBtn", "shareTgBtn"]) {
        const button = document.getElementById(id);
        if (button) button.disabled = true;
      }
      const status = document.getElementById("status");
      if (status) {
        const isFrench = (document.documentElement.lang || "").toLowerCase().startsWith("fr");
        status.className = "status err";
        status.textContent = isFrench
          ? "L’outil Score n’a pas pu être chargé. Réessayez plus tard."
          : "The Score tool could not be loaded. Please try again later.";
      }
    };
    document.head.appendChild(s);
  };

  if ("requestIdleCallback" in window) {
    requestIdleCallback(load, { timeout: 1200 });
  } else {
    setTimeout(load, 0);
  }
})();
