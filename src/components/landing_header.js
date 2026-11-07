import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { LogIn, Home } from "lucide-react";

export default function LandingHeader() {
  const navigate = useNavigate();
  const location = useLocation();
  const isLoginPage = location.pathname === "/login";

  const handleNavClick = (sectionId) => {
    if (location.pathname === "/" || location.pathname === "/landing") {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    } else {
      navigate(`/#${sectionId}`);
      // Small timeout to allow landing page to mount before scrolling
      setTimeout(() => {
        const element = document.getElementById(sectionId);
        if (element) {
          element.scrollIntoView({ behavior: "smooth" });
        }
      }, 150);
    }
  };

  const handleLogoClick = () => {
    if (location.pathname === "/" || location.pathname === "/landing") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      navigate("/");
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Logo & Brand Name */}
        <div
          className="flex items-center gap-3 cursor-pointer select-none"
          onClick={handleLogoClick}
          title="Go to Home"
        >
          <img
            src="/assets/logo.png"
            alt="Readi Logo"
            className="h-10 w-auto object-contain drop-shadow-sm"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = require("../assets/logo.png");
            }}
          />
          <div className="flex flex-col">
            <span className="text-2xl font-black tracking-tight text-slate-900 leading-none">
              Readi
            </span>
            <span className="text-[10px] tracking-wider uppercase font-semibold text-secondary">
              Reading Comprehension System
            </span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
          <button
            onClick={() => handleNavClick("about")}
            className="hover:text-secondary transition-colors"
          >
            About Readi
          </button>
          <button
            onClick={() => handleNavClick("how-it-works")}
            className="hover:text-secondary transition-colors"
          >
            How It Works
          </button>
          <button
            onClick={() => handleNavClick("features")}
            className="hover:text-secondary transition-colors"
          >
            Features
          </button>
          <button
            onClick={() => handleNavClick("phil-iri")}
            className="hover:text-secondary transition-colors"
          >
            Phil-IRI Standards
          </button>
        </nav>

        {/* Header Action Button */}
        <div className="flex items-center gap-4">
          {isLoginPage ? (
            <button
              onClick={() => navigate("/")}
              className="group relative inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm transition-all duration-200 border border-slate-200"
            >
              <Home size={16} className="text-secondary" />
              <span>Back to Home</span>
            </button>
          ) : (
            <button
              onClick={() => navigate("/login")}
              className="group relative inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-secondary hover:bg-blue-600 text-white font-semibold text-sm shadow-md hover:shadow-lg transition-all duration-200 transform hover:-translate-y-0.5 active:translate-y-0"
            >
              <span>Log In</span>
              <LogIn size={16} className="transition-transform group-hover:translate-x-0.5" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

