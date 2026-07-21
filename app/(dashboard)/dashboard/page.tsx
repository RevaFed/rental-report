import DashboardPage from "@/components/dashboard/dashboard-page";
import { getDashboardData } from "@/lib/actions/dashboard";

type Props = {
  searchParams: Promise<{
    month?: string;
    year?: string;
  }>;
};

export default async function Page({ searchParams }: Props) {
  const params = await searchParams;

  const now = new Date();

  const month = Number(params.month) || now.getMonth() + 1;

  const year = Number(params.year) || now.getFullYear();

  const data = await getDashboardData(month, year);

  return <DashboardPage month={month} year={year} stats={data.stats} jenis={data.jenis} chart={data.chart} today={data.today} topCustomer={data.topCustomer} />;
}
