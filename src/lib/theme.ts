// Modo claro/oscuro: la clase `.dark` en <html> activa los tokens oscuros de globals.css.
// Sin preferencia guardada se sigue la del sistema. Este módulo no toca Prisma para poder usarse en Client Components.

export type Theme = "light" | "dark";

export const THEME_STORAGE_KEY = "theme";

/** Color de la barra de estado / pestaña en cada modo (igual a `--color-canvas`). */
export const THEME_COLORS: Record<Theme, string> = { light: "#F3F4F1", dark: "#0F1114" };

export function applyTheme(theme: Theme): void {
  document.documentElement.classList.toggle("dark", theme === "dark");
  for (const meta of document.querySelectorAll('meta[name="theme-color"]')) {
    meta.setAttribute("content", THEME_COLORS[theme]);
  }
}

/**
 * Se ejecuta en <head> antes de pintar para que no parpadee el modo claro. Vuelve a aplicar al terminar
 * de cargar (la meta `theme-color` puede llegar después del script) y sigue al sistema si no hay preferencia.
 */
export const THEME_SCRIPT = `(function () {
  var media = window.matchMedia("(prefers-color-scheme: dark)");
  function stored() {
    try { return localStorage.getItem(${JSON.stringify(THEME_STORAGE_KEY)}); } catch (e) { return null; }
  }
  function apply() {
    var saved = stored();
    var dark = saved ? saved === "dark" : media.matches;
    document.documentElement.classList.toggle("dark", dark);
    var color = dark ? ${JSON.stringify(THEME_COLORS.dark)} : ${JSON.stringify(THEME_COLORS.light)};
    document.querySelectorAll('meta[name="theme-color"]').forEach(function (m) { m.setAttribute("content", color); });
  }
  apply();
  document.addEventListener("DOMContentLoaded", apply);
  media.addEventListener("change", function () { if (!stored()) apply(); });
})();`;
