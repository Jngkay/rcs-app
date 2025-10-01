// // src/App.js
import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./login";
import Dashboard from "./pages/dashboard";
import Lessons from "./pages/lessons";
import Scores from "./pages/scores";
import Progress from "./pages/progress";
import Settings from "./pages/settings";
import Profile from "./pages/profile";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Login Page */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        
        <Route path="/login" element={<Login />} />

        {/* Dashboard (after login) */}
        <Route path="/pages/dashboard" element={<Dashboard />} />
        <Route path="/pages/lessons" element={<Lessons />} />
        <Route path="/pages/scores" element={<Scores />} />
        <Route path="/pages/progress" element={<Progress />} />
        <Route path="/pages/settings" element={<Settings />} />
        <Route path="/pages/profile" element={<Profile />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
