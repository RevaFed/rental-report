import CustomerTable from "@/components/customer/customer-table";
import CustomerForm from "@/components/customer/customer-form";
import { getCustomers } from "@/lib/actions/customer";

export default async function CustomerPage() {
  const customers = await getCustomers();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Master Customer</h1>

        <CustomerForm />
      </div>

      <CustomerTable data={customers} />
    </div>
  );
}
