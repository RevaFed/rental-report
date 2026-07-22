"use client";

import { useState } from "react";
import { Building2, MapPin, Printer, Hash, X, UserPlus } from "lucide-react";

import { createCustomerWithMesin } from "@/lib/actions/customer";
import { Customer } from "@/types/report";

type Props = {
  open: boolean;
  onClose: () => void;
  onCreated: (data: { customer: Customer; mesin: any }) => void;
};

export default function CustomerQuickDialog({ open, onClose, onCreated }: Props) {
  const [nama, setNama] = useState("");
  const [alamat, setAlamat] = useState("");
  const [tipeMesin, setTipeMesin] = useState("");
  const [nomorSeri, setNomorSeri] = useState("");

  const [saving, setSaving] = useState(false);

  if (!open) return null;

  function resetForm() {
    setNama("");
    setAlamat("");
    setTipeMesin("");
    setNomorSeri("");
  }

  async function handleSave() {
    try {
      if (!nama.trim()) {
        alert("Nama customer wajib diisi.");
        return;
      }

      if (!tipeMesin.trim()) {
        alert("Tipe mesin wajib diisi.");
        return;
      }

      if (!nomorSeri.trim()) {
        alert("Nomor seri wajib diisi.");
        return;
      }

      setSaving(true);

      const result = await createCustomerWithMesin(nama, alamat, tipeMesin, nomorSeri);

      onCreated(result);

      resetForm();
      onClose();
    } catch (error: any) {
      console.error(error);
      alert(error.message ?? "Gagal menyimpan data.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl">
        {/* HEADER */}

        <div className="flex items-center justify-between border-b px-6 py-5">
          <div>
            <div className="flex items-center gap-2">
              <UserPlus size={22} className="text-blue-600" />

              <h2 className="text-xl font-bold">Tambah Customer</h2>
            </div>

            <p className="mt-1 text-sm text-gray-500">Tambahkan customer beserta mesin pertamanya.</p>
          </div>

          <button
            onClick={() => {
              resetForm();
              onClose();
            }}
            className="rounded-lg p-2 transition hover:bg-gray-100"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-6 p-6">
          {/* CUSTOMER */}

          <div className="rounded-xl border bg-gray-50 p-5">
            <div className="mb-4 flex items-center gap-2">
              <Building2 size={18} className="text-blue-600" />

              <h3 className="font-semibold">Informasi Customer</h3>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium">Nama Customer</label>

                <input value={nama} onChange={(e) => setNama(e.target.value)} placeholder="Contoh : PT Maju Jaya" className="w-full rounded-lg border px-4 py-2.5 outline-none transition focus:border-blue-500" />
              </div>

              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-medium">
                  <MapPin size={15} />
                  Alamat
                </label>

                <textarea rows={3} value={alamat} onChange={(e) => setAlamat(e.target.value)} placeholder="Masukkan alamat customer..." className="w-full rounded-lg border px-4 py-2.5 outline-none transition focus:border-blue-500" />
              </div>
            </div>
          </div>

          {/* MESIN */}

          <div className="rounded-xl border bg-gray-50 p-5">
            <div className="mb-4 flex items-center gap-2">
              <Printer size={18} className="text-green-600" />

              <h3 className="font-semibold">Mesin Pertama</h3>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium">Tipe Mesin</label>

                <input value={tipeMesin} onChange={(e) => setTipeMesin(e.target.value)} placeholder="Canon IR2525" className="w-full rounded-lg border px-4 py-2.5 outline-none transition focus:border-blue-500" />
              </div>

              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-medium">
                  <Hash size={15} />
                  Nomor Seri
                </label>

                <input value={nomorSeri} onChange={(e) => setNomorSeri(e.target.value)} placeholder="ABC123456" className="w-full rounded-lg border px-4 py-2.5 outline-none transition focus:border-blue-500" />
              </div>
            </div>
          </div>
        </div>

        {/* FOOTER */}

        <div className="flex justify-end gap-3 border-t px-6 py-5">
          <button
            onClick={() => {
              resetForm();
              onClose();
            }}
            className="rounded-lg border px-5 py-2.5 font-medium transition hover:bg-gray-100"
          >
            Batal
          </button>

          <button onClick={handleSave} disabled={saving} className="rounded-lg bg-blue-600 px-5 py-2.5 font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50">
            {saving ? "Menyimpan..." : "Simpan Customer"}
          </button>
        </div>
      </div>
    </div>
  );
}
