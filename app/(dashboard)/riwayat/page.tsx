import RiwayatPage from "@/components/riwayat/riwayat-page";
import { getRiwayat } from "@/lib/actions/riwayat";

export const dynamic = "force-dynamic";

export default async function Page() {
  const data = await getRiwayat();

  return <RiwayatPage data={data} />;
}
