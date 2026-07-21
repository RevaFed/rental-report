"use client";

import { useState } from "react";

import AppHeader from "@/components/layout/app-header";
import AppSidebar from "@/components/layout/app-sidebar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Sidebar */}
      <AppSidebar open={open} onClose={() => setOpen(false)} />

      {/* Content */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Header */}
        <AppHeader onMenu={() => setOpen(true)} />

        {/* Main */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
