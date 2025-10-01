// src/ProtectedRoute.js
import React from "react";
import { Navigate } from "react-router-dom";
import { auth } from "./firebase"; // import your firebase config
import { useAuthState } from "react-firebase-hooks/auth";

function ProtectedRoute({ children }) {
  const [user, loading] = useAuthState(auth);

  if (loading) {
    return <p className="text-center">Loading...</p>;
  }

  // if no user → go back to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default ProtectedRoute;
