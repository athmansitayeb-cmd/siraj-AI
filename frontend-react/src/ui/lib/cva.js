export function cva(base, variants = {}) {
  return ({ variant, size, intent, className = "" } = {}) => {
    let result = base;

    if (variant && variants.variant?.[variant]) {
      result += " " + variants.variant[variant];
    }

    if (size && variants.size?.[size]) {
      result += " " + variants.size[size];
    }

    if (intent && variants.intent?.[intent]) {
      result += " " + variants.intent[intent];
    }

    if (className) result += " " + className;

    return result;
  };
}
