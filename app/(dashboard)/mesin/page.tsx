import Link from "next/link";

import MesinForm from "@/components/mesin/mesin-form";
import { getMesin, getMesinCustomers } from "@/lib/actions/mesin";
import MesinTable from "@/components/mesin/mesin-table";

export const dynamic = "force-dynamic";

export default async function MesinPage() {
  const [mesin, customers] = await Promise.all([getMesin(), getMesinCustomers()]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-3xl font-bold">Master Mesin</h1>

        <div className="flex flex-wrap items-center gap-2">
          <Link href="/mesin/tarikan" className="rounded-lg border bg-white px-4 py-2 text-sm font-medium transition hover:bg-gray-50">
            Daftar Mesin Tarikan
          </Link>

          <MesinForm customers={customers} />
        </div>
      </div>

      <MesinTable data={mesin} customers={customers} />
    </div>
  );
}
