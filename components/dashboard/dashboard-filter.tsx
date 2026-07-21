"use client";

type Props = {
  month: number;
  year: number;

  onMonthChange: (value: number) => void;
  onYearChange: (value: number) => void;
};

const months = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];

export default function DashboardFilter({ month, year, onMonthChange, onYearChange }: Props) {
  const currentYear = new Date().getFullYear();

  const years = [];

  for (let i = currentYear - 5; i <= currentYear + 5; i++) {
    years.push(i);
  }

  return (
    <div className="flex flex-col gap-4 rounded-2xl border bg-white p-5 shadow-sm md:flex-row md:items-end md:justify-between">
      <div>
        <h2 className="text-lg font-semibold">Filter Dashboard</h2>

        <p className="text-sm text-gray-500">Pilih periode laporan</p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div>
          <label className="mb-1 block text-sm font-medium">Bulan</label>

          <select value={month} onChange={(e) => onMonthChange(Number(e.target.value))} className="w-full rounded-lg border px-4 py-2 outline-none focus:ring-2 focus:ring-black">
            {months.map((item, index) => (
              <option key={index} value={index + 1}>
                {item}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Tahun</label>

          <select value={year} onChange={(e) => onYearChange(Number(e.target.value))} className="w-full rounded-lg border px-4 py-2 outline-none focus:ring-2 focus:ring-black">
            {years.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
