(function () {
  try {
    const root = document.documentElement;
    const saved = localStorage.getItem("theme");
    const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
    const theme = (saved === "light" || saved === "dark") ? saved : (prefersDark ? "dark" : "light");

    if (theme === "dark") root.setAttribute("data-theme", "dark");
    else root.removeAttribute("data-theme");
  } catch (_) {}
})();
