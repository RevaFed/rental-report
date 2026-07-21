"use client";

import { Menu } from "lucide-react";

type Props = {
  onMenu: () => void;
};

export default function AppHeader({ onMenu }: Props) {
  const today = new Date().toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <header className="border-b bg-white">
      <div className="flex h-16 items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-3">
          {/* Hamburger */}
          <button onClick={onMenu} className="rounded-lg p-2 hover:bg-gray-100 lg:hidden">
            <Menu size={24} />
          </button>

          <div>
            <h1 className="text-lg font-semibold md:text-xl">Aplikasi Laporan Harian</h1>

            <p className="text-xs text-gray-500 md:text-sm">{today}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
