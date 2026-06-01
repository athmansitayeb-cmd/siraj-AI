export default function Card({ children, className = "" }) {
  return (
    <div
      className={`
        bg-[var(--surface)]
        border border-[var(--border)]
        rounded-2xl
        shadow-sm
        p-4
        ${className}
      `}
    >
      {children}
    </div>
  );
}
