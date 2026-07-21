"use client";

import { createMesin } from "@/lib/actions/mesin";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

import type { Customer } from "@/types/database";

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

        <form action={createMesin} className="space-y-4">
          <div>
            <label className="mb-2 block text-sm">Customer</label>

            <select name="customer_id" className="w-full rounded-lg border p-2" required>
              <option value="">-- Pilih Customer --</option>

              {customers.map((customer) => (
                <option key={customer.id} value={customer.id}>
                  {customer.nama}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm">Tipe Mesin</label>

            <input name="tipe_mesin" className="w-full rounded-lg border p-2" placeholder="Contoh : IR C3020" required />
          </div>

          <div>
            <label className="mb-2 block text-sm">Nomor Seri</label>

            <input name="nomor_seri" className="w-full rounded-lg border p-2" placeholder="Contoh : DHM10309" required />
          </div>

          <button className="w-full rounded-lg bg-black py-2 text-white">Simpan</button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
