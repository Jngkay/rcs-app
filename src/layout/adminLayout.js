import React from "react";
import SideBarAdmin from "../components/sidebar_admin";
import TopBar from "../components/topbar";

export default function AdminLayout({ children }) {
  return (
    <div className="flex min-h-screen bg-gray-100">
       {/* Sidebar  */}
      <SideBarAdmin />

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
