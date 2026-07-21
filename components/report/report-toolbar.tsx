"use client";

type Props = {
  tanggal: string;

  teknisi: string;

  wilayah: string;

  onTanggal: (value: string) => void;
};

export default function ReportToolbar({ tanggal, teknisi, wilayah, onTanggal }: Props) {
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
    </div>
  );
}
