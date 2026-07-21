"use client";

import { useMemo, useState } from "react";

import CustomerSearch from "./customer-search";
import CustomerAction from "./customer-action";
import CustomerEditDialog from "./customer-edit-dialog";
import CustomerDeleteDialog from "./customer-delete-dialog";

type Customer = {
  id: string;
  nama: string;
  alamat: string;
};

export default function CustomerTable({ data }: { data: Customer[] }) {
  const [search, setSearch] = useState("");

  const [openEdit, setOpenEdit] = useState(false);

  const [openDelete, setOpenDelete] = useState(false);

  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  const filtered = useMemo(() => {
    return data.filter((item) => {
      return item.nama.toLowerCase().includes(search.toLowerCase()) || item.alamat.toLowerCase().includes(search.toLowerCase());
    });
  }, [search, data]);

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
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-10 text-center text-gray-400">
                    Data customer kosong
                  </td>
                </tr>
              )}

              {filtered.map((item, index) => (
                <tr key={item.id} className="border-t transition hover:bg-gray-50">
                  <td className="p-3 text-center">{index + 1}</td>

                  <td className="p-3 font-medium whitespace-nowrap">{item.nama}</td>

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
      </div>

      <CustomerEditDialog open={openEdit} onOpenChange={setOpenEdit} customer={selectedCustomer} />

      <CustomerDeleteDialog open={openDelete} onOpenChange={setOpenDelete} customer={selectedCustomer} />
    </>
  );
}
