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
  revalidatePath("/mesin");
  revalidatePath("/report");
  revalidatePath("/dashboard");
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
  revalidatePath("/mesin");
  revalidatePath("/report");
  revalidatePath("/dashboard");
}

export async function deleteCustomer(id: string) {
  const supabase = createSupabaseServer();

  const { error } = await supabase.from("customer").delete().eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/customer");
  revalidatePath("/mesin");
  revalidatePath("/report");
  revalidatePath("/dashboard");
}

export async function createCustomerQuick(nama: string, alamat: string) {
  const supabase = createSupabaseServer();

  const { data, error } = await supabase
    .from("customer")
    .insert({
      nama,
      alamat,
    })
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/customer");
  revalidatePath("/mesin");
  revalidatePath("/report");
  revalidatePath("/dashboard");

  return data;
}

export async function createCustomerWithMesin(nama: string, alamat: string, tipe_mesin: string, nomor_seri: string) {
  const supabase = createSupabaseServer();

  // Validasi customer
  const customerParsed = customerSchema.safeParse({
    nama,
    alamat,
  });

  if (!customerParsed.success) {
    throw new Error(customerParsed.error.issues[0].message);
  }

  // Simpan customer
  const { data: customer, error: customerError } = await supabase
    .from("customer")
    .insert({
      nama,
      alamat,
    })
    .select()
    .single();

  if (customerError) {
    throw new Error(customerError.message);
  }

  // Simpan mesin pertama
  const { data: mesin, error: mesinError } = await supabase
    .from("mesin")
    .insert({
      customer_id: customer.id,
      tipe_mesin,
      nomor_seri,
    })
    .select()
    .single();

  if (mesinError) {
    throw new Error(mesinError.message);
  }

  revalidatePath("/customer");
  revalidatePath("/mesin");
  revalidatePath("/report");
  revalidatePath("/dashboard");

  return {
    customer,
    mesin,
  };
}
