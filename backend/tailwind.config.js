export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#FFD700",
        dark: "#0a0a0a",
        glass: "rgba(255,255,255,0.05)"
      },
      backdropBlur: {
        xs: '2px',
      }
    },
  },
  plugins: [],
};
