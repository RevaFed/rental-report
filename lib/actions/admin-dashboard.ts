"use server";

import { createSupabaseServer } from "@/lib/supabase/server";

export async function getAdminDashboardData() {
  const supabase = createSupabaseServer();

  const now = new Date();

  const today = now.toISOString().split("T")[0];

  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");

  const monthStart = `${year}-${month}-01`;

  const [usersResult, teknisiResult, teknisiAktifResult, customerResult, mesinResult, totalReportResult, reportsTodayResult, reportsMonthResult, reportsResult] = await Promise.all([
    // Semua user
    supabase.from("users").select("id, username, nama, role, is_active, created_at").order("created_at", { ascending: false }),

    // Total teknisi
    supabase
      .from("users")
      .select("id", {
        count: "exact",
        head: true,
      })
      .eq("role", "teknisi"),

    // Teknisi aktif
    supabase
      .from("users")
      .select("id", {
        count: "exact",
        head: true,
      })
      .eq("role", "teknisi")
      .eq("is_active", true),

    // Total customer
    supabase.from("customer").select("id", {
      count: "exact",
      head: true,
    }),

    // Total mesin
    supabase.from("mesin").select("id", {
      count: "exact",
      head: true,
    }),

    // TOTAL SEMUA REPORT
    supabase.from("report_harian").select("id", {
      count: "exact",
      head: true,
    }),

    // Report hari ini
    supabase
      .from("report_harian")
      .select("id", {
        count: "exact",
        head: true,
      })
      .eq("tanggal", today),

    // Report bulan ini
    supabase
      .from("report_harian")
      .select("id", {
        count: "exact",
        head: true,
      })
      .gte("tanggal", monthStart)
      .lte("tanggal", today),

    // Report terbaru
    supabase
      .from("report_harian")
      .select(
        `
        id,
        tanggal,
        jenis,
        masalah,
        jam_masuk,
        jam_keluar,

        customer (
          nama
        ),

        mesin (
          nomor_seri,
          tipe_mesin
        ),

        users:created_by (
          nama,
          username
        )
      `,
      )
      .order("tanggal", {
        ascending: false,
      })
      .limit(10),
  ]);

  if (usersResult.error) {
    console.error("Gagal mengambil users:", usersResult.error);
  }

  if (reportsResult.error) {
    console.error("Gagal mengambil reports:", reportsResult.error);
  }

  return {
    stats: {
      totalTeknisi: teknisiResult.count ?? 0,

      teknisiAktif: teknisiAktifResult.count ?? 0,

      totalCustomer: customerResult.count ?? 0,

      totalMesin: mesinResult.count ?? 0,

      totalReport: totalReportResult.count ?? 0,

      reportHariIni: reportsTodayResult.count ?? 0,

      reportBulanIni: reportsMonthResult.count ?? 0,
    },

    teknisi: usersResult.data ?? [],

    reports: reportsResult.data ?? [],
  };
}
