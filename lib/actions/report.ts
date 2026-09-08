"use server";

import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth/session";
import { createSupabaseServer } from "@/lib/supabase/server";
import { createSupabaseAdmin } from "@/lib/supabase/admin";
import { customerSchema } from "@/lib/validations/customer";

type AuthUser = {
  id: number;
  username: string;
  nama: string;
  role: "admin" | "teknisi";
  is_active: boolean;
  wilayah: string | null;
};

async function getCurrentUser(): Promise<AuthUser | null> {
  const session = await getSession();

  if (!session) return null;

  const supabase = createSupabaseServer();

  const { data, error } = await supabase.from("users").select("id, username, nama, role, is_active, wilayah").eq("id", Number(session)).maybeSingle();

  if (error || !data || !data.is_active) return null;

  return data as AuthUser;
}

async function requireTechnician() {
  const user = await getCurrentUser();

  if (!user || user.role !== "teknisi") {
    throw new Error("Akses hanya untuk teknisi.");
  }

  return user;
}

type ReportInsert = {
  report_id?: string | null;
  tanggal: string;
  urutan?: number;
  customer_id: string | null;
  mesin_id: string | null;
  is_backup: boolean;
  customer_backup: string | null;
  alamat_backup: string | null;
  tipe_mesin_backup: string | null;
  nomor_seri_backup: string | null;
  jenis: "PM" | "CR" | "OTH" | "FU";
  masalah: string | null;
  jam_masuk: string | null;
  jam_keluar: string | null;
  keterangan: string | null;
  note: string | null;
};

export async function getReportMaster() {
  const user = await requireTechnician();
  const supabase = createSupabaseAdmin();

  const { data: assignments, error: assignmentError } = await supabase.from("customer_teknisi").select("customer_id").eq("teknisi_id", user.id);

  if (assignmentError) {
    throw new Error(assignmentError.message);
  }

  const customerIds = [...new Set((assignments ?? []).map((item) => item.customer_id))];

  if (customerIds.length === 0) {
    return {
      customers: [],
      mesin: [],
      teknisi: user.nama,
      wilayah: user.wilayah ?? "",
    };
  }

  const [{ data: customers, error: customerError }, { data: mesin, error: mesinError }] = await Promise.all([
    supabase.from("customer").select("id, nama, alamat").in("id", customerIds).order("nama"),
    supabase.from("mesin").select("id, customer_id, tipe_mesin, nomor_seri").in("customer_id", customerIds).eq("status", "aktif").order("nomor_seri"),
  ]);

  if (customerError) throw new Error(customerError.message);
  if (mesinError) throw new Error(mesinError.message);

  return {
    customers: customers ?? [],
    mesin: mesin ?? [],
    teknisi: user.nama,
    wilayah: user.wilayah ?? "",
  };
}

export async function getReportByDate(tanggal: string) {
  const user = await requireTechnician();
  const supabase = createSupabaseAdmin();

  const { data, error } = await supabase.from("report_harian").select("*").eq("tanggal", tanggal).eq("created_by", user.id).order("urutan", { ascending: true }).order("id", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return {
    data: data ?? [],
    teknisi: user.nama,
    wilayah: user.wilayah ?? "",
  };
}

export async function saveReport(payload: ReportInsert[]) {
  const user = await requireTechnician();

  if (!Array.isArray(payload) || payload.length === 0) {
    throw new Error("Belum ada data yang bisa disimpan.");
  }

  const tanggal = payload[0]?.tanggal?.trim();

  if (!tanggal) {
    throw new Error("Tanggal report tidak valid.");
  }

  if (payload.some((row) => row.tanggal !== tanggal)) {
    throw new Error("Tanggal report tidak konsisten.");
  }

  const supabase = createSupabaseAdmin();

  // Ambil report yang saat ini tersimpan untuk tanggal + teknisi ini.
  const { data: existingReports, error: existingError } = await supabase.from("report_harian").select("id").eq("tanggal", tanggal).eq("created_by", user.id);

  if (existingError) {
    throw new Error(existingError.message);
  }

  const existingIds = new Set((existingReports ?? []).map((row) => String(row.id)));

  // ID yang datang dari browser dan benar-benar merupakan ID database.
  // Row baru menggunakan Date.now(), jadi tidak akan dianggap sebagai UUID.
  const incomingExistingIds = new Set(
    payload
      .map((row) => {
        if (typeof row.report_id !== "string") return null;

        const id = row.report_id.trim();
        return id !== "" ? id : null;
      })
      .filter((id): id is string => id !== null),
  );

  // Hapus row lama yang memang sudah dihapus dari tabel di browser.
  const idsToDelete = [...existingIds].filter((id) => !incomingExistingIds.has(id));

  if (idsToDelete.length > 0) {
    const { error: deleteError } = await supabase.from("report_harian").delete().eq("created_by", user.id).in("id", idsToDelete);

    if (deleteError) {
      throw new Error(deleteError.message);
    }
  }

  // Update row lama dan insert row baru.
  for (let index = 0; index < payload.length; index += 1) {
    const row = payload[index];

    const data = {
      tanggal,
      urutan: index + 1,
      customer_id: row.customer_id,
      mesin_id: row.mesin_id,
      is_backup: row.is_backup,
      customer_backup: row.customer_backup,
      alamat_backup: row.alamat_backup,
      tipe_mesin_backup: row.tipe_mesin_backup,
      nomor_seri_backup: row.nomor_seri_backup,
      jenis: row.jenis,
      masalah: row.masalah,
      jam_masuk: row.jam_masuk,
      jam_keluar: row.jam_keluar,
      keterangan: row.keterangan,
      note: row.note,
      created_by: user.id,
    };

    const reportId = row.report_id?.trim();

    if (reportId && existingIds.has(reportId)) {
      const { error: updateError } = await supabase.from("report_harian").update(data).eq("id", reportId).eq("created_by", user.id);

      if (updateError) {
        throw new Error(updateError.message);
      }
    } else {
      const { error: insertError } = await supabase.from("report_harian").insert(data);

      if (insertError) {
        throw new Error(insertError.message);
      }
    }
  }

  revalidatePath("/report");
  revalidatePath("/riwayat");
  revalidatePath("/dashboard");
  revalidatePath("/admin/report");
  revalidatePath("/admin/dashboard");

  return { success: true };
}

export async function deleteReport(formData: FormData) {
  const user = await requireTechnician();

  const tanggal = formData.get("tanggal")?.toString().trim();

  if (!tanggal) {
    throw new Error("Tanggal report tidak valid.");
  }

  const supabase = createSupabaseAdmin();

  const { error } = await supabase.from("report_harian").delete().eq("tanggal", tanggal).eq("created_by", user.id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/report");
  revalidatePath("/riwayat");
  revalidatePath("/dashboard");
  revalidatePath("/admin/report");
  revalidatePath("/admin/dashboard");
}

export async function createCustomerWithMesinForTechnician(nama: string, alamat: string, tipe_mesin: string, nomor_seri: string) {
  const user = await requireTechnician();
  const parsed = customerSchema.safeParse({ nama, alamat });

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0].message);
  }

  if (!tipe_mesin.trim()) {
    throw new Error("Tipe mesin wajib diisi.");
  }

  if (!nomor_seri.trim()) {
    throw new Error("Nomor seri wajib diisi.");
  }

  const supabase = createSupabaseAdmin();

  const { data: customer, error: customerError } = await supabase.from("customer").insert({ nama: nama.trim(), alamat: alamat.trim() }).select().single();

  if (customerError) {
    throw new Error(customerError.message);
  }

  const { data: mesin, error: mesinError } = await supabase
    .from("mesin")
    .insert({
      customer_id: customer.id,
      tipe_mesin: tipe_mesin.trim(),
      nomor_seri: nomor_seri.trim(),
    })
    .select()
    .single();

  if (mesinError) {
    await supabase.from("customer").delete().eq("id", customer.id);
    throw new Error(mesinError.message);
  }

  const { error: assignmentError } = await supabase.from("customer_teknisi").insert({
    customer_id: customer.id,
    teknisi_id: user.id,
  });

  if (assignmentError) {
    await supabase.from("mesin").delete().eq("id", mesin.id);
    await supabase.from("customer").delete().eq("id", customer.id);
    throw new Error(assignmentError.message);
  }

  revalidatePath("/customer");
  revalidatePath("/mesin");
  revalidatePath("/report");
  revalidatePath("/dashboard");
  revalidatePath("/admin/customer");
  revalidatePath("/admin/mesin");

  return { customer, mesin };
}
