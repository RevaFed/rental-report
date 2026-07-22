"use client";

import { useEffect, useMemo, useState } from "react";

import Link from "next/link";
import { Eye, Trash2, Search } from "lucide-react";

import { deleteReport } from "@/lib/actions/report";

type Item = {
  tanggal: string;
  total: number;
};

type Props = {
  data: Item[];
};

function formatTanggal(tanggal: string) {
  return new Date(tanggal).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function RiwayatTable({ data }: Props) {
  const [search, setSearch] = useState("");

  const pageSize = 10;

  const [currentPage, setCurrentPage] = useState(1);

  const filtered = useMemo(() => {
    return data.filter((item) => formatTanggal(item.tanggal).toLowerCase().includes(search.toLowerCase()));
  }, [data, search]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));

  const paginatedData = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <>
      {/* Search */}

      <div className="mb-5 flex max-w-sm items-center rounded-lg border bg-white px-3 shadow-sm">
        <Search size={18} className="text-gray-400" />

        <input type="text" placeholder="Cari tanggal..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full border-0 p-3 outline-none" />
      </div>

      <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-[700px] w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="w-16 p-4 text-center">No</th>

                <th className="p-4 text-left font-semibold">Tanggal</th>

                <th className="w-40 p-4 text-center font-semibold">Total Mesin</th>

                <th className="w-48 p-4 text-center font-semibold">Aksi</th>
              </tr>
            </thead>

            <tbody>
              {paginatedData.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-12 text-center text-gray-400">
                    Belum ada riwayat report.
                  </td>
                </tr>
              )}

              {paginatedData.map((item, index) => (
                <tr key={item.tanggal} className="border-t transition hover:bg-gray-50">
                  <td className="p-4 text-center">{(currentPage - 1) * pageSize + index + 1}</td>

                  <td className="whitespace-nowrap p-4 font-medium">{formatTanggal(item.tanggal)}</td>

                  <td className="p-4 text-center">
                    <span className="rounded-lg bg-blue-100 px-3 py-1 text-sm font-semibold text-blue-700">{item.total}</span>
                  </td>

                  <td className="p-4">
                    <div className="flex justify-center gap-2">
                      <Link href={`/report?tanggal=${item.tanggal}`} className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm text-white transition hover:bg-blue-700">
                        <Eye size={16} />
                        Lihat
                      </Link>

                      <form action={deleteReport}>
                        <input type="hidden" name="tanggal" value={item.tanggal} />

                        <button
                          type="submit"
                          className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm text-white transition hover:bg-red-700"
                          onClick={(e) => {
                            if (!confirm("Yakin ingin menghapus seluruh report tanggal ini?")) {
                              e.preventDefault();
                            }
                          }}
                        >
                          <Trash2 size={16} />
                          Hapus
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}

        <div className="flex items-center justify-between border-t bg-gray-50 px-4 py-3">
          <button onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))} disabled={currentPage === 1} className="rounded-lg border px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50">
            ← Sebelumnya
          </button>

          <div className="text-sm text-gray-600">
            Halaman <span className="font-semibold">{currentPage}</span> dari <span className="font-semibold">{totalPages}</span>
          </div>

          <button onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages} className="rounded-lg border px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50">
            Selanjutnya →
          </button>
        </div>
      </div>
    </>
  );
}
