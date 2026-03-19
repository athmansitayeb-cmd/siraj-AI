import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

export default function MainLayout({ children }) {
  return (
    <div className="flex h-screen overflow-hidden bg-gradient-to-br from-black via-gray-900 to-black">

      <Sidebar />

      <div className="flex-1 flex flex-col">
        <Navbar />

        <main className="flex-1 p-6 overflow-y-auto">
          <div className="glass p-6 h-full">
            {children}
          </div>
        </main>
      </div>

    </div>
  );
}
