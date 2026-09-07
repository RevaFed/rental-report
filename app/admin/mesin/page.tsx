import { getAdminMesin, getAdminMesinCustomers } from "@/lib/actions/admin-mesin";
import MesinAdminPage from "@/components/admin/mesin-page";

export const dynamic = "force-dynamic";

export default async function AdminMesinPage() {
  const [mesin, customers] = await Promise.all([getAdminMesin(), getAdminMesinCustomers()]);

  return <MesinAdminPage initialMesin={mesin} customers={customers} />;
}
