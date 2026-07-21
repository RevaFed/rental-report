"use client";

import { useMemo, useState } from "react";

import MesinSearch from "./mesin-search";
import MesinAction from "./mesin-action";
import MesinEditDialog from "./mesin-edit-dialog";
import MesinDeleteDialog from "./mesin-delete-dialog";

type Mesin = {
  id: string;
  tipe_mesin: string;
  nomor_seri: string;

  customer: {
    nama: string;
  };
};

type Customer = {
  id: string;
  nama: string;
};

export default function MesinTable({ data, customers }: { data: Mesin[]; customers: Customer[] }) {
  const [search, setSearch] = useState("");

  const [openEdit, setOpenEdit] = useState(false);

  const [openDelete, setOpenDelete] = useState(false);

  const [selectedMesin, setSelectedMesin] = useState<Mesin | null>(null);

  const filtered = useMemo(() => {
    return data.filter((item) => {
      return item.customer.nama.toLowerCase().includes(search.toLowerCase()) || item.tipe_mesin.toLowerCase().includes(search.toLowerCase()) || item.nomor_seri.toLowerCase().includes(search.toLowerCase());
    });
  }, [search, data]);

  return (
    <>
      {/* SEARCH */}

      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <MesinSearch value={search} onChange={setSearch} />
      </div>

      {/* TABLE */}

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
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-10 text-center text-gray-400">
                    Data mesin kosong
                  </td>
                </tr>
              )}

              {filtered.map((item, index) => (
                <tr key={item.id} className="border-t transition hover:bg-gray-50">
                  <td className="p-3 text-center">{index + 1}</td>

                  <td className="p-3 font-medium whitespace-nowrap">{item.customer.nama}</td>

                  <td className="p-3 whitespace-nowrap">{item.tipe_mesin}</td>

                  <td className="p-3 font-mono text-sm whitespace-nowrap">{item.nomor_seri}</td>

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
      </div>

      <MesinEditDialog open={openEdit} onOpenChange={setOpenEdit} mesin={selectedMesin} customers={customers} />

      <MesinDeleteDialog open={openDelete} onOpenChange={setOpenDelete} mesin={selectedMesin} />
    </>
  );
}
