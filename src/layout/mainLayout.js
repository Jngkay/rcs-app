import React from "react";
import SideBar from "../includes/sidebar";
import TopBar from "../includes/topbar";

export default function MainLayout({ children }) {
  return (
    <div className="flex min-h-screen bg-gray-100">
       {/* Sidebar  */}
      <SideBar />

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
