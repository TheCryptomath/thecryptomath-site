// Theme toggle
(function() {
  const root = document.documentElement;
  const btn = document.querySelector('[data-theme-toggle]');
  const storageKey = 'theme';

  const getPreferred = () => {
    const saved = localStorage.getItem(storageKey);
    if (saved === 'light' || saved === 'dark') return saved;
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  };

  const apply = (theme) => {
    if (theme === 'dark') root.setAttribute('data-theme', 'dark');
    else root.removeAttribute('data-theme');
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
    if (window.scrollY > 50) {
      topbar.classList.add('scrolled');
    } else {
      topbar.classList.remove('scrolled');
    }
  };
  
  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll(); // Initial check
})();

// Mobile menu toggle
(function() {
  const toggle = document.querySelector('[data-mobile-toggle]');
  const links = document.querySelector('[data-navlinks]');
  if (!toggle || !links) return;

  // Accessibility wiring
  if (!links.id) links.id = 'navlinks';
  toggle.setAttribute('aria-controls', links.id);

  const close = () => {
    links.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.textContent = 'Menu';
  };

  const open = () => {
    links.classList.add('open');
    toggle.setAttribute('aria-expanded', 'true');
    toggle.textContent = 'Close';
  };

  toggle.addEventListener('click', () => {
    const isOpen = links.classList.contains('open');
    isOpen ? close() : open();
  });

  // Close menu when clicking a link
  links.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', close);
  });

  // Close on outside click
  document.addEventListener('click', (e) => {
    if (!links.classList.contains('open')) return;
    if (links.contains(e.target) || toggle.contains(e.target)) return;
    close();
  });

  // Close on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') close();
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
