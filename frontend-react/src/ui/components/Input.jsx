import { cva } from "../lib/cva";

const input = cva(
  "w-full rounded-xl outline-none transition",
  {
    variant: {
      default:
        "bg-[var(--surface)] text-[var(--text)] border border-[var(--border)] focus:border-[var(--primary)]"
    },
    size: {
      sm: "px-3 py-2 text-sm",
      md: "px-4 py-3 text-sm",
      lg: "px-5 py-4 text-base"
    }
  }
);

export default function Input({
  variant = "default",
  size = "md",
  className,
  ...props
}) {
  return (
    <input
      {...props}
      className={input({ variant, size, className })}
    />
  );
}
