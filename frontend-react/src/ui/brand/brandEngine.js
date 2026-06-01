import { applyTheme } from "../themes/themeEngine";

const DEFAULT_BRAND = {
  name: "SIRAJ",
  primary: "#FACC15",
  background: "#05070D"
};

export function applyBrand(brand = DEFAULT_BRAND) {
  // theme base
  applyTheme("dark");

  // override runtime brand tokens
  document.documentElement.style.setProperty("--primary", brand.primary);
  document.documentElement.style.setProperty("--brand-name", brand.name);

  localStorage.setItem("siraj_brand", JSON.stringify(brand));
}

export function initBrand() {
  const saved = localStorage.getItem("siraj_brand");
  if (saved) {
    applyBrand(JSON.parse(saved));
  } else {
    applyBrand(DEFAULT_BRAND);
  }
}
