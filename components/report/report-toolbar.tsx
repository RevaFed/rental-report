"use client";

type Props = {
  tanggal: string;
  teknisi: string;
  wilayah: string;
  note: string;
  onTanggal: (value: string) => void;
  onNote: (value: string) => void;
};

export default function ReportToolbar({ tanggal, teknisi, wilayah, note, onTanggal, onNote }: Props) {
  return (
    <div className="rounded-xl border bg-white p-6 shadow-sm">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div>
          <label className="mb-2 block text-sm font-medium">Tanggal</label>

          <input type="date" value={tanggal} onChange={(e) => onTanggal(e.target.value)} className="w-full rounded-lg border p-2" />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">Teknisi</label>

          <input readOnly value={teknisi} className="w-full rounded-lg border bg-gray-100 p-2" />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">Wilayah</label>

          <input readOnly value={wilayah} className="w-full rounded-lg border bg-gray-100 p-2" />
        </div>
      </div>

      {/* NOTE */}
      <div className="mt-4">
        <label className="mb-2 block text-sm font-medium">Note</label>

        <textarea value={note} onChange={(e) => onNote(e.target.value)} rows={3} placeholder="Masukkan catatan tambahan..." className="w-full rounded-lg border p-3 outline-none focus:border-black" />
      </div>
    </div>
  );
}
