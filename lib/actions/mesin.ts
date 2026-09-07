"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseAdmin } from "@/lib/supabase/admin";
import { getSession } from "@/lib/auth/session";
import { mesinSchema } from "@/lib/validations/mesin";

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

  return { supabase, user };
}

async function getAssignedCustomerIds(supabase: ReturnType<typeof createSupabaseAdmin>, teknisiId: number) {
  const { data, error } = await supabase.from("customer_teknisi").select("customer_id").eq("teknisi_id", teknisiId);

  if (error) {
    throw new Error(error.message);
  }

  return [...new Set((data ?? []).map((item) => item.customer_id))];
}

async function ensureCustomerAssigned(supabase: ReturnType<typeof createSupabaseAdmin>, teknisiId: number, customerId: string) {
  const { data, error } = await supabase.from("customer_teknisi").select("id").eq("teknisi_id", teknisiId).eq("customer_id", customerId).maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    throw new Error("Customer tersebut tidak ditugaskan kepada Anda.");
  }
}

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
      customer (
        id,
        nama
      )
    `,
    )
    .in("customer_id", customerIds);

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? [])
    .map((item: any) => ({
      ...item,
      customer: Array.isArray(item.customer) ? (item.customer[0] ?? null) : item.customer,
    }))
    .sort((a, b) => {
      const customerCompare = (a.customer?.nama ?? "").localeCompare(b.customer?.nama ?? "", "id", { sensitivity: "base" });

      if (customerCompare !== 0) return customerCompare;

      return a.nomor_seri.localeCompare(b.nomor_seri, "id", {
        numeric: true,
        sensitivity: "base",
      });
    });
}

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
      customer (
        id,
        nama
      )
    `,
    )
    .eq("customer_id", customerId)
    .order("tipe_mesin", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map((item: any) => ({
    ...item,
    customer: Array.isArray(item.customer) ? (item.customer[0] ?? null) : item.customer,
  }));
}

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
  });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/mesin");
  revalidatePath("/dashboard");
}

export async function updateMesin(formData: FormData) {
  const { supabase, user } = await requireTechnician();

  const id = formData.get("id")?.toString() || "";
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

  const { data: existing, error: existingError } = await supabase.from("mesin").select("id, customer_id").eq("id", id).maybeSingle();

  if (existingError || !existing) {
    throw new Error("Mesin tidak ditemukan.");
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
    .eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/mesin");
  revalidatePath("/dashboard");
}

export async function deleteMesin(id: string) {
  const { supabase, user } = await requireTechnician();

  const { data: existing, error: existingError } = await supabase.from("mesin").select("id, customer_id").eq("id", id).maybeSingle();

  if (existingError || !existing) {
    throw new Error("Mesin tidak ditemukan.");
  }

  await ensureCustomerAssigned(supabase, user.id, existing.customer_id);

  const { error } = await supabase.from("mesin").delete().eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/mesin");
  revalidatePath("/dashboard");
}
