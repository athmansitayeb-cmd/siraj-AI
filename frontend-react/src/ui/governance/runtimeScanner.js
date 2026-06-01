const forbidden = [
  "bg-black",
  "text-white",
  "border-white"
];

export function startUIScanner() {
  const observer = new MutationObserver(() => {
    document.querySelectorAll("*").forEach((el) => {
      const cls = el.className || "";

      forbidden.forEach((rule) => {
        if (cls.includes(rule)) {
          console.error("[UI VIOLATION]", rule, el);

          el.style.outline = "2px solid red";
        }
      });
    });
  });

  observer.observe(document.body, {
    subtree: true,
    attributes: true,
    attributeFilter: ["class"]
  });
}
