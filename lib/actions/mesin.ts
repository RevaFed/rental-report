"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseAdmin } from "@/lib/supabase/admin";
import { getSession } from "@/lib/auth/session";
import { mesinSchema } from "@/lib/validations/mesin";

/*
|--------------------------------------------------------------------------
| AUTH
|--------------------------------------------------------------------------
*/

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

  const { data: user, error } = await supabase.from("users").select("id, role, is_active").eq("id", userId).maybeSingle();

  if (error || !user || user.role !== "teknisi" || !user.is_active) {
    throw new Error("Akses teknisi tidak valid.");
  }

  return {
    supabase,
    user,
  };
}

/*
|--------------------------------------------------------------------------
| CUSTOMER YANG DITUGASKAN KE TEKNISI
|--------------------------------------------------------------------------
*/

async function getAssignedCustomerIds(supabase: ReturnType<typeof createSupabaseAdmin>, teknisiId: number) {
  const { data, error } = await supabase.from("customer_teknisi").select("customer_id").eq("teknisi_id", teknisiId);

  if (error) {
    throw new Error(error.message);
  }

  return [...new Set((data ?? []).map((item) => item.customer_id))];
}

/*
|--------------------------------------------------------------------------
| VALIDASI CUSTOMER
|--------------------------------------------------------------------------
*/

async function ensureCustomerAssigned(supabase: ReturnType<typeof createSupabaseAdmin>, teknisiId: number, customerId: string) {
  const { data, error } = await supabase.from("customer_teknisi").select("id").eq("teknisi_id", teknisiId).eq("customer_id", customerId).maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    throw new Error("Customer tersebut tidak ditugaskan kepada Anda.");
  }
}

/*
|--------------------------------------------------------------------------
| GET MESIN AKTIF
|--------------------------------------------------------------------------
|
| Hanya mesin dengan status "aktif".
|
| Mesin yang sudah ditarik tidak muncul lagi di Master Mesin.
|--------------------------------------------------------------------------
*/

export async function getMesin() {
  const { supabase, user } = await requireTechnician();

  const customerIds = await getAssignedCustomerIds(supabase, user.id);

  if (customerIds.length === 0) {
    return [];
  }

  const { data, error } = await supabase
    .from("mesin")
    .select(
      `
        id,
        customer_id,
        tipe_mesin,
        nomor_seri,
        status,
        alasan_penarikan,
        ditarik_at,
        customer (
          id,
          nama
        )
      `,
    )
    .in("customer_id", customerIds)
    .eq("status", "aktif");

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? [])
    .map((item: any) => ({
      ...item,

      customer: Array.isArray(item.customer) ? (item.customer[0] ?? null) : item.customer,
    }))
    .sort((a, b) => {
      const customerCompare = (a.customer?.nama ?? "").localeCompare(b.customer?.nama ?? "", "id", {
        sensitivity: "base",
      });

      if (customerCompare !== 0) {
        return customerCompare;
      }

      return (a.nomor_seri ?? "").localeCompare(b.nomor_seri ?? "", "id", {
        numeric: true,
        sensitivity: "base",
      });
    });
}

/*
|--------------------------------------------------------------------------
| GET DAFTAR CUSTOMER TEKNISI
|--------------------------------------------------------------------------
*/

export async function getMesinCustomers() {
  const { supabase, user } = await requireTechnician();

  const customerIds = await getAssignedCustomerIds(supabase, user.id);

  if (customerIds.length === 0) {
    return [];
  }

  const { data, error } = await supabase.from("customer").select("id, nama, alamat").in("id", customerIds).order("nama");

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
}

/*
|--------------------------------------------------------------------------
| GET MESIN AKTIF BERDASARKAN CUSTOMER
|--------------------------------------------------------------------------
|
| Dipakai ketika memilih Customer di form.
| Mesin ditarik otomatis tidak akan muncul.
|--------------------------------------------------------------------------
*/

export async function getMesinByCustomer(customerId: string) {
  const { supabase, user } = await requireTechnician();

  await ensureCustomerAssigned(supabase, user.id, customerId);

  const { data, error } = await supabase
    .from("mesin")
    .select(
      `
        id,
        customer_id,
        tipe_mesin,
        nomor_seri,
        status,
        customer (
          id,
          nama
        )
      `,
    )
    .eq("customer_id", customerId)
    .eq("status", "aktif")
    .order("tipe_mesin", {
      ascending: true,
    });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map((item: any) => ({
    ...item,

    customer: Array.isArray(item.customer) ? (item.customer[0] ?? null) : item.customer,
  }));
}

/*
|--------------------------------------------------------------------------
| CREATE MESIN
|--------------------------------------------------------------------------
*/

export async function createMesin(formData: FormData) {
  const { supabase, user } = await requireTechnician();

  const customer_id = formData.get("customer_id")?.toString() || "";

  const tipe_mesin = formData.get("tipe_mesin")?.toString() || "";

  const nomor_seri = formData.get("nomor_seri")?.toString() || "";

  const parsed = mesinSchema.safeParse({
    customer_id,
    tipe_mesin,
    nomor_seri,
  });

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0].message);
  }

  await ensureCustomerAssigned(supabase, user.id, customer_id);

  const { error } = await supabase.from("mesin").insert({
    customer_id,
    tipe_mesin,
    nomor_seri,

    /*
     * Explicit supaya mesin baru
     * selalu aktif.
     */
    status: "aktif",

    alasan_penarikan: null,
    ditarik_at: null,
  });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/mesin");
  revalidatePath("/report");
  revalidatePath("/dashboard");
}

/*
|--------------------------------------------------------------------------
| UPDATE MESIN
|--------------------------------------------------------------------------
*/

export async function updateMesin(formData: FormData) {
  const { supabase, user } = await requireTechnician();

  const id = formData.get("id")?.toString() || "";

  const customer_id = formData.get("customer_id")?.toString() || "";

  const tipe_mesin = formData.get("tipe_mesin")?.toString() || "";

  const nomor_seri = formData.get("nomor_seri")?.toString() || "";

  if (!id) {
    throw new Error("ID mesin tidak valid.");
  }

  const parsed = mesinSchema.safeParse({
    customer_id,
    tipe_mesin,
    nomor_seri,
  });

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0].message);
  }

  /*
   * Ambil mesin dan statusnya.
   */
  const { data: existing, error: existingError } = await supabase.from("mesin").select("id, customer_id, status").eq("id", id).maybeSingle();

  if (existingError || !existing) {
    throw new Error("Mesin tidak ditemukan.");
  }

  /*
   * Mesin yang sudah ditarik tidak boleh
   * diedit dari Master Mesin aktif.
   */
  if (existing.status === "ditarik") {
    throw new Error("Mesin yang sudah ditarik tidak dapat diedit.");
  }

  await ensureCustomerAssigned(supabase, user.id, existing.customer_id);

  await ensureCustomerAssigned(supabase, user.id, customer_id);

  const { error } = await supabase
    .from("mesin")
    .update({
      customer_id,
      tipe_mesin,
      nomor_seri,
    })
    .eq("id", id)
    .eq("status", "aktif");

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/mesin");
  revalidatePath("/report");
  revalidatePath("/dashboard");
}

/*
|--------------------------------------------------------------------------
| TARIK MESIN
|--------------------------------------------------------------------------
|
| Mesin TIDAK dihapus.
|
| Yang dilakukan:
| - status => ditarik
| - alasan_penarikan => alasan dari user
| - ditarik_at => waktu penarikan
|
|--------------------------------------------------------------------------
*/

export async function tarikMesin(formData: FormData) {
  const { supabase, user } = await requireTechnician();

  const id = formData.get("id")?.toString().trim() || "";

  const alasan = formData.get("alasan")?.toString().trim() || "";

  if (!id) {
    throw new Error("ID mesin tidak valid.");
  }

  if (!alasan) {
    throw new Error("Alasan penarikan wajib diisi.");
  }

  if (alasan.length < 3) {
    throw new Error("Alasan penarikan minimal 3 karakter.");
  }

  /*
   * Cari mesin.
   */
  const { data: existing, error: existingError } = await supabase
    .from("mesin")
    .select(
      `
        id,
        customer_id,
        status
      `,
    )
    .eq("id", id)
    .maybeSingle();

  if (existingError || !existing) {
    throw new Error("Mesin tidak ditemukan.");
  }

  /*
   * Pastikan mesin tersebut milik
   * customer yang memang ditugaskan
   * kepada teknisi yang sedang login.
   */
  await ensureCustomerAssigned(supabase, user.id, existing.customer_id);

  if (existing.status === "ditarik") {
    throw new Error("Mesin tersebut sudah ditarik sebelumnya.");
  }

  /*
   * Tandai sebagai ditarik.
   */
  const { error } = await supabase
    .from("mesin")
    .update({
      status: "ditarik",
      alasan_penarikan: alasan,
      ditarik_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("status", "aktif");

  if (error) {
    throw new Error(error.message);
  }

  /*
   * Refresh semua halaman yang
   * bergantung pada daftar mesin.
   */
  revalidatePath("/mesin");
  revalidatePath("/report");
  revalidatePath("/dashboard");
}

/*
|--------------------------------------------------------------------------
| GET MESIN TARIKAN
|--------------------------------------------------------------------------
|
| Khusus untuk halaman:
| "Daftar Mesin Tarikan"
|
| Hanya menampilkan mesin yang:
| - customer-nya ditugaskan ke teknisi
| - status = ditarik
|--------------------------------------------------------------------------
*/

export async function getMesinTarikan() {
  const { supabase, user } = await requireTechnician();

  const customerIds = await getAssignedCustomerIds(supabase, user.id);

  if (customerIds.length === 0) {
    return [];
  }

  const { data, error } = await supabase
    .from("mesin")
    .select(
      `
        id,
        customer_id,
        tipe_mesin,
        nomor_seri,
        status,
        alasan_penarikan,
        ditarik_at,
        customer (
          id,
          nama,
          alamat
        )
      `,
    )
    .in("customer_id", customerIds)
    .eq("status", "ditarik");

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? [])
    .map((item: any) => ({
      ...item,

      customer: Array.isArray(item.customer) ? (item.customer[0] ?? null) : item.customer,
    }))
    .sort((a, b) => {
      /*
       * Mesin terbaru ditarik
       * ditampilkan paling atas.
       */
      const dateA = a.ditarik_at ? new Date(a.ditarik_at).getTime() : 0;

      const dateB = b.ditarik_at ? new Date(b.ditarik_at).getTime() : 0;

      return dateB - dateA;
    });
}

/*
|--------------------------------------------------------------------------
| DELETE MESIN
|--------------------------------------------------------------------------
|
| Tetap dipertahankan.
| Hanya mesin aktif yang bisa dihapus
| dari Master Mesin.
|--------------------------------------------------------------------------
*/

export async function deleteMesin(id: string) {
  const { supabase, user } = await requireTechnician();

  const { data: existing, error: existingError } = await supabase.from("mesin").select("id, customer_id, status").eq("id", id).maybeSingle();

  if (existingError || !existing) {
    throw new Error("Mesin tidak ditemukan.");
  }

  await ensureCustomerAssigned(supabase, user.id, existing.customer_id);

  if (existing.status === "ditarik") {
    throw new Error("Mesin yang sudah ditarik tidak dapat dihapus dari daftar aktif.");
  }

  const { error } = await supabase.from("mesin").delete().eq("id", id).eq("status", "aktif");

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/mesin");
  revalidatePath("/report");
  revalidatePath("/dashboard");
}
