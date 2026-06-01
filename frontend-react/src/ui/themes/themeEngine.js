export const themes = {
  dark: {
    "--bg": "#05070D",
    "--text": "#EAF0FF",
    "--primary": "#FACC15",
    "--border": "rgba(255,255,255,0.08)"
  },

  light: {
    "--bg": "#F7FAFF",
    "--text": "#0B1B2B",
    "--primary": "#2563EB",
    "--border": "rgba(0,0,0,0.08)"
  }
};

export function applyTheme(name = "dark") {
  const theme = themes[name];

  Object.entries(theme).forEach(([k, v]) => {
    document.documentElement.style.setProperty(k, v);
  });

  localStorage.setItem("siraj_theme", name);
}
