"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServer } from "@/lib/supabase/server";
import { createSupabaseAdmin } from "@/lib/supabase/admin";

export type AdminReport = {
  id: string;
  tanggal: string;
  jenis: string;
  masalah: string | null;
  jam_masuk: string | null;
  jam_keluar: string | null;
  keterangan: string | null;
  note: string | null;
  is_backup: boolean;
  customer_backup: string | null;
  alamat_backup: string | null;
  tipe_mesin_backup: string | null;
  nomor_seri_backup: string | null;
  created_at: string | null;
  created_by: number | null;
  customer: { id: string; nama: string; alamat: string } | null;
  mesin: { id: string; nomor_seri: string; tipe_mesin: string; customer_id: string } | null;
  teknisi: { id: number; nama: string; username: string; wilayah: string | null } | null;
};

async function requireAdmin() {
  const auth = createSupabaseServer();
  const { cookies } = await import("next/headers");
  const cookieStore = await cookies();
  const session = cookieStore.get("session");

  if (!session?.value) throw new Error("Unauthorized");

  const { data: user, error } = await auth.from("users").select("id, username, nama, role, is_active, wilayah").eq("id", session.value).maybeSingle();

  if (error || !user || user.role !== "admin" || !user.is_active) {
    throw new Error("Akses admin diperlukan.");
  }

  return user;
}

export async function getAdminReports(): Promise<AdminReport[]> {
  await requireAdmin();

  const supabase = createSupabaseAdmin();

  const [reportsResult, customersResult, mesinResult, usersResult] = await Promise.all([
    supabase
      .from("report_harian")
      .select("id, tanggal, customer_id, mesin_id, jenis, masalah, jam_masuk, jam_keluar, keterangan, note, is_backup, customer_backup, alamat_backup, tipe_mesin_backup, nomor_seri_backup, created_at, created_by")
      .order("tanggal", { ascending: false })
      .order("created_at", { ascending: false }),
    supabase.from("customer").select("id, nama, alamat"),
    supabase.from("mesin").select("id, nomor_seri, tipe_mesin, customer_id"),
    supabase.from("users").select("id, nama, username, wilayah, role").eq("role", "teknisi"),
  ]);

  if (reportsResult.error) throw new Error(reportsResult.error.message);
  if (customersResult.error) throw new Error(customersResult.error.message);
  if (mesinResult.error) throw new Error(mesinResult.error.message);
  if (usersResult.error) throw new Error(usersResult.error.message);

  const customers = new Map((customersResult.data ?? []).map((item) => [item.id, item]));
  const mesin = new Map((mesinResult.data ?? []).map((item) => [item.id, item]));
  const teknisi = new Map((usersResult.data ?? []).map((item) => [item.id, item]));

  return (reportsResult.data ?? []).map((report) => ({
    id: report.id,
    tanggal: report.tanggal,
    jenis: report.jenis,
    masalah: report.masalah,
    jam_masuk: report.jam_masuk,
    jam_keluar: report.jam_keluar,
    keterangan: report.keterangan,
    note: report.note,
    is_backup: report.is_backup ?? false,
    customer_backup: report.customer_backup,
    alamat_backup: report.alamat_backup,
    tipe_mesin_backup: report.tipe_mesin_backup,
    nomor_seri_backup: report.nomor_seri_backup,
    created_at: report.created_at,
    created_by: report.created_by,
    customer: report.customer_id ? (customers.get(report.customer_id) ?? null) : null,
    mesin: report.mesin_id ? (mesin.get(report.mesin_id) ?? null) : null,
    teknisi: report.created_by ? (teknisi.get(report.created_by) ?? null) : null,
  }));
}

export async function deleteAdminReport(formData: FormData) {
  await requireAdmin();

  const id = String(formData.get("id") ?? "").trim();
  if (!id) return { success: false, error: "ID report tidak valid." };

  const supabase = createSupabaseAdmin();
  const { error } = await supabase.from("report_harian").delete().eq("id", id);

  if (error) {
    console.error("DELETE ADMIN REPORT ERROR:", error);
    return { success: false, error: "Gagal menghapus report." };
  }

  revalidatePath("/admin/report");
  revalidatePath("/admin/dashboard");
  revalidatePath("/riwayat");
  revalidatePath("/report");

  return { success: true };
}
