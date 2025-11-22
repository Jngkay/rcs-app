// // src/App.js
import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./login";
import Dashboard from "./pages/student/dashboard";
import Lessons from "./pages/student/lessons";
import Scores from "./pages/student/scores";
import Progress from "./pages/student/progress";
import Settings from "./pages/teacher/settings";
import Profile from "./pages/student/profile";
import AccountManagement from "./pages/admin/account_management";
import ComprehensionTest from "./pages/admin/comprehension_test";
import ReadingLists from "./pages/teacher/reading_lists";
import Classes from "./pages/teacher/classes";
import Performance from "./pages/teacher/performance";
import Assignments from "./pages/teacher/assignments";
import SettingsTeacher from "./pages/teacher/settings";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Login Page */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        
        <Route path="/login" element={<Login />} />

        {/* Dashboard (after login) */}
        {/* Routes for Admin */}
        <Route path="/pages/admin/account_management" element={<AccountManagement />} />
        <Route path="/pages/admin/comprehension_test" element={<ComprehensionTest />} />


        {/* Routes for Student  */}
        <Route path="/pages/student/dashboard" element={<Dashboard />} />
        <Route path="/pages/student/lessons" element={<Lessons />} />
        <Route path="/pages/student/scores" element={<Scores />} />
        <Route path="/pages/student/progress" element={<Progress />} />
        <Route path="/pages/student/profile" element={<Profile />} />
        <Route path="/pages/student/settings" element={<Settings />} />



        {/* Routes for Teacher */}
        <Route path="/pages/teacher/reading_lists" element={<ReadingLists />} />
        <Route path="/pages/teacher/classes" element={<Classes />} />
        <Route path="/pages/teacher/performance" element={<Performance />} />
        <Route path="/pages/teacher/assignments" element={<Assignments />} />
        <Route path="/pages/teacher/settings" element={<SettingsTeacher />} />
       
      </Routes>
    </BrowserRouter>
  );
}

export default App;
