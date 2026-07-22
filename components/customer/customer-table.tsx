"use client";

import { useEffect, useMemo, useState } from "react";

import CustomerSearch from "./customer-search";
import CustomerAction from "./customer-action";
import CustomerEditDialog from "./customer-edit-dialog";
import CustomerDeleteDialog from "./customer-delete-dialog";

import type { Customer } from "@/types/database";

export default function CustomerTable({ data }: { data: Customer[] }) {
  const [search, setSearch] = useState("");

  const [openEdit, setOpenEdit] = useState(false);

  const [openDelete, setOpenDelete] = useState(false);

  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  const pageSize = 10;

  const [currentPage, setCurrentPage] = useState(1);

  const filtered = useMemo(() => {
    return data.filter((item) => {
      return item.nama.toLowerCase().includes(search.toLowerCase()) || item.alamat.toLowerCase().includes(search.toLowerCase());
    });
  }, [search, data]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));

  const paginatedData = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <>
      {/* SEARCH */}

      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <CustomerSearch value={search} onChange={setSearch} />
      </div>

      {/* TABLE */}

      <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-[700px] w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="w-16 p-3 text-center">No</th>

                <th className="p-3 text-left">Nama Customer</th>

                <th className="p-3 text-left">Alamat</th>

                <th className="w-28 p-3 text-center">Action</th>
              </tr>
            </thead>

            <tbody>
              {paginatedData.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-10 text-center text-gray-400">
                    Data customer kosong
                  </td>
                </tr>
              )}

              {paginatedData.map((item, index) => (
                <tr key={item.id} className="border-t transition hover:bg-gray-50">
                  <td className="p-3 text-center">{(currentPage - 1) * pageSize + index + 1}</td>

                  <td className="whitespace-nowrap p-3 font-medium">{item.nama}</td>

                  <td className="p-3 text-gray-600">{item.alamat}</td>

                  <td className="p-3">
                    <div className="flex justify-center">
                      <CustomerAction
                        onEdit={() => {
                          setSelectedCustomer(item);
                          setOpenEdit(true);
                        }}
                        onDelete={() => {
                          setSelectedCustomer(item);
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

      <CustomerEditDialog open={openEdit} onOpenChange={setOpenEdit} customer={selectedCustomer} />

      <CustomerDeleteDialog open={openDelete} onOpenChange={setOpenDelete} customer={selectedCustomer} />
    </>
  );
}
