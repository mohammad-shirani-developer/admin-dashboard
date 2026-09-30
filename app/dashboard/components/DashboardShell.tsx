"use client";
import React, { useState } from "react";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

const DashboardShell = ({ children }: { children: React.ReactNode }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  return (
    <div className="flex min-h-screen">
      <Sidebar isOpen={isSidebarOpen} />
      <main className=" min-w-0 flex-1 lg:ml-64">
        <Navbar onMenuClick={() => setIsSidebarOpen((prev) => !prev)} />
        {children}
      </main>
    </div>
  );
};

export default DashboardShell;
