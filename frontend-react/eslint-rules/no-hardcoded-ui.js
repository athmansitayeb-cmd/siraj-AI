module.exports = {
  meta: {
    type: "problem",
    docs: {
      description: "Disallow hardcoded UI colors"
    }
  },

  create(context) {
    const forbiddenPatterns = [
      "bg-black",
      "bg-white",
      "text-white",
      "text-black",
      "border-white",
      "border-black",
      "bg-[#",
      "text-[#",
      "border-[#"
    ];

    return {
      Literal(node) {
        if (typeof node.value !== "string") return;

        for (const pattern of forbiddenPatterns) {
          if (node.value.includes(pattern)) {
            context.report({
              node,
              message:
                "Use design tokens (var(--color)) or UI components instead of hardcoded colors"
            });
          }
        }
      }
    };
  }
};
