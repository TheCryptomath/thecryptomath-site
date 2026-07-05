(function () {
  const wrap = document.querySelector('[data-signal-world]');
  if (!wrap) return;

  // v20260705-perf-v3. Lightweight poster. Draws a soft globe silhouette
  // inside the card while three.js lazy-loads, using the same palette as the
  // existing card background. signal-world.js removes it on its first
  // rendered frame. If the world fails to load it simply stays, keeping the
  // card dressed instead of empty. No global CSS touched.
  if (!wrap.querySelector('[data-world-poster]')) {
    const poster = document.createElement('div');
    poster.setAttribute('data-world-poster', '');
    poster.setAttribute('aria-hidden', 'true');
    poster.className = 'signal-world-poster';
    wrap.appendChild(poster);
  }

  let started = false;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const saveData = !!(navigator.connection && navigator.connection.saveData);

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
      .then(() => loadScript('/js/signal-world.js?v=20260705-perf-v3'))
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

  // Respect reduced-motion and Save-Data before downloading Three.js.
  // The static poster remains visible. An explicit user interaction can still
  // start the world, preserving discoverability without automatic network/GPU cost.
  if (!reduceMotion && !saveData) {
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
  } else {
    wrap.classList.add('is-static-world');
  }

  ['pointerdown', 'mouseenter', 'touchstart', 'focusin'].forEach((eventName) => {
    wrap.addEventListener(eventName, startWorld, { once: true, passive: true });
  });
})();
