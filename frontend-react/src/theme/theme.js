import { applyTheme } from "../ui/themes/themeEngine";

export const initTheme = () => {
  const saved = localStorage.getItem("siraj_theme") || "dark";
  applyTheme(saved);
};

export const setTheme = (theme) => {
  applyTheme(theme);
};
