"use client";

import { useMemo, useState } from "react";
import { CalendarDays, ChevronLeft, ChevronRight, FileText, Search, Users } from "lucide-react";
import type { AdminReportItem, AdminRiwayatItem, AdminTeknisi } from "@/lib/actions/admin-riwayat";

type Props = {
  riwayat: AdminRiwayatItem[];
  reports: AdminReportItem[];
  technicians: AdminTeknisi[];
};

const PAGE_SIZE = 10;

function formatDate(value: string) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(`${value}T00:00:00`));
}

export default function AdminRiwayatPage({ riwayat, reports, technicians }: Props) {
  const [search, setSearch] = useState("");
  const [date, setDate] = useState("");
  const [technician, setTechnician] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const filteredReports = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return reports.filter((item) => {
      const matchesSearch =
        !keyword ||
        item.customer?.nama?.toLowerCase().includes(keyword) ||
        item.teknisi?.nama?.toLowerCase().includes(keyword) ||
        item.teknisi?.username?.toLowerCase().includes(keyword) ||
        item.mesin?.nomor_seri?.toLowerCase().includes(keyword) ||
        item.mesin?.tipe_mesin?.toLowerCase().includes(keyword) ||
        item.jenis?.toLowerCase().includes(keyword) ||
        item.masalah?.toLowerCase().includes(keyword);

      const matchesDate = !date || item.tanggal === date;

      const matchesTechnician = !technician || String(item.teknisi?.username ?? "") === technician;

      return matchesSearch && matchesDate && matchesTechnician;
    });
  }, [reports, search, date, technician]);

  const totalPages = Math.max(1, Math.ceil(filteredReports.length / PAGE_SIZE));

  const safePage = Math.min(currentPage, totalPages);

  const paginatedReports = filteredReports.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const totalReports = reports.length;
  const totalDates = riwayat.length;
  const totalTechnicians = technicians.length;

  const resetFilters = () => {
    setSearch("");
    setDate("");
    setTechnician("");
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Riwayat Report</h1>
        <p className="mt-1 text-sm text-gray-500">Semua laporan yang dibuat oleh teknisi.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Report</p>
              <p className="mt-1 text-2xl font-bold">{totalReports}</p>
            </div>
            <div className="rounded-xl bg-gray-100 p-3">
              <FileText className="h-5 w-5" />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Hari Ada Report</p>
              <p className="mt-1 text-2xl font-bold">{totalDates}</p>
            </div>
            <div className="rounded-xl bg-gray-100 p-3">
              <CalendarDays className="h-5 w-5" />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Teknisi</p>
              <p className="mt-1 text-2xl font-bold">{totalTechnicians}</p>
            </div>
            <div className="rounded-xl bg-gray-100 p-3">
              <Users className="h-5 w-5" />
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border bg-white p-4 shadow-sm">
        <div className="grid gap-3 lg:grid-cols-[1fr_190px_220px_auto]">
          <div className="flex items-center gap-2 rounded-xl border px-3">
            <Search className="h-4 w-4 shrink-0 text-gray-400" />
            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Cari customer, teknisi, mesin, jenis..."
              className="w-full bg-transparent py-2.5 text-sm outline-none"
            />
          </div>

          <input
            type="date"
            value={date}
            onChange={(e) => {
              setDate(e.target.value);
              setCurrentPage(1);
            }}
            className="rounded-xl border px-3 py-2.5 text-sm outline-none"
          />

          <select
            value={technician}
            onChange={(e) => {
              setTechnician(e.target.value);
              setCurrentPage(1);
            }}
            className="rounded-xl border bg-white px-3 py-2.5 text-sm outline-none"
          >
            <option value="">Semua Teknisi</option>
            {technicians.map((item) => (
              <option key={item.id} value={item.username}>
                {item.nama}
              </option>
            ))}
          </select>

          <button type="button" onClick={resetFilters} className="rounded-xl border px-4 py-2.5 text-sm font-medium hover:bg-gray-50">
            Reset
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-[1050px] w-full">
            <thead className="bg-gray-50">
              <tr className="border-b text-left text-sm">
                <th className="w-14 px-4 py-3 text-center">No</th>
                <th className="px-4 py-3">Tanggal</th>
                <th className="px-4 py-3">Teknisi</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Mesin</th>
                <th className="px-4 py-3">Jenis</th>
                <th className="px-4 py-3">Jam</th>
              </tr>
            </thead>

            <tbody>
              {paginatedReports.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-sm text-gray-400">
                    Tidak ada report yang sesuai.
                  </td>
                </tr>
              ) : (
                paginatedReports.map((item, index) => (
                  <tr key={String(item.id)} className="border-b last:border-0 hover:bg-gray-50">
                    <td className="px-4 py-3 text-center text-sm text-gray-500">{(safePage - 1) * PAGE_SIZE + index + 1}</td>

                    <td className="whitespace-nowrap px-4 py-3 text-sm font-medium">{formatDate(item.tanggal)}</td>

                    <td className="px-4 py-3">
                      <div className="text-sm font-medium">{item.teknisi?.nama ?? "-"}</div>
                      <div className="text-xs text-gray-500">@{item.teknisi?.username ?? "-"}</div>
                    </td>

                    <td className="px-4 py-3 text-sm">{item.customer?.nama ?? "-"}</td>

                    <td className="px-4 py-3">
                      <div className="text-sm">{item.mesin?.tipe_mesin ?? "-"}</div>
                      <div className="font-mono text-xs text-gray-500">{item.mesin?.nomor_seri ?? "-"}</div>
                    </td>

                    <td className="px-4 py-3 text-sm">{item.jenis}</td>

                    <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600">
                      {item.jam_masuk ?? "-"}
                      {item.jam_keluar ? ` - ${item.jam_keluar}` : ""}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col gap-3 border-t bg-gray-50 px-4 py-3 text-sm sm:flex-row sm:items-center sm:justify-between">
          <span className="text-gray-500">
            Menampilkan {filteredReports.length === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1} - {Math.min(safePage * PAGE_SIZE, filteredReports.length)} dari {filteredReports.length} report
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setCurrentPage((page) => Math.max(page - 1, 1))}
              disabled={safePage === 1}
              className="inline-flex items-center gap-1 rounded-lg border bg-white px-3 py-2 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronLeft className="h-4 w-4" />
              Sebelumnya
            </button>

            <span className="px-2 text-gray-600">
              {safePage} / {totalPages}
            </span>

            <button
              type="button"
              onClick={() => setCurrentPage((page) => Math.min(page + 1, totalPages))}
              disabled={safePage === totalPages}
              className="inline-flex items-center gap-1 rounded-lg border bg-white px-3 py-2 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Selanjutnya
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
