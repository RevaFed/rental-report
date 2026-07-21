"use client";

type Props = {
  data: any[];
};

export default function TodayTable({ data }: Props) {
  return (
    <div className="rounded-2xl border bg-white shadow-sm">
      <div className="border-b p-5">
        <h2 className="text-lg font-semibold">Report Hari Ini</h2>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-3 text-left">Customer</th>

              <th className="p-3 text-left">Mesin</th>

              <th className="p-3 text-center">Jenis</th>

              <th className="p-3 text-center">Jam</th>
            </tr>
          </thead>

          <tbody>
            {data.length === 0 && (
              <tr>
                <td colSpan={4} className="p-8 text-center text-gray-500">
                  Belum ada report hari ini
                </td>
              </tr>
            )}

            {data.map((item) => (
              <tr key={item.id} className="border-t">
                <td className="p-3">{item.customer}</td>

                <td className="p-3">{item.nomor_seri}</td>

                <td className="p-3 text-center">{item.jenis}</td>

                <td className="p-3 text-center">{item.jam_masuk}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
