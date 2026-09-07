"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServer } from "@/lib/supabase/server";
import { createSupabaseAdmin } from "@/lib/supabase/admin";
import { getSession } from "@/lib/auth/session";
import { customerSchema } from "@/lib/validations/customer";

type CurrentTechnician = {
  id: number;
  username: string;
  nama: string;
  role: "teknisi";
  is_active: boolean;
};

async function requireTechnician(): Promise<CurrentTechnician> {
  const session = await getSession();

  if (!session) {
    throw new Error("Sesi login tidak ditemukan.");
  }

  const supabase = createSupabaseServer();

  const { data: user, error } = await supabase.from("users").select("id,username,nama,role,is_active").eq("id", Number(session)).maybeSingle();

  if (error || !user) {
    throw new Error("User tidak ditemukan.");
  }

  if (user.role !== "teknisi" || !user.is_active) {
    throw new Error("Akses hanya untuk teknisi aktif.");
  }

  return user as CurrentTechnician;
}

async function getAssignedCustomerIds(teknisiId: number): Promise<string[]> {
  const admin = createSupabaseAdmin();

  const { data, error } = await admin.from("customer_teknisi").select("customer_id").eq("teknisi_id", teknisiId);

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map((item) => item.customer_id);
}

async function ensureCustomerAssigned(customerId: string, teknisiId: number) {
  const admin = createSupabaseAdmin();

  const { data, error } = await admin.from("customer_teknisi").select("id").eq("customer_id", customerId).eq("teknisi_id", teknisiId).maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    throw new Error("Customer ini tidak ditugaskan kepada Anda.");
  }
}

/**
 * Customer yang tampil di halaman teknisi hanya customer
 * yang di-assign melalui customer_teknisi.
 */
export async function getCustomers() {
  const user = await requireTechnician();
  const customerIds = await getAssignedCustomerIds(user.id);

  if (customerIds.length === 0) {
    return [];
  }

  const admin = createSupabaseAdmin();

  const { data, error } = await admin.from("customer").select("*").in("id", customerIds).order("nama", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
}

/**
 * Teknisi dapat menambahkan customer baru.
 * Customer otomatis di-assign ke teknisi yang sedang login.
 */
export async function createCustomer(formData: FormData) {
  const user = await requireTechnician();

  const nama = formData.get("nama")?.toString().trim() || "";
  const alamat = formData.get("alamat")?.toString().trim() || "";

  const parsed = customerSchema.safeParse({ nama, alamat });

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0].message);
  }

  const admin = createSupabaseAdmin();

  const { data: customer, error: customerError } = await admin.from("customer").insert({ nama, alamat }).select().single();

  if (customerError || !customer) {
    throw new Error(customerError?.message ?? "Gagal menambahkan customer.");
  }

  const { error: assignmentError } = await admin.from("customer_teknisi").insert({
    customer_id: customer.id,
    teknisi_id: user.id,
  });

  if (assignmentError) {
    await admin.from("customer").delete().eq("id", customer.id);
    throw new Error("Customer gagal ditugaskan ke teknisi.");
  }

  revalidatePath("/customer");
  revalidatePath("/mesin");
  revalidatePath("/report");
  revalidatePath("/dashboard");
  revalidatePath("/admin/customer");
  revalidatePath("/admin/dashboard");
}

/**
 * Teknisi hanya boleh mengubah customer yang memang ditugaskan kepadanya.
 */
export async function updateCustomer(formData: FormData) {
  const user = await requireTechnician();

  const id = formData.get("id")?.toString().trim() || "";
  const nama = formData.get("nama")?.toString().trim() || "";
  const alamat = formData.get("alamat")?.toString().trim() || "";

  if (!id) {
    throw new Error("ID customer tidak valid.");
  }

  const parsed = customerSchema.safeParse({ nama, alamat });

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0].message);
  }

  await ensureCustomerAssigned(id, user.id);

  const admin = createSupabaseAdmin();

  const { error } = await admin.from("customer").update({ nama, alamat }).eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/customer");
  revalidatePath("/mesin");
  revalidatePath("/report");
  revalidatePath("/dashboard");
  revalidatePath("/admin/customer");
  revalidatePath("/admin/dashboard");
}

/**
 * Delete sengaja tidak tersedia untuk teknisi.
 * Riwayat report harus tetap aman dan penghapusan customer
 * dilakukan melalui Admin.
 */
export async function deleteCustomer(_id: string) {
  await requireTechnician();
  throw new Error("Penghapusan customer hanya dapat dilakukan oleh Admin.");
}

/**
 * Quick create untuk kebutuhan modul lain.
 * Customer tetap otomatis masuk assignment teknisi yang login.
 */
export async function createCustomerQuick(nama: string, alamat: string) {
  const user = await requireTechnician();

  const parsed = customerSchema.safeParse({
    nama: nama.trim(),
    alamat: alamat.trim(),
  });

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0].message);
  }

  const admin = createSupabaseAdmin();

  const { data: customer, error: customerError } = await admin
    .from("customer")
    .insert({
      nama: nama.trim(),
      alamat: alamat.trim(),
    })
    .select()
    .single();

  if (customerError || !customer) {
    throw new Error(customerError?.message ?? "Gagal menambahkan customer.");
  }

  const { error: assignmentError } = await admin.from("customer_teknisi").insert({
    customer_id: customer.id,
    teknisi_id: user.id,
  });

  if (assignmentError) {
    await admin.from("customer").delete().eq("id", customer.id);
    throw new Error("Customer gagal ditugaskan ke teknisi.");
  }

  revalidatePath("/customer");
  revalidatePath("/mesin");
  revalidatePath("/report");
  revalidatePath("/dashboard");

  return customer;
}

/**
 * Dipertahankan untuk kompatibilitas dengan modul lama.
 * Customer + mesin baru otomatis di-assign ke teknisi yang login.
 */
export async function createCustomerWithMesin(nama: string, alamat: string, tipe_mesin: string, nomor_seri: string) {
  const user = await requireTechnician();

  const customerParsed = customerSchema.safeParse({
    nama: nama.trim(),
    alamat: alamat.trim(),
  });

  if (!customerParsed.success) {
    throw new Error(customerParsed.error.issues[0].message);
  }

  if (!tipe_mesin.trim()) {
    throw new Error("Tipe mesin wajib diisi.");
  }

  if (!nomor_seri.trim()) {
    throw new Error("Nomor seri wajib diisi.");
  }

  const admin = createSupabaseAdmin();

  const { data: customer, error: customerError } = await admin
    .from("customer")
    .insert({
      nama: nama.trim(),
      alamat: alamat.trim(),
    })
    .select()
    .single();

  if (customerError || !customer) {
    throw new Error(customerError?.message ?? "Gagal menambahkan customer.");
  }

  const { error: assignmentError } = await admin.from("customer_teknisi").insert({
    customer_id: customer.id,
    teknisi_id: user.id,
  });

  if (assignmentError) {
    await admin.from("customer").delete().eq("id", customer.id);
    throw new Error("Customer gagal ditugaskan ke teknisi.");
  }

  const { data: mesin, error: mesinError } = await admin
    .from("mesin")
    .insert({
      customer_id: customer.id,
      tipe_mesin: tipe_mesin.trim(),
      nomor_seri: nomor_seri.trim(),
    })
    .select()
    .single();

  if (mesinError || !mesin) {
    await admin.from("customer").delete().eq("id", customer.id);
    throw new Error(mesinError?.message ?? "Gagal menambahkan mesin.");
  }

  revalidatePath("/customer");
  revalidatePath("/mesin");
  revalidatePath("/report");
  revalidatePath("/dashboard");
  revalidatePath("/admin/customer");
  revalidatePath("/admin/mesin");
  revalidatePath("/admin/dashboard");

  return { customer, mesin };
}
