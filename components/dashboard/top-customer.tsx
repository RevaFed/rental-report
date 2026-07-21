"use client";

type Props = {
  data: {
    nama: string;
    total: number;
  }[];
};

export default function TopCustomer({ data }: Props) {
  return (
    <div className="rounded-2xl border bg-white p-5 shadow-sm">
      <h2 className="text-lg font-semibold">Top Customer</h2>

      <p className="mb-5 text-sm text-gray-500">Bulan ini</p>

      <div className="space-y-4">
        {data.length === 0 && <p className="text-sm text-gray-500">Belum ada data</p>}

        {data.map((item, index) => (
          <div key={item.nama} className="flex items-center justify-between rounded-lg bg-gray-50 p-3">
            <div>
              <p className="font-medium">
                {index + 1}. {item.nama}
              </p>
            </div>

            <span className="rounded bg-blue-100 px-3 py-1 text-sm font-semibold text-blue-700">{item.total}x</span>
          </div>
        ))}
      </div>
    </div>
  );
}
