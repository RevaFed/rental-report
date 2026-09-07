"use client";

import { useMemo, useState } from "react";
import { createMesin } from "@/lib/actions/mesin";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Search, Check, ChevronDown } from "lucide-react";
import type { Customer } from "@/types/database";

function CustomerSearchSelect({ customers }: { customers: Customer[] }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filteredCustomers = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) return customers;

    return customers.filter((customer) => customer.nama.toLowerCase().includes(keyword));
  }, [customers, search]);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex w-full items-center justify-between rounded-lg border bg-white px-3 py-2.5 text-left text-sm shadow-sm transition hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-black/10"
      >
        <span className="truncate text-gray-500">-- Pilih Customer --</span>
        <ChevronDown className={`h-4 w-4 shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1 overflow-hidden rounded-lg border bg-white shadow-xl">
          <div className="border-b p-2">
            <div className="flex items-center gap-2 rounded-md border px-3">
              <Search className="h-4 w-4 shrink-0 text-gray-400" />
              <input autoFocus value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cari customer..." className="w-full border-0 py-2 text-sm outline-none" />
            </div>
          </div>

          <div className="max-h-56 overflow-y-auto p-1">
            {filteredCustomers.length === 0 ? (
              <div className="px-3 py-6 text-center text-sm text-gray-400">Customer tidak ditemukan</div>
            ) : (
              filteredCustomers.map((customer) => (
                <button
                  key={customer.id}
                  type="button"
                  onClick={() => {
                    const form = document.getElementById("tambah-mesin-form") as HTMLFormElement | null;

                    const input = form?.querySelector('input[name="customer_id"]') as HTMLInputElement | null;

                    if (input) {
                      input.value = customer.id;
                    }

                    const label = document.getElementById("selected-customer-label");

                    if (label) {
                      label.textContent = customer.nama;
                      label.className = "truncate text-sm text-gray-900";
                    }

                    setSearch("");
                    setOpen(false);
                  }}
                  className="flex w-full items-center justify-between rounded-md px-3 py-2.5 text-left text-sm hover:bg-gray-100"
                >
                  <span className="truncate">{customer.nama}</span>
                  <Check className="h-4 w-4 shrink-0 text-transparent" />
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function MesinForm({ customers }: { customers: Customer[] }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="rounded-lg bg-black px-4 py-2 text-white">+ Tambah Mesin</button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Tambah Mesin</DialogTitle>
        </DialogHeader>

        <form id="tambah-mesin-form" action={createMesin} className="space-y-4">
          <input type="hidden" name="customer_id" required />

          <div>
            <label className="mb-2 block text-sm font-medium">Customer</label>

            <CustomerSearchSelect customers={customers} />

            <div id="selected-customer-label" className="mt-2 truncate text-sm text-gray-500">
              Belum ada customer dipilih
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">Tipe Mesin</label>

            <input name="tipe_mesin" className="w-full rounded-lg border p-2.5" placeholder="Contoh : IR C3020" required />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">Nomor Seri</label>

            <input name="nomor_seri" className="w-full rounded-lg border p-2.5" placeholder="Contoh : DHM10309" required />
          </div>

          <button className="w-full rounded-lg bg-black py-2.5 text-white transition hover:bg-gray-800">Simpan</button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
