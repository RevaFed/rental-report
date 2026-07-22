"use client";

import { useState } from "react";
import { Building2, MapPin, Printer, Hash, X } from "lucide-react";

export type BackupCustomerData = {
  customer: string;
  alamat: string;
  tipe_mesin: string;
  nomor_seri: string;
};

type Props = {
  open: boolean;
  onClose: () => void;
  onCreated: (data: BackupCustomerData) => void;
};

export default function CustomerBackupDialog({ open, onClose, onCreated }: Props) {
  const [customer, setCustomer] = useState("");
  const [alamat, setAlamat] = useState("");
  const [tipeMesin, setTipeMesin] = useState("");
  const [nomorSeri, setNomorSeri] = useState("");

  if (!open) return null;

  function resetForm() {
    setCustomer("");
    setAlamat("");
    setTipeMesin("");
    setNomorSeri("");
  }

  function handleSave() {
    if (!customer.trim()) {
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

    onCreated({
      customer,
      alamat,
      tipe_mesin: tipeMesin,
      nomor_seri: nomorSeri,
    });

    resetForm();
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b px-6 py-5">
          <div>
            <h2 className="text-xl font-bold">Customer Backup</h2>

            <p className="mt-1 text-sm text-gray-500">Tambahkan customer sementara beserta data mesin.</p>
          </div>

          <button
            onClick={() => {
              resetForm();
              onClose();
            }}
            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
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

                <input value={customer} onChange={(e) => setCustomer(e.target.value)} placeholder="Contoh : PT Maju Jaya" className="w-full rounded-lg border px-4 py-2.5 outline-none transition focus:border-blue-500" />
              </div>

              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-medium">
                  <MapPin size={15} />
                  Alamat
                </label>

                <textarea rows={3} value={alamat} onChange={(e) => setAlamat(e.target.value)} placeholder="Alamat customer..." className="w-full rounded-lg border px-4 py-2.5 outline-none transition focus:border-blue-500" />
              </div>
            </div>
          </div>

          {/* MESIN */}

          <div className="rounded-xl border bg-gray-50 p-5">
            <div className="mb-4 flex items-center gap-2">
              <Printer size={18} className="text-green-600" />

              <h3 className="font-semibold">Informasi Mesin</h3>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium">Tipe Mesin</label>

                <input value={tipeMesin} onChange={(e) => setTipeMesin(e.target.value)} placeholder="Contoh : Canon IR2525" className="w-full rounded-lg border px-4 py-2.5 outline-none transition focus:border-blue-500" />
              </div>

              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-medium">
                  <Hash size={15} />
                  Nomor Seri
                </label>

                <input value={nomorSeri} onChange={(e) => setNomorSeri(e.target.value)} placeholder="Contoh : ABC123456" className="w-full rounded-lg border px-4 py-2.5 outline-none transition focus:border-blue-500" />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}

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

          <button onClick={handleSave} className="rounded-lg bg-blue-600 px-5 py-2.5 font-medium text-white transition hover:bg-blue-700">
            Simpan Customer Backup
          </button>
        </div>
      </div>
    </div>
  );
}
