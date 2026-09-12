import React, { useState } from "react";
import { createPortal } from "react-dom";
import { Book, Users, FileText, ClipboardList, LogOut, Menu } from "lucide-react";
import { useNavigate, NavLink } from "react-router-dom";
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
      className={`sticky top-0 h-screen flex flex-col flex-shrink-0 overflow-y-auto bg-slate-50 border-r border-slate-200/60 p-4 shadow-soft transition-all duration-300 z-30
      ${isOpen ? "w-64" : "w-20"}`}
    >
      {/* Top section with logo + hamburger */}
      <div className="flex items-center justify-between mb-8">
        {isOpen && (
          <img src="../../assets/logo.png" alt="logo" className="w-20 block mx-auto drop-shadow-md" />
        )}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 rounded-lg text-slate-500 hover:bg-slate-200 transition-colors"
        >
          <Menu size={20} />
        </button>
      </div>

      {/* Nav links */}
      <nav className="flex-1 space-y-4">
        <NavLink
          to="/pages/admin/account_management"
          className={({ isActive }) =>
            `flex items-center gap-3 p-2 rounded-full font-semibold transition-all duration-200 group ${
              isActive ? "bg-systemYellow-400 text-white shadow-md" : "text-brandNeutral-text hover:bg-slate-200/50"
            }`
          }
        >
          {({ isActive }) => (
            <>
              <div className={`${isActive ? "bg-white text-systemYellow-400" : "text-brandNeutral-text"} p-2 rounded-full transition-colors`}>
                <Users size={20} className={!isActive ? "group-hover:scale-110 transition-transform" : ""} />
              </div>
              {isOpen && <span>Account Management</span>}
            </>
          )}
        </NavLink>

        <NavLink
          to="/pages/admin/comprehension_test"
          className={({ isActive }) =>
            `flex items-center gap-3 p-2 rounded-full font-semibold transition-all duration-200 group ${
              isActive ? "bg-systemYellow-400 text-white shadow-md" : "text-brandNeutral-text hover:bg-slate-200/50"
            }`
          }
        >
          {({ isActive }) => (
            <>
              <div className={`${isActive ? "bg-white text-systemYellow-400" : "text-brandNeutral-text"} p-2 rounded-full transition-colors`}>
                <FileText size={20} className={!isActive ? "group-hover:scale-110 transition-transform" : ""} />
              </div>
              {isOpen && <span>GST Passages</span>}
            </>
          )}
        </NavLink>

        <NavLink
          to="/pages/admin/individualized_assessment"
          className={({ isActive }) =>
            `flex items-center gap-3 p-2 rounded-full font-semibold transition-all duration-200 group ${
              isActive ? "bg-systemYellow-400 text-white shadow-md" : "text-brandNeutral-text hover:bg-slate-200/50"
            }`
          }
        >
          {({ isActive }) => (
            <>
              <div className={`${isActive ? "bg-white text-systemYellow-400" : "text-brandNeutral-text"} p-2 rounded-full transition-colors`}>
                <ClipboardList size={20} className={!isActive ? "group-hover:scale-110 transition-transform" : ""} />
              </div>
              {isOpen && <span>Individualized Assessment</span>}
            </>
          )}
        </NavLink>
      </nav>

      <div className="mt-auto pt-4">
        <button
          disabled={loading}
          onClick={() => {
            setShowLogoutConfirmation(true);
          }}
          className="flex items-center gap-3 p-2 rounded-full text-brandNeutral-text hover:bg-red-50 hover:text-red-500 w-full text-left transition-all duration-200 font-semibold group"
        >
          <div className="p-2 rounded-full transition-colors group-hover:bg-red-100 group-hover:text-red-500">
            <LogOut size={20} className="group-hover:scale-110 transition-transform" />
          </div>
          {isOpen && <span>Log out</span>}
        </button>
      </div>

      {/* CONFIRM LOGOUT MODAL (Portaled to document.body for top-level stacking) */}
      {showLogoutConfirmation && createPortal(
        <div className="fixed inset-0 z-[99999] bg-black bg-opacity-50 flex items-center justify-center p-4" style={{ zIndex: 99999 }}>
          <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-md text-slate-800 animate-fadeIn">
            <h2 className="text-xl font-bold mb-2">Confirm Logout</h2>
            <hr className="mb-4 border-slate-200" />
            <p className="mb-2 text-slate-700">
              You are about to log out of your session. Any unsaved changes may be lost.
            </p>
            <p className="mb-6 font-medium text-slate-600">Do you want to continue?</p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowLogoutConfirmation(false)}
                className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-lg font-semibold text-sm transition"
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                disabled={loading}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold text-sm transition shadow"
              >
                {loading ? "Logging out..." : "Log out"}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </aside>
  );
}
