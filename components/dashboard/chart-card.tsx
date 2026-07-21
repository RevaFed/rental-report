"use client";

import { ResponsiveContainer, LineChart, Line, CartesianGrid, Tooltip, XAxis, YAxis } from "recharts";

type Props = {
  data: {
    tanggal: string;
    total: number;
  }[];
};

export default function ChartCard({ data }: Props) {
  return (
    <div className="rounded-2xl border bg-white p-5 shadow-sm">
      <div className="mb-5">
        <h2 className="text-lg font-semibold">Grafik Report 30 Hari Terakhir</h2>

        <p className="text-sm text-gray-500">Jumlah report yang dibuat teknisi</p>
      </div>

      <div className="h-[280px] w-full md:h-[360px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />

            <XAxis dataKey="tanggal" tick={{ fontSize: 12 }} />

            <YAxis allowDecimals={false} />

            <Tooltip />

            <Line type="monotone" dataKey="total" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
