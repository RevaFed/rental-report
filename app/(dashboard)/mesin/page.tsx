import MesinForm from "@/components/mesin/mesin-form";
import { getMesin, getMesinCustomers } from "@/lib/actions/mesin";
import MesinTable from "@/components/mesin/mesin-table";

export const dynamic = "force-dynamic";

export default async function MesinPage() {
  const [mesin, customers] = await Promise.all([getMesin(), getMesinCustomers()]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Master Mesin</h1>

        <MesinForm customers={customers} />
      </div>

      <MesinTable data={mesin} customers={customers} />
    </div>
  );
}
