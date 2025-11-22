import React, {useState} from "react";
import { Home, Book, BarChart, Settings, LogOut, Heart, Menu } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";

export default function SideBarAdmin() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(true);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      localStorage.clear();
      sessionStorage.clear();


      navigate("/login", { replace: true });
    } catch (error) {
      console.error("Logout error:", error.message);
    }
  };

  return (
    <aside
      className={`bg-blue-50 min-h-screen p-4 shadow-md transition-all duration-300
      ${isOpen ? "w-64" : "w-20"}`}
    >
      {/* Top section with logo + hamburger */}
      <div className="flex items-center justify-between mb-8">
        {isOpen && (
          <span className="text-2xl font-bold text-blue-600 whitespace-nowrap">
            Logo
          </span>
        )}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 rounded-lg hover:bg-blue-100"
        >
          <Menu size={20} />
        </button>
      </div>

      {/* Nav links */}
      <nav className="space-y-4">
        <Link
          to="/pages/admin/account_management"
          className="flex items-center gap-2 p-2 rounded-lg bg-orange-500 font-medium"
        >
          <Home size={18} />
          {isOpen && <span>Accounts Management</span>}
        </Link>

        <Link
          to="/pages/admin/comprehension_test"
          className="flex items-center gap-2 p-2 rounded-lg hover:bg-blue-100"
        >
          <Book size={18} />
          {isOpen && <span>Comprehension Test</span>}
        </Link>


        <button
          onClick={handleLogout}
          className="flex items-center gap-2 p-2 rounded-lg hover:bg-blue-100 text-red-500 w-full text-left"
        >
          <LogOut size={18} />
          {isOpen && <span>Logout</span>}
        </button>
      </nav>
    </aside>
  );
}
