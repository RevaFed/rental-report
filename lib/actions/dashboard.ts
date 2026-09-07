"use server";

import { createSupabaseAdmin } from "@/lib/supabase/admin";
import { getSession } from "@/lib/auth/session";

async function requireTechnician() {
  const session = await getSession();

  if (!session) {
    throw new Error("Sesi login tidak ditemukan.");
  }

  const userId = Number(session);

  if (!Number.isInteger(userId) || userId <= 0) {
    throw new Error("Sesi login tidak valid.");
  }

  const supabase = createSupabaseAdmin();

  const { data: user, error } = await supabase.from("users").select("id, username, nama, role, is_active").eq("id", userId).maybeSingle();

  if (error || !user || user.role !== "teknisi" || !user.is_active) {
    throw new Error("Akses teknisi tidak valid.");
  }

  return { supabase, user };
}

export async function getDashboardData(month: number, year: number) {
  const { supabase, user } = await requireTechnician();

  const startDate = `${year}-${String(month).padStart(2, "0")}-01`;
  const lastDay = new Date(year, month, 0).getDate();
  const endDate = `${year}-${String(month).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;
  const today = new Date().toISOString().split("T")[0];

  // Customer yang memang ditugaskan ke teknisi login.
  const { data: assignments, error: assignmentError } = await supabase.from("customer_teknisi").select("customer_id").eq("teknisi_id", user.id);

  if (assignmentError) {
    throw new Error(assignmentError.message);
  }

  const customerIds = [...new Set((assignments ?? []).map((item) => item.customer_id))];

  // Jika teknisi belum mendapat assignment customer, semua statistik tetap 0.
  if (customerIds.length === 0) {
    return {
      stats: {
        customer: 0,
        mesin: 0,
        reportHariIni: 0,
        reportBulan: 0,
        sudahDikunjungi: 0,
        belumDikunjungi: 0,
        customerBackup: 0,
      },
      jenis: { PM: 0, CR: 0, FU: 0, OTH: 0 },
      chart: Array.from({ length: lastDay }, (_, index) => ({
        tanggal: new Date(`${year}-${String(month).padStart(2, "0")}-${String(index + 1).padStart(2, "0")}`).toLocaleDateString("id-ID", { day: "2-digit" }),
        total: 0,
      })),
      today: [],
      topCustomer: [],
    };
  }

  const [customerResult, mesinResult, reportHariIniResult, reportBulanResult, customerHariIniResult, customerBackupResult, jenisResult, reportResult] = await Promise.all([
    supabase.from("customer").select("*", { head: true, count: "exact" }).in("id", customerIds),

    supabase.from("mesin").select("*", { head: true, count: "exact" }).in("customer_id", customerIds),

    supabase.from("report_harian").select("*", { head: true, count: "exact" }).eq("created_by", user.id).eq("tanggal", today),

    supabase.from("report_harian").select("*", { head: true, count: "exact" }).eq("created_by", user.id).gte("tanggal", startDate).lte("tanggal", endDate),

    supabase.from("report_harian").select("mesin_id").eq("created_by", user.id).eq("tanggal", today),

    supabase.from("report_harian").select("*", { head: true, count: "exact" }).eq("created_by", user.id).eq("is_backup", true).gte("tanggal", startDate).lte("tanggal", endDate),

    supabase.from("report_harian").select("jenis").eq("created_by", user.id).gte("tanggal", startDate).lte("tanggal", endDate),

    supabase
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
        customer (nama),
        mesin (nomor_seri, tipe_mesin)
      `,
      )
      .eq("created_by", user.id)
      .gte("tanggal", startDate)
      .lte("tanggal", endDate)
      .order("tanggal", { ascending: false }),
  ]);

  const results = [customerResult, mesinResult, reportHariIniResult, reportBulanResult, customerHariIniResult, customerBackupResult, jenisResult, reportResult];

  const firstError = results.find((result) => result.error);

  if (firstError?.error) {
    throw new Error(firstError.error.message);
  }

  const mesinCount = mesinResult.count ?? 0;

  const sudahDikunjungi = new Set((customerHariIniResult.data ?? []).filter((item) => item.mesin_id).map((item) => item.mesin_id)).size;

  const belumDikunjungi = Math.max(0, mesinCount - sudahDikunjungi);

  const jenis = {
    PM: 0,
    CR: 0,
    FU: 0,
    OTH: 0,
  };

  (jenisResult.data ?? []).forEach((item) => {
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

  // Chart hanya menghitung report milik teknisi login.
  const chartData = await supabase.from("report_harian").select("tanggal").eq("created_by", user.id).gte("tanggal", startDate).lte("tanggal", endDate);

  if (chartData.error) {
    throw new Error(chartData.error.message);
  }

  const chartCounter = new Map<string, number>();

  (chartData.data ?? []).forEach((item) => {
    chartCounter.set(item.tanggal, (chartCounter.get(item.tanggal) ?? 0) + 1);
  });

  const chart = [];

  for (let day = 1; day <= lastDay; day++) {
    const tgl = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

    chart.push({
      tanggal: new Date(tgl).toLocaleDateString("id-ID", {
        day: "2-digit",
      }),
      total: chartCounter.get(tgl) ?? 0,
    });
  }

  const reportData = reportResult.data ?? [];

  const reportTable =
    reportData.map((item: any) => ({
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

  const counter = new Map<string, number>();

  reportData.forEach((item: any) => {
    const nama = item.customer?.nama;

    if (!nama) return;

    counter.set(nama, (counter.get(nama) ?? 0) + 1);
  });

  const topCustomer = [...counter.entries()]
    .map(([nama, total]) => ({ nama, total }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 5);

  return {
    stats: {
      customer: customerResult.count ?? 0,
      mesin: mesinCount,
      reportHariIni: reportHariIniResult.count ?? 0,
      reportBulan: reportBulanResult.count ?? 0,
      sudahDikunjungi,
      belumDikunjungi,
      customerBackup: customerBackupResult.count ?? 0,
    },
    jenis,
    chart,
    today: reportTable,
    topCustomer,
  };
}
