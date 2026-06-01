import { cva } from "../lib/cva";

const button = cva(
  "inline-flex items-center justify-center rounded-xl font-medium transition duration-200",
  {
    variant: {
      primary:
        "bg-[var(--primary)] text-black hover:opacity-90 shadow-sm",
      secondary:
        "bg-[var(--surface)] text-[var(--text)] border border-[var(--border)]",
      ghost:
        "bg-transparent text-[var(--text)] hover:bg-white/5",
      danger:
        "bg-red-500 text-[var(--text)]"
    },
    size: {
      sm: "px-3 py-1 text-sm",
      md: "px-4 py-2 text-sm",
      lg: "px-6 py-3 text-base"
    }
  }
);

export default function Button({
  children,
  variant = "primary",
  size = "md",
  className,
  ...props
}) {
  return (
    <button
      {...props}
      className={button({ variant, size, className })}
    >
      {children}
    </button>
  );
}
