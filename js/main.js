// Theme toggle
(function() {
  const root = document.documentElement;
  const btn = document.querySelector('[data-theme-toggle]');
  const storageKey = 'theme';

  const getPreferred = () => {
    const saved = localStorage.getItem(storageKey);
    if (saved === 'light' || saved === 'dark') return saved;

    // Default theme when nothing is saved
    return 'dark';
  };

  const apply = (theme) => {
    if (theme === 'dark') root.setAttribute('data-theme', 'dark');
    else root.removeAttribute('data-theme');

    // Helps the browser paint native UI consistently
    try { root.style.colorScheme = theme; } catch (_) {}

    if (btn) btn.setAttribute('aria-label', theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme');
    if (btn) btn.setAttribute('data-theme-current', theme);
  };

  const init = () => apply(getPreferred());
  init();

  if (!btn) return;

  btn.addEventListener('click', () => {
    const current = root.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
    const next = current === 'dark' ? 'light' : 'dark';
    localStorage.setItem(storageKey, next);
    apply(next);
  });
})();

// Navigation scroll effect
(function() {
  const topbar = document.querySelector('.topbar');
  if (!topbar) return;

  const handleScroll = () => {
    if (window.scrollY > 50) topbar.classList.add('scrolled');
    else topbar.classList.remove('scrolled');
  };

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();
})();

// Mobile menu toggle with focus trap + escape + focus restore
(function() {
  const toggle = document.querySelector('[data-mobile-toggle]');
  const links = document.querySelector('[data-navlinks]');
  if (!toggle || !links) return;

  // Accessibility wiring
  if (!links.id) links.id = 'navlinks';
  toggle.setAttribute('aria-controls', links.id);

  const isOpen = () => links.classList.contains('open');

  const focusToggle = () => {
    try { toggle.focus({ preventScroll: true }); } catch { toggle.focus(); }
  };

  const getFocusable = () => {
    const focusableSelectors = [
      'a[href]',
      'button:not([disabled])',
      '[tabindex]:not([tabindex="-1"])'
    ].join(',');

    const inside = Array.from(links.querySelectorAll(focusableSelectors))
      .filter(el => !el.hasAttribute('disabled') && el.getAttribute('aria-hidden') !== 'true');

    // Inclure le bouton toggle pour éviter de tabuler hors du menu
    return [toggle, ...inside];
  };

  const close = () => {
    if (!isOpen()) return;
    links.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.textContent = 'Menu';
    focusToggle();
  };

  const open = () => {
    if (isOpen()) return;
    links.classList.add('open');
    toggle.setAttribute('aria-expanded', 'true');
    toggle.textContent = 'Close';

    const focusable = getFocusable();
    const firstLink = focusable.find(el => el !== toggle) || toggle;
    try { firstLink.focus({ preventScroll: true }); } catch { firstLink.focus(); }
  };

  toggle.addEventListener('click', () => {
    isOpen() ? close() : open();
  });

  // Close menu when clicking a link
  links.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', close);
  });

  // Close on outside click
  document.addEventListener('click', (e) => {
    if (!isOpen()) return;
    if (links.contains(e.target) || toggle.contains(e.target)) return;
    close();
  });

  // Focus trap + Escape, single global listener
  document.addEventListener('keydown', (e) => {
    if (!isOpen()) return;

    if (e.key === 'Escape') {
      e.preventDefault();
      close();
      return;
    }

    if (e.key !== 'Tab') return;

    const focusable = getFocusable();
    if (!focusable.length) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (e.shiftKey) {
      if (document.activeElement === first) {
        e.preventDefault();
        last.focus();
      }
    } else {
      if (document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  });
})();

// Intersection Observer for fade-in animations
(function() {
  const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.1
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  document.querySelectorAll('.fade-in').forEach(el => {
    observer.observe(el);
  });
})();

// Footer year
(function() {
  const y = String(new Date().getFullYear());
  document.querySelectorAll('[data-year]').forEach(el => { el.textContent = y; });
})();
