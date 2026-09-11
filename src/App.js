// // src/App.js
import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./login";
import Dashboard from "./pages/student/dashboard";
import Lessons from "./pages/student/lessons";
import Scores from "./pages/student/scores";
import Progress from "./pages/student/progress";
import Profile from "./pages/student/profile";
import AccountManagement from "./pages/admin/account_management";
import ComprehensionTest from "./pages/admin/comprehension_test";
import Classes from "./pages/teacher/classes";
import Settings from "./pages/student/settings";
import Assessment from "./pages/student/assessment";
import IndividualizedAssessmentAdmin from "./pages/admin/individualized_assessment";
import Student from "./pages/teacher/students";
import TeacherProfile from "./pages/teacher/profile";
import TeacherAnalytics from "./pages/teacher/analytics";

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
        <Route path="/pages/admin/individualized_assessment" element={<IndividualizedAssessmentAdmin />} />



        {/* Routes for Student  */}
        <Route path="/pages/student/dashboard" element={<Dashboard />} />
        <Route path="/pages/student/lessons" element={<Lessons />} />
        <Route path="/pages/student/scores" element={<Scores />} />
        <Route path="/pages/student/progress" element={<Progress />} />
        <Route path="/pages/student/profile" element={<Profile />} />
        <Route path="/pages/student/profile" element={<Settings />} />
        <Route path="/pages/student/assessment" element={<Assessment />} />


        {/* Routes for Teacher */}
        <Route path="/pages/teacher/classes" element={<Classes />} />
        <Route path="/pages/teacher/profile" element={<TeacherProfile />} />
        <Route path="/pages/teacher/students" element={<Student />} />
        <Route path="/pages/teacher/analytics" element={<TeacherAnalytics />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
