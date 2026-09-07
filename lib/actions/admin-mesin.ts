"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServer } from "@/lib/supabase/server";
import { createSupabaseAdmin } from "@/lib/supabase/admin";
import { mesinSchema } from "@/lib/validations/mesin";

async function requireAdmin() {
  const server = createSupabaseServer();
  const { data: { user: _user } = { user: null } } = await server.auth.getUser().catch(() => ({ data: { user: null } }));

  // Aplikasi memakai custom session cookie, bukan Supabase Auth.
  // Validasi role dilakukan dari cookie session -> users.
  const { getSession } = await import("@/lib/auth/session");
  const session = await getSession();

  if (!session) throw new Error("Unauthorized");

  const admin = createSupabaseAdmin();
  const { data: user, error } = await admin.from("users").select("id, role, is_active").eq("id", session).maybeSingle();

  if (error || !user || user.role !== "admin" || !user.is_active) {
    throw new Error("Akses hanya untuk admin.");
  }

  return user;
}

export type AdminMesinCustomer = {
  id: string;
  nama: string;
};

export type AdminMesin = {
  id: string;
  customer_id: string;
  tipe_mesin: string;
  nomor_seri: string;
  customer: AdminMesinCustomer | null;
};

export async function getAdminMesin(): Promise<AdminMesin[]> {
  await requireAdmin();

  const supabase = createSupabaseAdmin();

  const { data, error } = await supabase
    .from("mesin")
    .select(
      `
      id,
      customer_id,
      tipe_mesin,
      nomor_seri,
      customer (
        id,
        nama
      )
    `,
    )
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);

  return (data ?? []).map((item: any) => ({
    id: item.id,
    customer_id: item.customer_id,
    tipe_mesin: item.tipe_mesin,
    nomor_seri: item.nomor_seri,
    customer: Array.isArray(item.customer) ? (item.customer[0] ?? null) : (item.customer ?? null),
  }));
}

export async function getAdminMesinCustomers(): Promise<AdminMesinCustomer[]> {
  await requireAdmin();

  const supabase = createSupabaseAdmin();

  const { data, error } = await supabase.from("customer").select("id, nama").order("nama", { ascending: true });

  if (error) throw new Error(error.message);

  return data ?? [];
}

function getValues(formData: FormData) {
  return {
    customer_id: String(formData.get("customer_id") ?? "").trim(),
    tipe_mesin: String(formData.get("tipe_mesin") ?? "").trim(),
    nomor_seri: String(formData.get("nomor_seri") ?? "").trim(),
  };
}

export async function createAdminMesin(formData: FormData) {
  await requireAdmin();

  const values = getValues(formData);
  const parsed = mesinSchema.safeParse(values);

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const supabase = createSupabaseAdmin();

  const { error } = await supabase.from("mesin").insert(values);

  if (error) {
    console.error("CREATE ADMIN MESIN ERROR:", error);
    return { success: false, error: "Gagal menambahkan mesin." };
  }

  revalidatePath("/admin/mesin");
  revalidatePath("/mesin");

  return { success: true };
}

export async function updateAdminMesin(formData: FormData) {
  await requireAdmin();

  const id = String(formData.get("id") ?? "").trim();
  if (!id) return { success: false, error: "ID mesin tidak valid." };

  const values = getValues(formData);
  const parsed = mesinSchema.safeParse(values);

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const supabase = createSupabaseAdmin();

  const { error } = await supabase.from("mesin").update(values).eq("id", id);

  if (error) {
    console.error("UPDATE ADMIN MESIN ERROR:", error);
    return { success: false, error: "Gagal mengubah mesin." };
  }

  revalidatePath("/admin/mesin");
  revalidatePath("/mesin");

  return { success: true };
}

export async function deleteAdminMesin(formData: FormData) {
  await requireAdmin();

  const id = String(formData.get("id") ?? "").trim();
  if (!id) return { success: false, error: "ID mesin tidak valid." };

  const supabase = createSupabaseAdmin();

  const { data: existing } = await supabase.from("mesin").select("id").eq("id", id).maybeSingle();

  if (!existing) {
    return { success: false, error: "Mesin tidak ditemukan." };
  }

  const { error } = await supabase.from("mesin").delete().eq("id", id);

  if (error) {
    console.error("DELETE ADMIN MESIN ERROR:", error);
    return { success: false, error: "Gagal menghapus mesin." };
  }

  revalidatePath("/admin/mesin");
  revalidatePath("/mesin");

  return { success: true };
}
