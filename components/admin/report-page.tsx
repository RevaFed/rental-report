"use client";

import { useMemo, useState } from "react";
import { CalendarDays, ChevronLeft, ChevronRight, Eye, FileText, Search, Trash2, X } from "lucide-react";
import { deleteAdminReport, AdminReport } from "@/lib/actions/admin-report";

const PAGE_SIZES = [10, 25, 50, 100];
const REPORT_TYPES = ["PM", "CR", "FU", "OTH"];

export default function AdminReportPage({ initialReports }: { initialReports: AdminReport[] }) {
  const [reports, setReports] = useState(initialReports);
  const [search, setSearch] = useState("");
  const [date, setDate] = useState("");
  const [technician, setTechnician] = useState("all");
  const [type, setType] = useState("all");
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [selected, setSelected] = useState<AdminReport | null>(null);

  const technicians = useMemo(() => {
    const map = new Map<number, { id: number; nama: string; username: string }>();
    reports.forEach((report) => {
      if (report.teknisi) map.set(report.teknisi.id, report.teknisi);
    });
    return Array.from(map.values()).sort((a, b) => a.nama.localeCompare(b.nama));
  }, [reports]);

  const filtered = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return reports.filter((report) => {
      if (date && report.tanggal !== date) return false;
      if (technician !== "all" && String(report.created_by ?? "") !== technician) return false;
      if (type !== "all" && report.jenis !== type) return false;

      if (!keyword) return true;

      const customer = report.is_backup ? `${report.customer_backup ?? ""} ${report.alamat_backup ?? ""}` : `${report.customer?.nama ?? ""} ${report.customer?.alamat ?? ""}`;
      const machine = report.is_backup ? `${report.tipe_mesin_backup ?? ""} ${report.nomor_seri_backup ?? ""}` : `${report.mesin?.tipe_mesin ?? ""} ${report.mesin?.nomor_seri ?? ""}`;
      const tech = `${report.teknisi?.nama ?? ""} ${report.teknisi?.username ?? ""}`;

      return `${report.tanggal} ${report.jenis} ${customer} ${machine} ${tech} ${report.masalah ?? ""} ${report.keterangan ?? ""}`.toLowerCase().includes(keyword);
    });
  }, [reports, search, date, technician, type]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const start = (safePage - 1) * pageSize;
  const visible = filtered.slice(start, start + pageSize);

  function resetPage() {
    setCurrentPage(1);
  }

  async function handleDelete(id: string) {
    if (!confirm("Hapus report ini? Data yang dihapus tidak dapat dikembalikan.")) return;

    const formData = new FormData();
    formData.set("id", id);
    const result = await deleteAdminReport(formData);

    if (!result.success) {
      alert(result.error ?? "Gagal menghapus report.");
      return;
    }

    setReports((prev) => prev.filter((report) => report.id !== id));
    setSelected((prev) => (prev?.id === id ? null : prev));
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Semua Report</h1>
        <p className="mt-1 text-sm text-gray-500">Kelola seluruh report harian dari semua teknisi.</p>
      </div>

      <div className="grid gap-3 rounded-xl border bg-white p-4 shadow-sm lg:grid-cols-[minmax(260px,1fr)_180px_220px_150px_100px]">
        <div className="relative">
          <Search size={18} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              resetPage();
            }}
            placeholder="Cari customer, teknisi, mesin, masalah..."
            className="w-full rounded-lg border py-2.5 pl-10 pr-3 text-sm outline-none focus:border-black"
          />
        </div>

        <div className="relative">
          <CalendarDays size={17} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="date"
            value={date}
            onChange={(e) => {
              setDate(e.target.value);
              resetPage();
            }}
            className="w-full rounded-lg border py-2.5 pl-10 pr-3 text-sm outline-none focus:border-black"
          />
        </div>

        <select
          value={technician}
          onChange={(e) => {
            setTechnician(e.target.value);
            resetPage();
          }}
          className="rounded-lg border px-3 py-2.5 text-sm outline-none focus:border-black"
        >
          <option value="all">Semua Teknisi</option>
          {technicians.map((item) => (
            <option key={item.id} value={item.id}>
              {item.nama}
            </option>
          ))}
        </select>

        <select
          value={type}
          onChange={(e) => {
            setType(e.target.value);
            resetPage();
          }}
          className="rounded-lg border px-3 py-2.5 text-sm outline-none focus:border-black"
        >
          <option value="all">Semua Jenis</option>
          {REPORT_TYPES.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>

        <select
          value={pageSize}
          onChange={(e) => {
            setPageSize(Number(e.target.value));
            resetPage();
          }}
          className="rounded-lg border px-3 py-2.5 text-sm outline-none focus:border-black"
        >
          {PAGE_SIZES.map((size) => (
            <option key={size} value={size}>
              {size} / halaman
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-white px-4 py-3 shadow-sm">
        <div className="text-sm text-gray-500">
          Menampilkan {filtered.length ? start + 1 : 0}–{Math.min(start + pageSize, filtered.length)} dari {filtered.length} report
        </div>
        <div className="flex items-center gap-2">
          <button disabled={safePage <= 1} onClick={() => setCurrentPage((page) => Math.max(1, page - 1))} className="inline-flex h-9 w-9 items-center justify-center rounded-lg border disabled:cursor-not-allowed disabled:opacity-40">
            <ChevronLeft size={17} />
          </button>
          <span className="min-w-24 text-center text-sm">
            Halaman {safePage} / {totalPages}
          </span>
          <button
            disabled={safePage >= totalPages}
            onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronRight size={17} />
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-[1450px] w-full border-collapse">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-3 text-center">No</th>
                <th className="p-3 text-left">Tanggal</th>
                <th className="min-w-[170px] p-3 text-left">Teknisi</th>
                <th className="min-w-[200px] p-3 text-left">Customer</th>
                <th className="min-w-[160px] p-3 text-left">Mesin</th>
                <th className="p-3 text-center">Jenis</th>
                <th className="p-3 text-center">Jam In</th>
                <th className="p-3 text-center">Jam Out</th>
                <th className="min-w-[260px] p-3 text-left">Masalah</th>
                <th className="p-3 text-center">Ket</th>
                <th className="p-3 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {visible.length === 0 ? (
                <tr>
                  <td colSpan={11} className="p-10 text-center text-sm text-gray-500">
                    Tidak ada report yang cocok dengan filter.
                  </td>
                </tr>
              ) : (
                visible.map((report, index) => {
                  const customer = report.is_backup ? report.customer_backup : report.customer?.nama;
                  const machine = report.is_backup ? `${report.tipe_mesin_backup ?? ""} · ${report.nomor_seri_backup ?? ""}` : `${report.mesin?.tipe_mesin ?? ""} · ${report.mesin?.nomor_seri ?? ""}`;
                  return (
                    <tr key={report.id} className="border-t hover:bg-gray-50">
                      <td className="p-3 text-center text-sm text-gray-500">{start + index + 1}</td>
                      <td className="p-3 text-sm whitespace-nowrap">{report.tanggal}</td>
                      <td className="p-3">
                        <div className="font-medium">{report.teknisi?.nama ?? "Tidak diketahui"}</div>
                        <div className="text-xs text-gray-500">{report.teknisi?.wilayah ?? "-"}</div>
                      </td>
                      <td className="p-3">
                        <div className="font-medium">{customer ?? "-"}</div>
                        {report.is_backup && <span className="text-xs text-amber-600">Backup</span>}
                      </td>
                      <td className="p-3 text-sm">
                        <div>{machine || "-"}</div>
                      </td>
                      <td className="p-3 text-center">
                        <span className="rounded-md border px-2 py-1 text-xs font-semibold">{report.jenis}</span>
                      </td>
                      <td className="p-3 text-center text-sm">{report.jam_masuk ?? "-"}</td>
                      <td className="p-3 text-center text-sm">{report.jam_keluar ?? "-"}</td>
                      <td className="max-w-[300px] p-3 text-sm">{report.masalah || "-"}</td>
                      <td className="p-3 text-center text-sm">{report.keterangan || "-"}</td>
                      <td className="p-3">
                        <div className="flex justify-center gap-1">
                          <button onClick={() => setSelected(report)} title="Detail" className="inline-flex h-8 w-8 items-center justify-center rounded-md text-blue-600 hover:bg-blue-50">
                            <Eye size={16} />
                          </button>
                          <button onClick={() => handleDelete(report.id)} title="Hapus" className="inline-flex h-8 w-8 items-center justify-center rounded-md text-red-500 hover:bg-red-50">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selected && <ReportDetail report={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}

function ReportDetail({ report, onClose }: { report: AdminReport; onClose: () => void }) {
  const customer = report.is_backup ? report.customer_backup : report.customer?.nama;
  const address = report.is_backup ? report.alamat_backup : report.customer?.alamat;
  const type = report.is_backup ? report.tipe_mesin_backup : report.mesin?.tipe_mesin;
  const serial = report.is_backup ? report.nomor_seri_backup : report.mesin?.nomor_seri;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onMouseDown={onClose}>
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl" onMouseDown={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between border-b p-5">
          <div>
            <div className="flex items-center gap-2">
              <FileText size={20} />
              <h2 className="text-xl font-bold">Detail Report</h2>
            </div>
            <p className="mt-1 text-sm text-gray-500">
              {report.tanggal} · {report.jenis}
            </p>
          </div>
          <button onClick={onClose} className="rounded-lg p-2 hover:bg-gray-100">
            <X size={20} />
          </button>
        </div>
        <div className="grid gap-4 p-5 sm:grid-cols-2">
          <Detail label="Teknisi" value={report.teknisi?.nama ?? "Tidak diketahui"} />
          <Detail label="Wilayah" value={report.teknisi?.wilayah ?? "-"} />
          <Detail label="Customer" value={customer ?? "-"} />
          <Detail label="Alamat" value={address ?? "-"} />
          <Detail label="Tipe Mesin" value={type ?? "-"} />
          <Detail label="Nomor Seri" value={serial ?? "-"} />
          <Detail label="Jam Masuk" value={report.jam_masuk ?? "-"} />
          <Detail label="Jam Keluar" value={report.jam_keluar ?? "-"} />
          <div className="sm:col-span-2">
            <Detail label="Masalah" value={report.masalah ?? "-"} />
          </div>
          <div className="sm:col-span-2">
            <Detail label="Keterangan" value={report.keterangan ?? "-"} />
          </div>
          <div className="sm:col-span-2">
            <Detail label="Note" value={report.note ?? "-"} />
          </div>
        </div>
      </div>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border bg-gray-50 p-3">
      <div className="text-xs font-medium text-gray-500">{label}</div>
      <div className="mt-1 whitespace-pre-wrap text-sm font-medium">{value}</div>
    </div>
  );
}
