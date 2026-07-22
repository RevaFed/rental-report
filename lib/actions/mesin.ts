"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServer } from "@/lib/supabase/server";
import { mesinSchema } from "@/lib/validations/mesin";

export async function getMesin() {
  const supabase = createSupabaseServer();

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
    .order("created_at", {
      ascending: false,
    });

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

      if (customerCompare !== 0) {
        return customerCompare;
      }

      return a.nomor_seri.localeCompare(b.nomor_seri, "id", { numeric: true, sensitivity: "base" });
    });
}

export async function getMesinByCustomer(customerId: string) {
  const supabase = createSupabaseServer();

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
    .order("tipe_mesin", {
      ascending: true,
    });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function createMesin(formData: FormData) {
  const supabase = createSupabaseServer();

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

  const { error } = await supabase.from("mesin").insert({
    customer_id,
    tipe_mesin,
    nomor_seri,
  });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/mesin");
}

export async function updateMesin(formData: FormData) {
  const supabase = createSupabaseServer();

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
}

export async function deleteMesin(id: string) {
  const supabase = createSupabaseServer();

  const { error } = await supabase.from("mesin").delete().eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/mesin");
}
