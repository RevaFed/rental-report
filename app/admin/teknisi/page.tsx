import { getTeknisi } from "@/lib/actions/teknisi";
import TeknisiPage from "@/components/admin/teknisi-page";

export const dynamic = "force-dynamic";

export default async function TeknisiAdminPage() {
  const teknisi = await getTeknisi();

  return <TeknisiPage initialTeknisi={teknisi} />;
}
