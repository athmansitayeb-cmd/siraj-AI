import { Link, useLocation } from "react-router-dom";

export default function Navbar() {
  const location = useLocation();
  const links = [
    { path: "/", label: "Home" },
    { path: "/chat", label: "Chat" },
    { path: "/login", label: "Login" },
    { path: "/register", label: "Register" },
  ];

  return (
    <nav className="w-full bg-black border-b border-yellow-400 shadow-lg">
      <div className="max-w-6xl mx-auto flex items-center justify-between px-6 py-4">
        <Link to="/" className="text-2xl font-extrabold tracking-wide text-yellow-400">
          SIRAJ
        </Link>
        <div className="flex gap-6">
          {links.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`text-sm font-semibold transition ${
                location.pathname === link.path
                  ? "text-yellow-400"
                  : "text-yellow-200 hover:text-yellow-400"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
