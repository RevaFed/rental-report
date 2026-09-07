"use client";

import { createCustomer } from "@/lib/actions/customer";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { Building2, MapPin, Plus, X } from "lucide-react";
import { useRef } from "react";
import { useFormStatus } from "react-dom";

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-black px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? (
        <>
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
          Menyimpan...
        </>
      ) : (
        <>
          <Plus className="h-4 w-4" />
          Simpan Customer
        </>
      )}
    </button>
  );
}

export default function CustomerForm() {
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button type="button" className="inline-flex h-10 items-center gap-2 rounded-xl bg-black px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-zinc-800 active:scale-[0.98]">
          <Plus className="h-4 w-4" />
          Tambah Customer
        </button>
      </DialogTrigger>

      <DialogContent className="w-[calc(100%-2rem)] max-w-lg overflow-hidden rounded-2xl border-zinc-200 bg-white p-0 shadow-2xl">
        <DialogHeader className="border-b border-zinc-100 bg-zinc-50/80 px-6 py-5 text-left">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-black text-white">
              <Building2 className="h-5 w-5" />
            </div>

            <div className="min-w-0">
              <DialogTitle className="text-lg font-semibold tracking-tight text-zinc-950">Tambah Customer</DialogTitle>
              <DialogDescription className="mt-1 text-sm leading-5 text-zinc-500">Masukkan data customer baru. Customer otomatis masuk ke daftar Anda.</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form ref={formRef} action={createCustomer} className="space-y-5 px-6 py-6">
          <div className="space-y-2">
            <label htmlFor="customer-nama" className="text-sm font-medium text-zinc-900">
              Nama Customer
            </label>

            <div className="relative">
              <Building2 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
              <input
                id="customer-nama"
                name="nama"
                type="text"
                required
                minLength={3}
                autoComplete="organization"
                placeholder="Contoh: PT Maju Jaya"
                className="h-11 w-full rounded-xl border border-zinc-200 bg-white pl-10 pr-3 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 hover:border-zinc-300 focus:border-zinc-950 focus:ring-2 focus:ring-zinc-950/10"
              />
            </div>

            <p className="text-xs text-zinc-400">Gunakan nama resmi customer agar mudah dicari.</p>
          </div>

          <div className="space-y-2">
            <label htmlFor="customer-alamat" className="text-sm font-medium text-zinc-900">
              Alamat
            </label>

            <div className="relative">
              <MapPin className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-zinc-400" />
              <textarea
                id="customer-alamat"
                name="alamat"
                required
                minLength={3}
                rows={4}
                placeholder="Masukkan alamat lengkap customer..."
                className="w-full resize-none rounded-xl border border-zinc-200 bg-white py-3 pl-10 pr-3 text-sm leading-5 text-zinc-900 outline-none transition placeholder:text-zinc-400 hover:border-zinc-300 focus:border-zinc-950 focus:ring-2 focus:ring-zinc-950/10"
              />
            </div>
          </div>

          <div className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3">
            <div className="flex gap-3">
              <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white text-zinc-700 shadow-sm">
                <Building2 className="h-3.5 w-3.5" />
              </div>
              <div>
                <p className="text-xs font-semibold text-zinc-800">Akses teknisi</p>
                <p className="mt-0.5 text-xs leading-5 text-zinc-500">Customer ini akan otomatis ditugaskan ke teknisi yang sedang login.</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 border-t border-zinc-100 pt-5">
            <button
              type="button"
              onClick={() => formRef.current?.reset()}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50"
            >
              <X className="h-4 w-4" />
              Reset
            </button>

            <SubmitButton />
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
