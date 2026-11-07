import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ShieldCheck } from "lucide-react";

export default function LandingFooter() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavClick = (sectionId) => {
    if (location.pathname === "/" || location.pathname === "/landing") {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    } else {
      navigate(`/#${sectionId}`);
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
    <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-8 border-b border-slate-800">
          {/* Logo in footer */}
          <div
            className="flex items-center gap-3 cursor-pointer select-none"
            onClick={handleLogoClick}
            title="Go to Home"
          >
            <img
              src="/assets/logo.png"
              alt="Readi Logo"
              className="h-8 w-auto object-contain brightness-0 invert opacity-90"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = require("../assets/logo.png");
              }}
            />
            <span className="text-xl font-bold text-white tracking-tight">Readi</span>
          </div>

          {/* Footer Navigation */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm">
            <button
              onClick={() => handleNavClick("about")}
              className="hover:text-white transition-colors"
            >
              About
            </button>
            <button
              onClick={() => handleNavClick("how-it-works")}
              className="hover:text-white transition-colors"
            >
              How It Works
            </button>
            <button
              onClick={() => handleNavClick("features")}
              className="hover:text-white transition-colors"
            >
              Features
            </button>
            <button
              onClick={() => handleNavClick("phil-iri")}
              className="hover:text-white transition-colors"
            >
              Phil-IRI Standards
            </button>
            {location.pathname !== "/login" ? (
              <button
                onClick={() => navigate("/login")}
                className="text-secondary font-semibold hover:underline"
              >
                Log In
              </button>
            ) : (
              <button
                onClick={() => navigate("/")}
                className="text-secondary font-semibold hover:underline"
              >
                Home
              </button>
            )}
          </div>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>
            © {new Date().getFullYear()} Readi — Reading Comprehension System. All rights reserved.
          </p>
          <p className="flex items-center gap-2">
            <ShieldCheck size={14} className="text-secondary" />
            <span>Aligned with Philippine Department of Education (DepEd) Phil-IRI Framework</span>
          </p>
        </div>
      </div>
    </footer>
  );
}

