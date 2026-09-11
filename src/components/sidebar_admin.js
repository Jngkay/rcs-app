import React, { useState } from "react";
import { Home, Book, LogOut, Menu } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";

export default function SideBarAdmin() {
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
      className={`sticky top-0 h-screen flex-shrink-0 overflow-y-auto bg-blue-50 p-4 shadow-md transition-all duration-300
      ${isOpen ? "w-64" : "w-20"}`}
    >
      {/* Top section with logo + hamburger */}
      <div className="flex items-center justify-between mb-2">
        {isOpen && (
          <img src="../../assets/logo.png" alt="logo" className="w-20 block mx-auto" />
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

        <Link
          to="/pages/admin/individualized_assessment"
          className="flex items-center gap-2 p-2 rounded-lg hover:bg-blue-100"
        >
          <Book size={18} />
          {isOpen && <span>Individualized Assessment</span>}
        </Link>


        <button
          disabled={loading}
          onClick={() => {
            setShowLogoutConfirmation(true);
          }}
          className="flex items-center gap-2 p-2 rounded-lg hover:bg-blue-100 text-red-500 w-full text-left"
        >
          <LogOut size={18} />
          {isOpen && <span>Logout</span>}
        </button>
      </nav>

      {/* CONFIRM LOGOUT MODAL */}
      {showLogoutConfirmation && (

        <div className="fixed inset-0 z-[9999] bg-black bg-opacity-40 flex items-center justify-center" style={{ zIndex: 9999 }}>

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
                onClick={() => setShowLogoutConfirmation(false)}
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
