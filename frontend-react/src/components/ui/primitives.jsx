import { glass } from "../../design/tokens";

export function Section({
 children,
 className = "",
}) {
 return (
 <section className={`py-24 ${className}`}>
 {children}
 </section>
 );
}

export function Card({
 children,
 className = "",
}) {
 return (
 <div
 className={`
 ${glass}
 rounded-[28px]
 shadow-[0_10px_40px_rgba(15,23,42,0.06)]
 ${className}
 `}
 >
 {children}
 </div>
 );
}

export function PrimaryButton({
 children,
 className = "",
 ...props
}) {
 return (
 <button
 {...props}
 className={`
 px-6 py-3 rounded-2xl
 bg-gradient-to-r from-blue-600 to-cyan-500
 text-[var(--text)] font-semibold
 shadow-[0_10px_30px_rgba(37,99,235,0.25)]
 hover:scale-[1.02]
 active:scale-[0.98]
 transition-all duration-300
 ${className}
 `}
 >
 {children}
 </button>
 );
}

export function SecondaryButton({
 children,
 className = "",
 ...props
}) {
 return (
 <button
 {...props}
 className={`
 px-6 py-3 rounded-2xl
 bg-white/70
 backdrop-blur-xl
 border border-slate-200
 text-slate-700 font-semibold
 hover:bg-white
 transition-all duration-300
 ${className}
 `}
 >
 {children}
 </button>
 );
}

export function Badge({
 children,
}) {
 return (
 <div
 className="
 inline-flex items-center gap-2
 px-4 py-2 rounded-full
 bg-blue-50 border border-blue-100
 text-blue-700 text-sm font-medium
 "
 >
 <div className="w-2 h-2 rounded-full bg-cyan-500" />

 {children}
 </div>
 );
}
