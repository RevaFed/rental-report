import Link from "next/link";

import { getMesinTarikan } from "@/lib/actions/mesin";
import MesinTarikanTable from "@/components/mesin/mesin-tarikan-table";

export const dynamic = "force-dynamic";

type MesinTarikan = {
  id: string;
  customer_id: string;
  tipe_mesin: string;
  nomor_seri: string;
  status: string;
  alasan_penarikan: string | null;
  ditarik_at: string | null;
  customer: {
    id: string;
    nama: string;
    alamat: string;
  } | null;
};

export default async function MesinTarikanPage() {
  const data = (await getMesinTarikan()) as MesinTarikan[];

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Daftar Mesin Tarikan</h1>

          <p className="mt-1 text-sm text-gray-500">Daftar mesin yang sudah ditarik dari customer.</p>
        </div>

        <Link href="/mesin" className="rounded-lg border bg-white px-4 py-2 text-sm font-medium transition hover:bg-gray-50">
          ← Kembali ke Master Mesin
        </Link>
      </div>

      {/* TABLE + SEARCH + PAGINATION */}
      <MesinTarikanTable data={data} />
    </div>
  );
}
