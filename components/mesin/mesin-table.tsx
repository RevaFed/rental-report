"use client";

import { useMemo, useState, useEffect } from "react";

import MesinSearch from "./mesin-search";
import MesinAction from "./mesin-action";
import MesinEditDialog from "./mesin-edit-dialog";
import MesinDeleteDialog from "./mesin-delete-dialog";

import type { Mesin, Customer } from "@/types/mesin";

export default function MesinTable({ data, customers }: { data: Mesin[]; customers: Customer[] }) {
  const [search, setSearch] = useState("");

  const [openEdit, setOpenEdit] = useState(false);

  const [openDelete, setOpenDelete] = useState(false);

  const [selectedMesin, setSelectedMesin] = useState<Mesin | null>(null);

  const pageSize = 10;

  const [currentPage, setCurrentPage] = useState(1);

  const filtered = useMemo(() => {
    return data.filter((item) => {
      return (item.customer?.nama ?? "").toLowerCase().includes(search.toLowerCase()) || item.tipe_mesin.toLowerCase().includes(search.toLowerCase()) || item.nomor_seri.toLowerCase().includes(search.toLowerCase());
    });
  }, [search, data]);

  // Balik ke halaman pertama saat search berubah
  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));

  const paginatedData = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <>
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <MesinSearch value={search} onChange={setSearch} />
      </div>

      <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-[850px] w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="w-16 p-3 text-center">No</th>

                <th className="p-3 text-left">Customer</th>

                <th className="p-3 text-left">Tipe Mesin</th>

                <th className="p-3 text-left">Nomor Seri</th>

                <th className="w-28 p-3 text-center">Action</th>
              </tr>
            </thead>

            <tbody>
              {paginatedData.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-10 text-center text-gray-400">
                    Data mesin kosong
                  </td>
                </tr>
              )}

              {paginatedData.map((item, index) => (
                <tr key={item.id} className="border-t transition hover:bg-gray-50">
                  <td className="p-3 text-center">{(currentPage - 1) * pageSize + index + 1}</td>

                  <td className="whitespace-nowrap p-3 font-medium">{item.customer?.nama ?? "-"}</td>

                  <td className="whitespace-nowrap p-3">{item.tipe_mesin}</td>

                  <td className="whitespace-nowrap p-3 font-mono text-sm">{item.nomor_seri}</td>

                  <td className="p-3">
                    <div className="flex justify-center">
                      <MesinAction
                        onEdit={() => {
                          setSelectedMesin(item);
                          setOpenEdit(true);
                        }}
                        onDelete={() => {
                          setSelectedMesin(item);
                          setOpenDelete(true);
                        }}
                      />
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

      <MesinEditDialog open={openEdit} onOpenChange={setOpenEdit} mesin={selectedMesin} customers={customers} />

      <MesinDeleteDialog open={openDelete} onOpenChange={setOpenDelete} mesin={selectedMesin} />
    </>
  );
}
