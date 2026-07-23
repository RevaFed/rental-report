"use server";

import { createSupabaseServer } from "@/lib/supabase/server";

export async function getDashboardData(month: number, year: number) {
  const supabase = createSupabaseServer();

  /* ====================================
      PERIODE
  ==================================== */

  const startDate = `${year}-${String(month).padStart(2, "0")}-01`;

  const lastDay = new Date(year, month, 0).getDate();

  const endDate = `${year}-${String(month).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;

  const today = new Date().toISOString().split("T")[0];

  /* ====================================
      CARD
  ==================================== */

  const [customer, mesin, reportHariIni, reportBulan, customerHariIni, customerBackup] = await Promise.all([
    supabase.from("customer").select("*", {
      head: true,
      count: "exact",
    }),

    supabase.from("mesin").select("*", {
      head: true,
      count: "exact",
    }),

    supabase
      .from("report_harian")
      .select("*", {
        head: true,
        count: "exact",
      })
      .eq("tanggal", today),

    // Report bulan
    supabase
      .from("report_harian")
      .select("*", {
        head: true,
        count: "exact",
      })
      .gte("tanggal", startDate)
      .lte("tanggal", endDate),

    // Mesin yang dikunjungi hari ini
    supabase.from("report_harian").select("mesin_id").eq("tanggal", today),

    // Customer Backup
    supabase
      .from("report_harian")
      .select("*", {
        head: true,
        count: "exact",
      })
      .eq("is_backup", true)
      .gte("tanggal", startDate)
      .lte("tanggal", endDate),
  ]);
  /* ====================================
    CUSTOMER DIKUNJUNGI
==================================== */

  /* MESIN DIKUNJUNGI */

  const sudahDikunjungi = new Set((customerHariIni.data ?? []).filter((item) => item.mesin_id).map((item) => item.mesin_id)).size;

  const belumDikunjungi = Math.max(0, (mesin.count ?? 0) - sudahDikunjungi);

  /* ====================================
      JENIS
  ==================================== */

  const { data: jenisData } = await supabase.from("report_harian").select("jenis").gte("tanggal", startDate).lte("tanggal", endDate);

  const jenis = {
    PM: 0,
    CR: 0,
    FU: 0,
    OTH: 0,
  };

  jenisData?.forEach((item) => {
    switch (item.jenis) {
      case "PM":
        jenis.PM++;
        break;

      case "CR":
        jenis.CR++;
        break;

      case "FU":
        jenis.FU++;
        break;

      default:
        jenis.OTH++;
        break;
    }
  });
  /* ====================================
      CHART (PER HARI DALAM BULAN)
  ==================================== */

  const chart: {
    tanggal: string;
    total: number;
  }[] = [];

  for (let day = 1; day <= lastDay; day++) {
    const tgl = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

    const { count } = await supabase
      .from("report_harian")
      .select("*", {
        head: true,
        count: "exact",
      })
      .eq("tanggal", tgl);

    chart.push({
      tanggal: new Date(tgl).toLocaleDateString("id-ID", {
        day: "2-digit",
      }),
      total: count ?? 0,
    });
  }

  /* ====================================
      TABEL REPORT
  ==================================== */

  const { data: reportData } = await supabase
    .from("report_harian")
    .select(
      `
      id,
      tanggal,
      jenis,
      jam_masuk,
      jam_keluar,
      masalah,
      keterangan,

      customer (
        nama
      ),

      mesin (
        nomor_seri,
        tipe_mesin
      )
    `,
    )
    .gte("tanggal", startDate)
    .lte("tanggal", endDate)
    .order("tanggal", {
      ascending: false,
    });

  const reportTable =
    reportData?.map((item: any) => ({
      id: item.id,

      tanggal: item.tanggal,

      customer: item.customer?.nama ?? "-",

      nomor_seri: item.mesin?.nomor_seri ?? "-",

      tipe_mesin: item.mesin?.tipe_mesin ?? "-",

      jenis: item.jenis,

      masalah: item.masalah,

      jam_masuk: item.jam_masuk,

      jam_keluar: item.jam_keluar,

      keterangan: item.keterangan,
    })) ?? [];
  /* ====================================
      TOP CUSTOMER
  ==================================== */

  const counter = new Map<string, number>();

  reportData?.forEach((item: any) => {
    const nama = item.customer?.nama;

    if (!nama) return;

    counter.set(nama, (counter.get(nama) ?? 0) + 1);
  });

  const topCustomer = [...counter.entries()]
    .map(([nama, total]) => ({
      nama,
      total,
    }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 5);

  /* ====================================
      RETURN
  ==================================== */

  return {
    stats: {
      customer: customer.count ?? 0,

      mesin: mesin.count ?? 0,

      reportHariIni: reportHariIni.count ?? 0,

      reportBulan: reportBulan.count ?? 0,

      sudahDikunjungi,

      belumDikunjungi,
      customerBackup: customerBackup.count ?? 0,
    },

    jenis,

    chart,

    today: reportTable,

    topCustomer,
  };
}
