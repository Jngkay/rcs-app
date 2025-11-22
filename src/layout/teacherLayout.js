import React from "react";
import TopBar from "../components/topbar";
import SideBarTeacher from "../components/sidebar_teacher";

export default function TeacherLayout({ children }) {
  return (
    <div className="flex min-h-screen bg-gray-100">
       {/* Sidebar  */}
      <SideBarTeacher />

      {/* Main Section */}
      <div className="flex flex-col flex-1">
        {/* /* Top Navbar */ }
        <TopBar />

        {/* /* Page Content */ }
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
