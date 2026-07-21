"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServer } from "@/lib/supabase/server";
import { customerSchema } from "@/lib/validations/customer";

export async function getCustomers() {
  const supabase = createSupabaseServer();

  const { data, error } = await supabase.from("customer").select("*").order("nama", {
    ascending: true,
  });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function createCustomer(formData: FormData) {
  const supabase = createSupabaseServer();

  const nama = formData.get("nama")?.toString() || "";
  const alamat = formData.get("alamat")?.toString() || "";

  const parsed = customerSchema.safeParse({
    nama,
    alamat,
  });

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0].message);
  }

  const { error } = await supabase.from("customer").insert({
    nama,
    alamat,
  });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/customer");
}

export async function updateCustomer(formData: FormData) {
  const supabase = createSupabaseServer();

  const id = formData.get("id")?.toString() || "";

  const nama = formData.get("nama")?.toString() || "";

  const alamat = formData.get("alamat")?.toString() || "";

  const parsed = customerSchema.safeParse({
    nama,
    alamat,
  });

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0].message);
  }

  const { error } = await supabase
    .from("customer")
    .update({
      nama,
      alamat,
    })
    .eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/customer");
}

export async function deleteCustomer(id: string) {
  const supabase = createSupabaseServer();

  const { error } = await supabase.from("customer").delete().eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/customer");
}
