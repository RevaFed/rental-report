"use client";

import RiwayatTable from "./riwayat-table";

type Item = {
  tanggal: string;
  total: number;
};

type Props = {
  data: Item[];
};

export default function RiwayatPage({ data }: Props) {
  return (
    <div className="space-y-6">
      {/* Header */}

      <div className="rounded-2xl border bg-white p-5 shadow-sm">
        <h1 className="text-2xl font-bold md:text-3xl">Riwayat Report</h1>

        <p className="mt-2 text-sm text-gray-500 md:text-base">Semua laporan yang pernah dibuat teknisi.</p>
      </div>

      {/* Table */}

      <RiwayatTable data={data} />
    </div>
  );
}
