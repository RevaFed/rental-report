import { getAdminCustomers, getAdminTeknisi } from "@/lib/actions/admin-customer";
import CustomerAdminPage from "@/components/admin/customer-page";

export const dynamic = "force-dynamic";

export default async function AdminCustomerPage() {
  const [customers, technicians] = await Promise.all([getAdminCustomers(), getAdminTeknisi()]);

  return <CustomerAdminPage initialCustomers={customers} technicians={technicians} />;
}
