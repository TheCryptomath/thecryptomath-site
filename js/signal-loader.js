(function () {
  const wrap = document.querySelector('[data-signal-world]');
  if (!wrap) return;

  let started = false;

  function loadScript(src) {
    return new Promise((resolve, reject) => {
      const existing = document.querySelector('script[src^="' + src.split('?')[0] + '"]');
      if (existing) {
        if (existing.dataset.loaded === 'true') resolve();
        else existing.addEventListener('load', resolve, { once: true });
        return;
      }

      const script = document.createElement('script');
      script.src = src;
      script.defer = true;
      script.onload = () => {
        script.dataset.loaded = 'true';
        resolve();
      };
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  function startWorld() {
    if (started) return;
    started = true;
    wrap.classList.add('is-loading-world');

    loadScript('/js/three.min.js?v=0.128.0')
      .then(() => loadScript('/js/signal-world.js?v=20260616-audit-v1'))
      .then(() => wrap.classList.remove('is-loading-world'))
      .catch(() => {
        wrap.classList.remove('is-loading-world');
        wrap.classList.add('is-world-unavailable');
      });
  }

  function idleStart() {
    const run = () => {
      if ('requestIdleCallback' in window) {
        window.requestIdleCallback(startWorld, { timeout: 1400 });
      } else {
        window.setTimeout(startWorld, 320);
      }
    };

    if (document.readyState === 'complete') run();
    else window.addEventListener('load', run, { once: true });
  }

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        observer.disconnect();
        idleStart();
      }
    }, { rootMargin: '220px 0px' });
    observer.observe(wrap);
  } else {
    idleStart();
  }

  ['pointerdown', 'mouseenter', 'touchstart', 'focusin'].forEach((eventName) => {
    wrap.addEventListener(eventName, startWorld, { once: true, passive: true });
  });
})();
