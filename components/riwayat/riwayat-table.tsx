"use client";

import Link from "next/link";
import { Eye, FileText } from "lucide-react";
import { Trash2 } from "lucide-react";
import { deleteReport } from "@/lib/actions/report";

type Item = {
  tanggal: string;
  total: number;
};

type Props = {
  data: Item[];
};
function formatTanggal(tanggal: string) {
  return new Date(tanggal).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}
export default function RiwayatTable({ data }: Props) {
  return (
    <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-[650px] w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-4 text-left font-semibold">Tanggal</th>

              <th className="w-40 p-4 text-center font-semibold">Total Mesin</th>

              <th className="w-48 p-4 text-center font-semibold">Aksi</th>
            </tr>
          </thead>

          <tbody>
            {data.length === 0 && (
              <tr>
                <td colSpan={3} className="p-12 text-center text-gray-400">
                  Belum ada riwayat report.
                </td>
              </tr>
            )}

            {data.map((item) => (
              <tr key={item.tanggal} className="border-t transition hover:bg-gray-50">
                <td className="p-4 font-medium whitespace-nowrap">{formatTanggal(item.tanggal)}</td>

                <td className="p-4 text-center">
                  <span className="rounded-lg bg-blue-100 px-3 py-1 text-sm font-semibold text-blue-700">{item.total}</span>
                </td>

                <td className="p-4">
                  <div className="flex justify-center gap-2">
                    <Link href={`/report?tanggal=${item.tanggal}`} className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm text-white transition hover:bg-blue-700">
                      <Eye size={16} />
                      Lihat
                    </Link>
                    <form action={deleteReport}>
                      <input type="hidden" name="tanggal" value={item.tanggal} />

                      <button
                        type="submit"
                        className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm text-white transition hover:bg-red-700"
                        onClick={(e) => {
                          if (!confirm("Yakin ingin menghapus seluruh report tanggal ini?")) {
                            e.preventDefault();
                          }
                        }}
                      >
                        <Trash2 size={16} />
                        Hapus
                      </button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
