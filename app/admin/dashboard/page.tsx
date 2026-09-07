import { Users, Building2, Printer, FileText, CalendarCheck, ClipboardList, UserCheck, Activity } from "lucide-react";

import { getAdminDashboardData } from "@/lib/actions/admin-dashboard";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const data = await getAdminDashboardData();

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard Admin</h1>

        <p className="mt-1 text-sm text-gray-500">Monitoring dan pengelolaan aktivitas sistem rental</p>
      </div>

      {/* STATISTICS */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Total Teknisi" value={data.stats.totalTeknisi} icon={Users} color="blue" />

        <StatCard title="Total Customer" value={data.stats.totalCustomer} icon={Building2} color="green" />

        <StatCard title="Total Mesin" value={data.stats.totalMesin} icon={Printer} color="orange" />

        <StatCard title="Total Report" value={data.stats.totalReport} icon={FileText} color="purple" />
      </div>

      {/* REPORT STATISTICS */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Report Hari Ini" value={data.stats.reportHariIni} icon={CalendarCheck} color="red" />

        <StatCard title="Report Bulan Ini" value={data.stats.reportBulanIni} icon={ClipboardList} color="blue" />

        <StatCard title="Teknisi Aktif" value={data.stats.teknisiAktif} icon={UserCheck} color="green" />

        <StatCard title="Aktivitas Terbaru" value={data.reports.length} icon={Activity} color="orange" />
      </div>

      {/* TEKNISI */}
      <section className="rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-100 px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50">
              <Users className="h-5 w-5 text-blue-600" />
            </div>

            <div>
              <h2 className="text-lg font-semibold">Daftar Teknisi</h2>

              <p className="text-sm text-gray-500">Teknisi yang terdaftar di sistem</p>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50 text-left">
                <th className="px-6 py-4 font-semibold">Nama</th>

                <th className="px-6 py-4 font-semibold">Username</th>

                <th className="px-6 py-4 font-semibold">Status</th>

                <th className="px-6 py-4 font-semibold">Role</th>
              </tr>
            </thead>

            <tbody>
              {data.teknisi
                .filter((user) => user.role === "teknisi")
                .map((user) => (
                  <tr key={user.id} className="border-b last:border-0 hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-sm font-semibold">{user.nama?.charAt(0)?.toUpperCase() ?? "T"}</div>

                        <span className="font-medium">{user.nama}</span>
                      </div>
                    </td>

                    <td className="px-6 py-4 text-gray-500">{user.username}</td>

                    <td className="px-6 py-4">
                      <span className={user.is_active ? "inline-flex rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700" : "inline-flex rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-700"}>
                        {user.is_active ? "Aktif" : "Nonaktif"}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <span className="inline-flex rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700">Teknisi</span>
                    </td>
                  </tr>
                ))}

              {data.teknisi.filter((user) => user.role === "teknisi").length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-10 text-center text-gray-500">
                    Belum ada teknisi.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* REPORT TERBARU */}
      <section className="rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-100 px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50">
              <FileText className="h-5 w-5 text-orange-600" />
            </div>

            <div>
              <h2 className="text-lg font-semibold">Report Terbaru</h2>

              <p className="text-sm text-gray-500">Aktivitas laporan terbaru seluruh teknisi</p>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50 text-left">
                <th className="px-6 py-4 font-semibold">Tanggal</th>

                <th className="px-6 py-4 font-semibold">Teknisi</th>

                <th className="px-6 py-4 font-semibold">Customer</th>

                <th className="px-6 py-4 font-semibold">Mesin</th>

                <th className="px-6 py-4 font-semibold">Jenis</th>

                <th className="px-6 py-4 font-semibold">Masalah</th>
              </tr>
            </thead>

            <tbody>
              {data.reports.map((report: any) => (
                <tr key={report.id} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="whitespace-nowrap px-6 py-4">{report.tanggal ?? "-"}</td>

                  <td className="px-6 py-4 font-medium">{report.users?.nama ?? "-"}</td>

                  <td className="px-6 py-4">{report.customer?.nama ?? "-"}</td>

                  <td className="px-6 py-4 text-gray-500">{report.mesin?.nomor_seri ?? "-"}</td>

                  <td className="px-6 py-4">
                    <ReportBadge jenis={report.jenis} />
                  </td>

                  <td className="max-w-[300px] truncate px-6 py-4 text-gray-600">{report.masalah ?? "-"}</td>
                </tr>
              ))}

              {data.reports.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-gray-500">
                    Belum ada report.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

/* =========================================================
   STAT CARD
========================================================= */

function StatCard({ title, value, icon: Icon, color }: { title: string; value: number; icon: any; color: "blue" | "green" | "orange" | "purple" | "red" }) {
  const styles = {
    blue: {
      border: "border-blue-200",
      icon: "bg-blue-50 text-blue-600",
    },

    green: {
      border: "border-green-200",
      icon: "bg-green-50 text-green-600",
    },

    orange: {
      border: "border-orange-200",
      icon: "bg-orange-50 text-orange-600",
    },

    purple: {
      border: "border-purple-200",
      icon: "bg-purple-50 text-purple-600",
    },

    red: {
      border: "border-red-200",
      icon: "bg-red-50 text-red-600",
    },
  };

  const style = styles[color];

  return (
    <div className={`rounded-2xl border ${style.border} bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-gray-500">{title}</p>

          <p className="mt-3 text-3xl font-bold tracking-tight">{value}</p>
        </div>

        <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${style.icon}`}>
          <Icon size={21} />
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   REPORT BADGE
========================================================= */

function ReportBadge({ jenis }: { jenis?: string }) {
  const value = jenis ?? "-";

  const styles: Record<string, string> = {
    PM: "bg-green-100 text-green-700",
    CR: "bg-blue-100 text-blue-700",
    FU: "bg-orange-100 text-orange-700",
    OTH: "bg-red-100 text-red-700",
  };

  return <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${styles[value] ?? "bg-gray-100 text-gray-700"}`}>{value}</span>;
}
