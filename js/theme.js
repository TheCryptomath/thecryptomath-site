(function () {
  try {
    const root = document.documentElement;
    const saved = localStorage.getItem("theme");
    const theme = (saved === "light" || saved === "dark") ? saved : "dark";

    if (theme === "dark") root.setAttribute("data-theme", "dark");
    else root.removeAttribute("data-theme");

    root.style.colorScheme = theme;
  } catch (_) {}
})();
