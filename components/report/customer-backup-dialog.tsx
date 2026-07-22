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

  function handleClose() {
    resetForm();
    onClose();
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-2 sm:p-4">
      <div className="flex w-full max-w-2xl max-h-[95vh] flex-col overflow-hidden rounded-xl bg-white shadow-2xl sm:rounded-2xl">
        {/* Header */}
        <div className="flex items-start justify-between border-b px-4 py-4 sm:px-6 sm:py-5">
          <div>
            <h2 className="text-lg font-bold sm:text-xl">Customer Backup</h2>

            <p className="mt-1 text-xs text-gray-500 sm:text-sm">Tambahkan customer sementara beserta data mesin.</p>
          </div>

          <button onClick={handleClose} className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100">
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 space-y-5 overflow-y-auto p-4 sm:space-y-6 sm:p-6">
          {/* Customer */}
          <div className="rounded-xl border bg-gray-50 p-4 sm:p-5">
            <div className="mb-4 flex items-center gap-2">
              <Building2 size={18} className="text-blue-600" />
              <h3 className="font-semibold">Informasi Customer</h3>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium">Nama Customer</label>

                <input value={customer} onChange={(e) => setCustomer(e.target.value)} placeholder="Contoh : PT Maju Jaya" className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 sm:px-4" />
              </div>

              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-medium">
                  <MapPin size={15} />
                  Alamat
                </label>

                <textarea
                  rows={3}
                  value={alamat}
                  onChange={(e) => setAlamat(e.target.value)}
                  placeholder="Alamat customer..."
                  className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 sm:px-4 resize-none"
                />
              </div>
            </div>
          </div>

          {/* Mesin */}
          <div className="rounded-xl border bg-gray-50 p-4 sm:p-5">
            <div className="mb-4 flex items-center gap-2">
              <Printer size={18} className="text-green-600" />
              <h3 className="font-semibold">Informasi Mesin</h3>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium">Tipe Mesin</label>

                <input value={tipeMesin} onChange={(e) => setTipeMesin(e.target.value)} placeholder="Contoh : Canon IR2525" className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 sm:px-4" />
              </div>

              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-medium">
                  <Hash size={15} />
                  Nomor Seri
                </label>

                <input value={nomorSeri} onChange={(e) => setNomorSeri(e.target.value)} placeholder="Contoh : ABC123456" className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 sm:px-4" />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex flex-col-reverse gap-3 border-t bg-white px-4 py-4 sm:flex-row sm:justify-end sm:px-6 sm:py-5">
          <button onClick={handleClose} className="w-full rounded-lg border px-5 py-2.5 font-medium transition hover:bg-gray-100 sm:w-auto">
            Batal
          </button>

          <button onClick={handleSave} className="w-full rounded-lg bg-blue-600 px-5 py-2.5 font-medium text-white transition hover:bg-blue-700 sm:w-auto">
            Simpan Customer Backup
          </button>
        </div>
      </div>
    </div>
  );
}
