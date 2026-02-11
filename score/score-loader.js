(function () {
  const load = () => {
    if (window.__scoreLoaded) return;
    window.__scoreLoaded = true;

    const s = document.createElement("script");
    s.src = "/score/score.js?v=20260211";
    s.async = true;
    document.head.appendChild(s);
  };

  if ("requestIdleCallback" in window) {
    requestIdleCallback(load, { timeout: 1200 });
  } else {
    setTimeout(load, 0);
  }
})();
