import ReportPage from "@/components/report/report-page";
import { getReportMaster } from "@/lib/actions/report";

export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<{
    tanggal?: string;
  }>;
};

export default async function Page({ searchParams }: Props) {
  const master = await getReportMaster();
  const params = await searchParams;

  return <ReportPage customers={master.customers} mesin={master.mesin} teknisi={master.teknisi} wilayah={master.wilayah} initialTanggal={params.tanggal} />;
}
