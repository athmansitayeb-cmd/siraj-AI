export default function Button({ children, onClick }) {
  return (
    <button
      onClick={onClick}
      className="px-6 py-3 rounded-2xl bg-yellow-400 text-black font-bold 
      shadow-lg hover:shadow-yellow-500/50 transition-all duration-300 
      hover:scale-105 active:scale-95"
    >
      {children}
    </button>
  );
}
