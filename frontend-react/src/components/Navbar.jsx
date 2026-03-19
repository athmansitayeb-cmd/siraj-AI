export default function Navbar() {
  return (
    <div className="w-full px-6 py-4 border-b border-white/10 flex justify-between items-center">

      <div className="text-lg font-bold text-primary">
        SIRAJ AI
      </div>

      <button
        onClick={() => {
          localStorage.removeItem("siraj_token");
          window.location.href = "/login";
        }}
        className="text-sm text-red-400 hover:text-red-500"
      >
        Logout
      </button>

    </div>
  );
}
