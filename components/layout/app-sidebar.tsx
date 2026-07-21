"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Building2, Printer, FileText, User, X, LogOut } from "lucide-react";
import { logout } from "@/lib/auth/logout";
type Props = {
  open: boolean;
  onClose: () => void;
};

const menus = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Customer",
    href: "/customer",
    icon: Building2,
  },
  {
    title: "Mesin",
    href: "/mesin",
    icon: Printer,
  },
  {
    title: "Report Harian",
    href: "/report",
    icon: FileText,
  },
  {
    title: "Riwayat Report",
    href: "/riwayat",
    icon: FileText,
  },
  {
    title: "Profil",
    href: "/profile",
    icon: User,
  },
];

export default function AppSidebar({ open, onClose }: Props) {
  const pathname = usePathname();

  return (
    <>
      {/* Overlay */}

      {open && <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden" onClick={onClose} />}

      {/* Sidebar */}

      <aside
        className={`
fixed left-0 top-0 z-50
flex h-screen w-[280px] flex-col
border-r border-gray-200
bg-white
shadow-2xl
transition-all duration-300 ease-in-out

${open ? "translate-x-0" : "-translate-x-full"}

lg:static
lg:translate-x-0
lg:shadow-none
`}
      >
        {/* Header */}

        <div className="border-b px-6 py-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Rental Report</h1>

              <p className="mt-1 text-sm text-gray-500">Management System</p>
            </div>

            <button onClick={onClose} className="rounded-lg p-2 transition hover:bg-gray-100 lg:hidden">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* MENU */}

        <nav className="flex-1 space-y-2 p-4">
          {menus.map((menu) => {
            const Icon = menu.icon;

            const active = pathname === menu.href;

            return (
              <Link
                key={menu.href}
                href={menu.href}
                onClick={onClose}
                className={`
group
flex items-center gap-3
rounded-xl
border-l-4
px-4
py-3
transition-all duration-200

${active ? "border-black bg-black text-white shadow-lg" : "border-transparent text-gray-700 hover:translate-x-1 hover:bg-gray-100"}
`}
              >
                <Icon size={20} className="shrink-0" />

                <span className="font-medium">{menu.title}</span>
              </Link>
            );
          })}
        </nav>
        {/* FOOTER */}

        <div className="border-t bg-gray-50 p-5">
          <div className="mb-4">
            <p className="text-sm font-semibold">Administrator</p>

            <p className="text-xs text-gray-500">Rental Report v1.0</p>
          </div>

          <form action={logout}>
            <button type="submit" className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-red-700">
              <LogOut size={18} />
              Logout
            </button>
          </form>
        </div>
      </aside>
    </>
  );
}
