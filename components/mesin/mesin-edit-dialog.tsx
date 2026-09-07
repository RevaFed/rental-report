"use client";

import { useEffect, useMemo, useState } from "react";
import { updateMesin } from "@/lib/actions/mesin";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Search, Check, ChevronDown } from "lucide-react";
import type { Mesin, Customer } from "@/types/mesin";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mesin: Mesin | null;
  customers: Customer[];
};

function CustomerSearchSelect({ customers, value, onChange }: { customers: Customer[]; value: string; onChange: (value: string) => void }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const selectedCustomer = customers.find((customer) => customer.id === value);

  const filteredCustomers = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) return customers;

    return customers.filter((customer) => customer.nama.toLowerCase().includes(keyword));
  }, [customers, search]);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="flex w-full items-center justify-between rounded-lg border bg-white px-3 py-2.5 text-left text-sm shadow-sm transition hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-black/10"
      >
        <span className={selectedCustomer ? "truncate text-sm text-gray-900" : "truncate text-sm text-gray-500"}>{selectedCustomer?.nama ?? "-- Pilih Customer --"}</span>

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
              filteredCustomers.map((customer) => {
                const selected = customer.id === value;

                return (
                  <button
                    key={customer.id}
                    type="button"
                    onClick={() => {
                      onChange(customer.id);
                      setSearch("");
                      setOpen(false);
                    }}
                    className="flex w-full items-center justify-between rounded-md px-3 py-2.5 text-left text-sm hover:bg-gray-100"
                  >
                    <span className="truncate">{customer.nama}</span>
                    <Check className={`h-4 w-4 shrink-0 ${selected ? "text-black" : "text-transparent"}`} />
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function MesinEditDialog({ open, onOpenChange, mesin, customers }: Props) {
  const [customerId, setCustomerId] = useState("");

  useEffect(() => {
    if (open && mesin) {
      setCustomerId(mesin.customer_id);
    }
  }, [open, mesin]);

  if (!mesin) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Mesin</DialogTitle>
        </DialogHeader>

        <form action={updateMesin} className="space-y-4">
          <input type="hidden" name="id" value={mesin.id} />
          <input type="hidden" name="customer_id" value={customerId} required />

          <div>
            <label className="mb-2 block text-sm font-medium">Customer</label>

            <CustomerSearchSelect customers={customers} value={customerId} onChange={setCustomerId} />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">Tipe Mesin</label>

            <input name="tipe_mesin" defaultValue={mesin.tipe_mesin} className="w-full rounded-lg border p-2.5" required />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">Nomor Seri</label>

            <input name="nomor_seri" defaultValue={mesin.nomor_seri} className="w-full rounded-lg border p-2.5" required />
          </div>

          <button className="w-full rounded-lg bg-black py-2.5 text-white transition hover:bg-gray-800">Update</button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
