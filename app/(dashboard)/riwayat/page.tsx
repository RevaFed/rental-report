import RiwayatPage from "@/components/riwayat/riwayat-page";
import { getRiwayat } from "@/lib/actions/riwayat";

export default async function Page() {
  const data = await getRiwayat();

  return <RiwayatPage data={data} />;
}
