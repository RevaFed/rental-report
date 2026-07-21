"use client";

import { updateMesin } from "@/lib/actions/mesin";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

import type { Mesin, Customer } from "@/types/mesin";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mesin: Mesin | null;
  customers: Customer[];
};

export default function MesinEditDialog({ open, onOpenChange, mesin, customers }: Props) {
  if (!mesin) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Mesin</DialogTitle>
        </DialogHeader>

        <form action={updateMesin} className="space-y-4">
          <input type="hidden" name="id" defaultValue={mesin.id} />

          <div>
            <label className="mb-2 block text-sm">Customer</label>

            <select name="customer_id" defaultValue={mesin.customer_id} className="w-full rounded-lg border p-2">
              {customers.map((customer) => (
                <option key={customer.id} value={customer.id}>
                  {customer.nama}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm">Tipe Mesin</label>

            <input name="tipe_mesin" defaultValue={mesin.tipe_mesin} className="w-full rounded-lg border p-2" />
          </div>

          <div>
            <label className="mb-2 block text-sm">Nomor Seri</label>

            <input name="nomor_seri" defaultValue={mesin.nomor_seri} className="w-full rounded-lg border p-2" />
          </div>

          <button className="w-full rounded-lg bg-black py-2 text-white">Update</button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
