import React, {useState} from "react";
import { Home, Book, BarChart, Settings, LogOut, Heart, Menu } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";

export default function SideBar() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(true);
  const [showLogoutConfirmation, setShowLogoutConfirmation] = useState(false);
  const [loading] = useState(false);

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
          to="/pages/student/dashboard"
          className="flex items-center gap-2 p-2 rounded-lg bg-orange-500 font-medium"
        >
          <Home size={18} />
          {isOpen && <span>Home</span>}
        </Link>

        <Link
          to="/pages/student/lessons"
          className="flex items-center gap-2 p-2 rounded-lg hover:bg-blue-100"
        >
          <Book size={18} />
          {isOpen && <span>Lessons</span>}
        </Link>

        <Link
          to="/pages/student/scores"
          className="flex items-center gap-2 p-2 rounded-lg hover:bg-blue-100"
        >
          <BarChart size={18} />
          {isOpen && <span>Scores</span>}
        </Link>

        <Link
          to="/pages/student/progress"
          className="flex items-center gap-2 p-2 rounded-lg hover:bg-blue-100"
        >
          <Heart size={18} />
          {isOpen && <span>Your Progress</span>}
        </Link>

        <Link
          to="/pages/student/settings"
          className="flex items-center gap-2 p-2 rounded-lg hover:bg-blue-100"
        >
          <Settings size={18} />
          {isOpen && <span>Settings</span>}
        </Link>

        <button
          disabled={loading}
          onClick={()=>{
            setShowLogoutConfirmation(true);
          }}
          className="flex items-center gap-2 p-2 rounded-lg hover:bg-blue-100 text-red-500 w-full text-left"
        >
          <LogOut size={18} />
          {isOpen && <span>Logout</span>}
        </button>
      </nav>

          {/* DELETE CONFIRMATION MODAL */}
          {showLogoutConfirmation && (

            <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center">

              <div className="bg-white p-6 rounded-xl shadow-xl w-120">

                <h2 className="text-xl font-bold mb-2">
                  Confirm Logout
                  
                </h2>
                <hr></hr>

                <p className="mb-2 mt-4">
                  You are about to log out of your session. Any unsaved changes may be lost. 
                
                </p>

                <p>Do you want to continue?</p>

                <div className="flex justify-end gap-3">

                  <button
                    onClick={()=>setShowLogoutConfirmation(false)}
                    className="px-4 py-2 bg-gray-300 rounded"
                  >
                    Cancel
                  </button>

                  <button
                    onClick={handleLogout}
                    disabled={loading}
                    className="px-4 py-2 bg-red-500 text-white rounded"
                  >
                    {loading ? "Logging out..." : "Log out"}
                  </button>

                </div>

              </div>

            </div>

          )}
    </aside>
    
  );
}
