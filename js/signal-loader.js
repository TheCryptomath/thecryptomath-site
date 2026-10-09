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
  let unavailable = false;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const saveData = !!(navigator.connection && navigator.connection.saveData);
  const fr = (document.documentElement.lang || 'en').toLowerCase().startsWith('fr');
  const fallbackLinks = fr
    ? [
        ['Newsletter', '/fr/newsletter/'],
        ['Score', '/fr/score/'],
        ['Projets', '/fr/build/'],
        ['Narrative Framework', '/fr/narrative-framework/'],
        ['Ressources', '/fr/resources/'],
        ['Contact', '/fr/contact/']
      ]
    : [
        ['Newsletter', '/newsletter'],
        ['Score', '/score/'],
        ['Build', '/build'],
        ['Narrative Framework', '/narrative-framework'],
        ['Resources', '/resources'],
        ['Connect', '/connect']
      ];

  // Both script failures and initial renderer failures enter the same static state.
  function showUnavailable() {
    if (unavailable) return;
    unavailable = true;
    wrap.classList.remove('is-loading-world');
    wrap.classList.add('is-world-unavailable');

    const controls = wrap.querySelector('.world-controls');
    if (controls) controls.hidden = true;
    const panel = wrap.querySelector('[data-world-panel]');
    if (!panel) return;
    const title = panel.querySelector('[data-world-title]');
    const desc = panel.querySelector('[data-world-desc]');
    const worldLink = panel.querySelector('[data-world-link]');
    if (title) title.textContent = fr ? 'Explorer The Cryptomath' : 'Explore The Cryptomath';
    if (desc) desc.textContent = fr
      ? 'La carte interactive n’est pas disponible sur cet appareil. Utilisez les liens ci-dessous pour explorer le site.'
      : 'Interactive map unavailable on this device. Use the links below to explore the site.';
    if (worldLink) worldLink.style.display = 'none';

    const nav = document.createElement('nav');
    nav.setAttribute('data-world-fallback-links', '');
    nav.setAttribute('aria-label', fr ? 'Explorer le site' : 'Explore the site');
    fallbackLinks.forEach(([label, href], index) => {
      if (index) nav.appendChild(document.createTextNode(' · '));
      const link = document.createElement('a');
      link.href = href;
      link.textContent = label;
      nav.appendChild(link);
    });
    panel.appendChild(nav);
  }

  wrap.addEventListener('signal-world:unavailable', showUnavailable);

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
      .then(() => loadScript('/js/signal-world.js?v=20261009-audit-ux002'))
      .then(() => wrap.classList.remove('is-loading-world'))
      .catch(showUnavailable);
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

  ['pointerdown', 'touchstart', 'focusin'].forEach((eventName) => {
    wrap.addEventListener(eventName, startWorld, { once: true, passive: true });
  });
})();
