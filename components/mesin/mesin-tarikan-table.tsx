"use client";

import { useMemo, useState } from "react";

type MesinTarikan = {
  id: string;
  customer_id: string;
  tipe_mesin: string;
  nomor_seri: string;
  status: string;
  alasan_penarikan: string | null;
  ditarik_at: string | null;
  customer: {
    id: string;
    nama: string;
    alamat: string;
  } | null;
};

type Props = {
  data: MesinTarikan[];
};

const ITEMS_PER_PAGE = 10;

function formatTanggal(value: string | null) {
  if (!value) return "-";

  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export default function MesinTarikanTable({ data }: Props) {
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const filteredData = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) {
      return data;
    }

    return data.filter((item) => {
      const customer = item.customer?.nama ?? "";
      const tipeMesin = item.tipe_mesin ?? "";
      const nomorSeri = item.nomor_seri ?? "";
      const alasan = item.alasan_penarikan ?? "";

      return customer.toLowerCase().includes(keyword) || tipeMesin.toLowerCase().includes(keyword) || nomorSeri.toLowerCase().includes(keyword) || alasan.toLowerCase().includes(keyword);
    });
  }, [data, search]);

  const totalPages = Math.max(1, Math.ceil(filteredData.length / ITEMS_PER_PAGE));

  const safeCurrentPage = Math.min(currentPage, totalPages);

  const startIndex = (safeCurrentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;

  const paginatedData = filteredData.slice(startIndex, endIndex);

  function handleSearch(value: string) {
    setSearch(value);
    setCurrentPage(1);
  }

  function goToPage(page: number) {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  }

  const displayStart = filteredData.length === 0 ? 0 : startIndex + 1;

  const displayEnd = Math.min(endIndex, filteredData.length);

  return (
    <div className="space-y-4">
      {/* SEARCH */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-md">
          <input
            type="text"
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Cari customer, tipe mesin, nomor seri..."
            className="w-full rounded-lg border bg-white px-4 py-2.5 pr-10 text-sm outline-none transition focus:border-gray-400 focus:ring-2 focus:ring-gray-200"
          />

          {search && (
            <button type="button" onClick={() => handleSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 transition hover:text-gray-700" title="Hapus pencarian">
              ×
            </button>
          )}
        </div>

        <div className="text-sm text-gray-500">{search ? `${filteredData.length} hasil ditemukan` : `${data.length} mesin ditarik`}</div>
      </div>

      {/* TABLE */}
      <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-[1000px] w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="w-16 p-3 text-center">No</th>

                <th className="p-3 text-left">Customer</th>

                <th className="p-3 text-left">Tipe Mesin</th>

                <th className="p-3 text-left">Nomor Seri</th>

                <th className="p-3 text-left">Alasan Penarikan</th>

                <th className="p-3 text-left">Tanggal Penarikan</th>
              </tr>
            </thead>

            <tbody>
              {paginatedData.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-10 text-center text-gray-400">
                    {search ? "Mesin tarikan tidak ditemukan." : "Belum ada mesin yang ditarik."}
                  </td>
                </tr>
              )}

              {paginatedData.map((item, index) => (
                <tr key={item.id} className="border-t transition hover:bg-gray-50">
                  <td className="p-3 text-center">{startIndex + index + 1}</td>

                  <td className="p-3 font-medium">{item.customer?.nama ?? "-"}</td>

                  <td className="whitespace-nowrap p-3">{item.tipe_mesin}</td>

                  <td className="whitespace-nowrap p-3 font-mono text-sm">{item.nomor_seri}</td>

                  <td className="max-w-[360px] p-3">{item.alasan_penarikan ?? "-"}</td>

                  <td className="whitespace-nowrap p-3">{formatTanggal(item.ditarik_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}
        {filteredData.length > 0 && (
          <div className="flex flex-col gap-3 border-t bg-gray-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm text-gray-500">
              Menampilkan <span className="font-medium text-gray-700">{displayStart}</span>
              {" - "}
              <span className="font-medium text-gray-700">{displayEnd}</span>
              {" dari "}
              <span className="font-medium text-gray-700">{filteredData.length}</span>
              {" data"}
            </div>

            <div className="flex items-center gap-1">
              {/* PREVIOUS */}
              <button
                type="button"
                onClick={() => goToPage(safeCurrentPage - 1)}
                disabled={safeCurrentPage === 1}
                className="rounded-lg border bg-white px-3 py-2 text-sm font-medium transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
              >
                ←
              </button>

              {/* PAGE NUMBERS */}
              {Array.from({ length: totalPages }, (_, index) => index + 1)
                .filter((page) => {
                  if (totalPages <= 5) return true;

                  if (page === 1 || page === totalPages) {
                    return true;
                  }

                  return page >= safeCurrentPage - 1 && page <= safeCurrentPage + 1;
                })
                .map((page, index, pages) => {
                  const previousPage = pages[index - 1];

                  const showEllipsis = previousPage !== undefined && page - previousPage > 1;

                  return (
                    <div key={page} className="flex items-center gap-1">
                      {showEllipsis && <span className="px-1 text-gray-400">...</span>}

                      <button
                        type="button"
                        onClick={() => goToPage(page)}
                        className={`min-w-9 rounded-lg border px-3 py-2 text-sm font-medium transition ${safeCurrentPage === page ? "border-gray-900 bg-gray-900 text-white" : "bg-white text-gray-700 hover:bg-gray-100"}`}
                      >
                        {page}
                      </button>
                    </div>
                  );
                })}

              {/* NEXT */}
              <button
                type="button"
                onClick={() => goToPage(safeCurrentPage + 1)}
                disabled={safeCurrentPage === totalPages}
                className="rounded-lg border bg-white px-3 py-2 text-sm font-medium transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
              >
                →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
