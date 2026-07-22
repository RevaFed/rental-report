"use client";

import { useRouter } from "next/navigation";
import { Users, Printer, ClipboardList, CalendarDays, Building2, CircleDashed, CheckCircle2 } from "lucide-react";

import StatCard from "./stat-card";
import JenisCard from "./jenis-card";
import ChartCard from "./chart-card";
import TodayTable from "./today-table";
import TopCustomer from "./top-customer";
import DashboardFilter from "./dashboard-filter";

type Props = {
  month: number;
  year: number;

  stats: {
    customer: number;
    mesin: number;
    reportHariIni: number;
    reportBulan: number;
    sudahDikunjungi: number;
    belumDikunjungi: number;
    customerBackup: number;
  };

  jenis: {
    PM: number;
    CR: number;
    FU: number;
    OTH: number;
  };

  chart: any[];

  today: any[];

  topCustomer: any[];
};

export default function DashboardPage({ month, year, stats, jenis, chart, today, topCustomer }: Props) {
  const router = useRouter();

  return (
    <div className="space-y-6">
      {/* HEADER */}

      <div>
        <h1 className="text-2xl font-bold md:text-3xl">Dashboard</h1>

        <p className="mt-1 text-sm text-gray-500 md:text-base">Monitoring aktivitas teknisi rental</p>
      </div>

      {/* FILTER */}

      <DashboardFilter month={month} year={year} onMonthChange={(m) => router.push(`/dashboard?month=${m}&year=${year}`)} onYearChange={(y) => router.push(`/dashboard?month=${month}&year=${y}`)} />

      {/* CARD */}

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-7">
        <StatCard title="Total Customer" value={stats.customer} icon={<Users size={20} />} color="blue" />

        <StatCard title="Total Mesin" value={stats.mesin} icon={<Printer size={20} />} color="green" />

        <StatCard title="Report Hari Ini" value={stats.reportHariIni} icon={<ClipboardList size={20} />} color="orange" />

        <StatCard title="Report Bulan Ini" value={stats.reportBulan} icon={<CalendarDays size={20} />} color="red" />

        <StatCard title="Sudah Dikunjungi" value={stats.sudahDikunjungi} icon={<CheckCircle2 size={20} />} color="green" />

        <StatCard title="Belum Dikunjungi" value={stats.belumDikunjungi} icon={<CircleDashed size={20} />} color="orange" />

        <StatCard title="Customer Backup" value={stats.customerBackup} icon={<Building2 size={20} />} color="blue" />
      </div>

      {/* JENIS */}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <JenisCard title="PM" value={jenis.PM} color="emerald" />

        <JenisCard title="CR" value={jenis.CR} color="sky" />

        <JenisCard title="FU" value={jenis.FU} color="amber" />

        <JenisCard title="OTH" value={jenis.OTH} color="rose" />
      </div>

      {/* CHART */}

      <ChartCard data={chart} />

      {/* TABLE */}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <TodayTable data={today} />
        </div>

        <TopCustomer data={topCustomer} />
      </div>
    </div>
  );
}
