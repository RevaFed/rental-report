"use client";

import { useState } from "react";

import { updateCustomer } from "@/lib/actions/customer";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;

  customer: {
    id: string;
    nama: string;
    alamat: string;
  } | null;
};

export default function CustomerEditDialog({ open, onOpenChange, customer }: Props) {
  if (!customer) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Customer</DialogTitle>
        </DialogHeader>

        <form action={updateCustomer} className="space-y-4">
          <input type="hidden" name="id" defaultValue={customer.id} />

          <div>
            <label className="mb-2 block text-sm">Nama Customer</label>

            <input name="nama" defaultValue={customer.nama} className="w-full rounded-lg border p-2" />
          </div>

          <div>
            <label className="mb-2 block text-sm">Alamat</label>

            <textarea name="alamat" defaultValue={customer.alamat} className="w-full rounded-lg border p-2" rows={3} />
          </div>

          <button className="w-full rounded-lg bg-black py-2 text-white">Update</button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
