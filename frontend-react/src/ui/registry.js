import Button from "./components/Button";
import Input from "./components/Input";
import Card from "./components/Card";

export const UI = {
  // ================= COMPONENTS =================
  Button,
  Input,
  Card,

  // ================= DESIGN TOKENS =================
  tokens: {
    colors: {
      bg: "var(--bg)",
      surface: "var(--surface)",
      text: "var(--text)",
      muted: "var(--muted)",
      primary: "var(--primary)",
      border: "var(--border)",
      danger: "var(--danger)",
      success: "var(--success)",
      warning: "var(--warning)"
    },

    radius: {
      sm: "var(--radius-sm)",
      md: "var(--radius-md)",
      lg: "var(--radius-lg)",
      xl: "var(--radius-xl)"
    },

    shadow: {
      sm: "var(--shadow-sm)",
      md: "var(--shadow-md)",
      lg: "var(--shadow-lg)"
    }
  },

  // ================= VARIANTS =================
  variants: {
    button: {
      primary: "btn-primary",
      ghost: "btn-ghost"
    },

    card: {
      default: "card",
      glass: "glass"
    }
  }
};
