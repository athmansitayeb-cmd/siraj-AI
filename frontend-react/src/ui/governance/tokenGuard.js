export function enforceTokens() {
  const forbidden = ["bg-black", "text-white", "border-white"];

  const observer = new MutationObserver(() => {
    document.querySelectorAll("*").forEach((el) => {
      const cls = el.className || "";

      forbidden.forEach((f) => {
        if (cls.includes(f)) {
          console.error(
            "UI Governance Violation:",
            f,
            el
          );
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
