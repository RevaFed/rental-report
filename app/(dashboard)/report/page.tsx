import ReportPage from "@/components/report/report-page";
import { getReportMaster } from "@/lib/actions/report";

type Props = {
  searchParams: Promise<{
    tanggal?: string;
  }>;
};

export default async function Page({ searchParams }: Props) {
  const master = await getReportMaster();

  const params = await searchParams;

  return <ReportPage customers={master.customers} mesin={master.mesin} initialTanggal={params.tanggal} />;
}
