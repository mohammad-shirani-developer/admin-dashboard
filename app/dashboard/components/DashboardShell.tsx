"use client";
import React, { useState } from "react";
import type { SessionUser } from "@/app/lib/session";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

type DashboardShellProps = {
  children: React.ReactNode;
  user: SessionUser | null;
};

const DashboardShell = ({ children, user }: DashboardShellProps) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  return (
    <div className="flex min-h-screen">
      <Sidebar
        isOpen={isSidebarOpen}
        onNavigate={() => setIsSidebarOpen(false)}
      />
      <main className="min-w-0 flex-1 lg:ml-60">
        <Navbar
          onMenuClick={() => setIsSidebarOpen((prev) => !prev)}
          user={user}
        />
        {children}
      </main>
    </div>
  );
};

export default DashboardShell;
