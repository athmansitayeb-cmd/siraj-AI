module.exports = {
  meta: {
    type: "problem"
  },

  create(context) {
    return {
      Literal(node) {
        const value = node.value;

        if (typeof value !== "string") return;

        const badPatterns = [
          "bg-black",
          "text-white",
          "border-white"
        ];

        for (const p of badPatterns) {
          if (value.includes(p)) {
            context.report({
              node,
              message:
                "UI Intelligence: use design system tokens or UI components"
            });
          }
        }
      }
    };
  }
};
