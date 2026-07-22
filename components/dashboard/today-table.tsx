"use client";

import { useState } from "react";

type Props = {
  data: any[];
};

export default function TodayTable({ data }: Props) {
  const pageSize = 10;

  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(data.length / pageSize));

  const paginatedData = data.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const jenisColor = (jenis: string) => {
    switch (jenis) {
      case "PM":
        return "bg-emerald-100 text-emerald-700";

      case "CR":
        return "bg-sky-100 text-sky-700";

      case "FU":
        return "bg-amber-100 text-amber-700";

      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const ketColor = (ket: string) => {
    switch (ket) {
      case "OK":
        return "bg-green-100 text-green-700";

      case "FU":
        return "bg-blue-100 text-blue-700";

      case "OTH":
        return "bg-orange-100 text-orange-700";

      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  return (
    <div className="rounded-2xl border bg-white shadow-sm">
      <div className="border-b p-5">
        <h2 className="text-lg font-semibold">Report Bulan Ini</h2>

        <p className="mt-1 text-sm text-gray-500">Aktivitas teknisi pada periode yang dipilih</p>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-[1000px] w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="w-14 p-3 text-center">No</th>

              <th className="p-3 text-left">Customer</th>

              <th className="p-3 text-left">Nomor Seri</th>

              <th className="p-3 text-left">Tipe Mesin</th>

              <th className="p-3 text-center">Jenis</th>

              <th className="p-3 text-center">Jam In</th>

              <th className="p-3 text-center">Jam Out</th>

              <th className="p-3 text-center">Ket</th>
            </tr>
          </thead>

          <tbody>
            {paginatedData.length === 0 && (
              <tr>
                <td colSpan={8} className="p-10 text-center text-gray-400">
                  Belum ada report.
                </td>
              </tr>
            )}

            {paginatedData.map((item, index) => (
              <tr key={item.id} className="border-t transition hover:bg-gray-50">
                <td className="p-3 text-center">{(currentPage - 1) * pageSize + index + 1}</td>

                <td className="whitespace-nowrap p-3 font-medium">{item.customer}</td>

                <td className="whitespace-nowrap p-3 font-mono text-sm">{item.nomor_seri}</td>

                <td className="whitespace-nowrap p-3">{item.tipe_mesin}</td>

                <td className="p-3 text-center">
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${jenisColor(item.jenis)}`}>{item.jenis}</span>
                </td>

                <td className="p-3 text-center">{item.jam_masuk || "-"}</td>

                <td className="p-3 text-center">{item.jam_keluar || "-"}</td>

                <td className="p-3 text-center">
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${ketColor(item.keterangan)}`}>{item.keterangan || "-"}</span>
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
  );
}
