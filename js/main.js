const UI_LANG = (document.documentElement.lang || 'en').toLowerCase().startsWith('fr') ? 'fr' : 'en';
const UI_I18N = {
  en: {
    menu: 'Menu',
    close: 'Close',
    switchToLightTheme: 'Switch to light theme',
    switchToDarkTheme: 'Switch to dark theme'
  },
  fr: {
    menu: 'Menu',
    close: 'Fermer',
    switchToLightTheme: 'Passer au thème clair',
    switchToDarkTheme: 'Passer au thème sombre'
  }
};

function uiText(key) {
  return (UI_I18N[UI_LANG] && UI_I18N[UI_LANG][key]) || UI_I18N.en[key] || key;
}

// Theme toggle
(function() {
  const root = document.documentElement;
  const btn = document.querySelector('[data-theme-toggle]');
  const storageKey = 'theme';

  const getPreferred = () => {
    const saved = localStorage.getItem(storageKey);
    if (saved === 'light' || saved === 'dark') return saved;
    return 'dark';
  };

  const apply = (theme) => {
    if (theme === 'dark') root.setAttribute('data-theme', 'dark');
    else root.removeAttribute('data-theme');

    try { root.style.colorScheme = theme; } catch (_) {}

    if (btn) {
      btn.setAttribute('aria-label', theme === 'dark' ? uiText('switchToLightTheme') : uiText('switchToDarkTheme'));
      btn.setAttribute('data-theme-current', theme);

      const svg = btn.querySelector('svg');
      if (svg) {
        svg.innerHTML = theme === 'dark'
          ? '<circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>'
          : '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>';
      }
    }
  };

  // theme.js already applied the theme before this runs — only re-apply if state drifted
  const currentTheme = root.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
  if (currentTheme !== getPreferred()) apply(getPreferred());
  else apply(currentTheme); // still sync the button UI

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

// Mobile menu toggle with focus trap + escape + focus restore + resize
(function() {
  const toggle = document.querySelector('[data-mobile-toggle]');
  const links = document.querySelector('[data-navlinks]');
  if (!toggle || !links) return;

  if (!links.id) links.id = 'navlinks';
  toggle.setAttribute('aria-controls', links.id);
  toggle.setAttribute('aria-label', uiText('menu'));

  const isOpen = () => links.classList.contains('open');

  const focusToggle = () => {
    try { toggle.focus({ preventScroll: true }); } catch { toggle.focus(); }
  };

  const getFocusable = () => {
    const sel = ['a[href]', 'button:not([disabled])', '[tabindex]:not([tabindex="-1"])'].join(',');
    const inside = Array.from(links.querySelectorAll(sel))
      .filter(el => !el.hasAttribute('disabled') && el.getAttribute('aria-hidden') !== 'true');
    return [toggle, ...inside];
  };

  const close = () => {
    if (!isOpen()) return;
    links.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', uiText('menu'));
    toggle.textContent = uiText('menu');
    focusToggle();
  };

  const open = () => {
    if (isOpen()) return;
    links.classList.add('open');
    toggle.setAttribute('aria-expanded', 'true');
    toggle.setAttribute('aria-label', uiText('close'));
    toggle.textContent = uiText('close');

    const focusable = getFocusable();
    const firstLink = focusable.find(el => el !== toggle) || toggle;
    try { firstLink.focus({ preventScroll: true }); } catch { firstLink.focus(); }
  };

  toggle.addEventListener('click', () => {
    isOpen() ? close() : open();
  });

  links.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', close);
  });

  document.addEventListener('click', (e) => {
    if (!isOpen()) return;
    if (links.contains(e.target) || toggle.contains(e.target)) return;
    close();
  });

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

  // Close menu if viewport grows past mobile breakpoint
  window.addEventListener('resize', () => {
    if (window.innerWidth > 768 && isOpen()) close();
  }, { passive: true });
})();

// Intersection Observer for fade-in animations
(function() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { root: null, rootMargin: '0px', threshold: 0.1 });

  document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));
})();

// Footer year
(function() {
  const y = String(new Date().getFullYear());
  document.querySelectorAll('[data-year]').forEach(el => { el.textContent = y; });
})();
