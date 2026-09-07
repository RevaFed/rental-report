import { getAdminRiwayat } from "@/lib/actions/admin-riwayat";
import AdminRiwayatPage from "@/components/admin/riwayat-page";

export const dynamic = "force-dynamic";

export default async function Page() {
  const data = await getAdminRiwayat();

  return <AdminRiwayatPage riwayat={data.riwayat} reports={data.reports} technicians={data.technicians} />;
}
