"use client";

import { useState } from "react";

import AppHeader from "@/components/layout/app-header";
import AdminSidebar from "@/components/layout/admin-sidebar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Sidebar Admin */}
      <AdminSidebar open={open} onClose={() => setOpen(false)} />

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
