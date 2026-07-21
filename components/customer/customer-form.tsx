"use client";

import { createCustomer } from "@/lib/actions/customer";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export default function CustomerForm() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="rounded-lg bg-black px-4 py-2 text-white">+ Customer</button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Tambah Customer</DialogTitle>
        </DialogHeader>

        <form action={createCustomer} className="space-y-4">
          <input name="nama" placeholder="Nama Customer" className="w-full rounded-lg border p-2" />

          <textarea name="alamat" placeholder="Alamat" className="w-full rounded-lg border p-2" />

          <button className="w-full rounded-lg bg-black py-2 text-white">Simpan</button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
