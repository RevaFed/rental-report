import { getAdminReports } from "@/lib/actions/admin-report";
import AdminReportPage from "@/components/admin/report-page";

export const dynamic = "force-dynamic";

export default async function Page() {
  const reports = await getAdminReports();
  return <AdminReportPage initialReports={reports} />;
}
