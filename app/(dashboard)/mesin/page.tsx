import MesinForm from "@/components/mesin/mesin-form";
import { getCustomers } from "@/lib/actions/customer";
import { getMesin } from "@/lib/actions/mesin";
import MesinTable from "@/components/mesin/mesin-table";

export default async function MesinPage() {
  const mesin = await getMesin();

  const customers = await getCustomers();

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
