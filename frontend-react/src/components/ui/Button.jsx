export default function Button({ children, onClick, className }) {
  return (
    <button
      onClick={onClick}
      className={`px-6 py-3 bg-yellow-400 text-black font-bold rounded-xl hover:scale-105 transition-transform ${className || ""}`}
    >
      {children}
    </button>
  );
}
