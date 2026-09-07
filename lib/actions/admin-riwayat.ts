"use server";

import { createSupabaseAdmin } from "@/lib/supabase/admin";
import { getSession } from "@/lib/auth/session";

export type AdminRiwayatItem = {
  tanggal: string;
  total: number;
};

export type AdminReportItem = {
  id: number | string;
  tanggal: string;
  jenis: string;
  masalah: string | null;
  jam_masuk: string | null;
  jam_keluar: string | null;
  customer: { nama: string } | null;
  mesin: { nomor_seri: string; tipe_mesin: string } | null;
  teknisi: { nama: string; username: string } | null;
};

export type AdminTeknisi = {
  id: number;
  nama: string;
  username: string;
};

async function requireAdmin() {
  const session = await getSession();

  if (!session) {
    throw new Error("Sesi login tidak ditemukan.");
  }

  const supabase = createSupabaseAdmin();

  const { data: user, error } = await supabase.from("users").select("id,username,nama,role,is_active").eq("id", Number(session)).maybeSingle();

  if (error) throw new Error(error.message);

  if (!user || user.role !== "admin" || !user.is_active) {
    throw new Error("Akses admin tidak valid.");
  }

  return user;
}

export async function getAdminRiwayat() {
  await requireAdmin();

  const supabase = createSupabaseAdmin();

  const [{ data: reports, error: reportError }, { data: technicians, error: techError }] = await Promise.all([
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
          customer ( nama ),
          mesin ( nomor_seri, tipe_mesin ),
          teknisi:users!report_harian_created_by_fkey ( nama, username )
        `,
      )
      .order("tanggal", { ascending: false })
      .order("jam_masuk", { ascending: false }),
    supabase.from("users").select("id,nama,username").eq("role", "teknisi").order("nama", { ascending: true }),
  ]);

  if (reportError) throw new Error(reportError.message);
  if (techError) throw new Error(techError.message);

  const rows = (reports ?? []) as unknown as AdminReportItem[];

  const map = new Map<string, AdminRiwayatItem>();

  rows.forEach((item) => {
    const current = map.get(item.tanggal);

    if (current) {
      current.total += 1;
    } else {
      map.set(item.tanggal, {
        tanggal: item.tanggal,
        total: 1,
      });
    }
  });

  return {
    riwayat: Array.from(map.values()),
    reports: rows,
    technicians: (technicians ?? []) as AdminTeknisi[],
  };
}
