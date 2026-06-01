module.exports = {
  rules: {
    "no-restricted-syntax": [
      "error",
      {
        selector: "Literal[value=/bg-black|text-white|border-white/]",
        message: "Use design tokens (var(--*)) or UI components only"
      }
    ]
  }
};
