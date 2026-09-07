"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { createSupabaseServer } from "@/lib/supabase/server";
import { createSupabaseAdmin } from "@/lib/supabase/admin";

export type AdminTechnician = {
  id: number;
  nama: string;
  username: string;
};

export type AdminCustomer = {
  id: string;
  nama: string;
  alamat: string;
  teknisi: AdminTechnician[];
};

export type CustomerActionResult = {
  success: boolean;
  error?: string;
};

async function requireAdmin() {
  const cookieStore = await cookies();
  const session = cookieStore.get("session")?.value;

  if (!session) {
    redirect("/login");
  }

  const supabase = createSupabaseServer();

  const { data: user, error } = await supabase.from("users").select("id, role, is_active").eq("id", session).single();

  if (error || !user || user.role !== "admin" || user.is_active === false) {
    redirect("/dashboard");
  }

  return user;
}

function getSelectedTechnicianIds(formData: FormData) {
  return Array.from(
    new Set(
      formData
        .getAll("teknisi_ids")
        .map((value) => Number(value))
        .filter((id) => Number.isInteger(id) && id > 0),
    ),
  );
}

async function validateTechnicians(supabase: ReturnType<typeof createSupabaseAdmin>, ids: number[]) {
  if (ids.length === 0) {
    return { valid: false, error: "Pilih minimal satu teknisi." };
  }

  const { data, error } = await supabase.from("users").select("id").eq("role", "teknisi").eq("is_active", true).in("id", ids);

  if (error) {
    console.error("VALIDATE TECHNICIAN ERROR:", error);
    return { valid: false, error: "Gagal memeriksa teknisi." };
  }

  if ((data ?? []).length !== ids.length) {
    return {
      valid: false,
      error: "Ada teknisi yang tidak valid atau sudah tidak aktif.",
    };
  }

  return { valid: true };
}

/*
|--------------------------------------------------------------------------
| GET TEKNISI
|--------------------------------------------------------------------------
*/

export async function getAdminTeknisi(): Promise<AdminTechnician[]> {
  await requireAdmin();

  const supabase = createSupabaseAdmin();

  const { data, error } = await supabase.from("users").select("id, nama, username").eq("role", "teknisi").eq("is_active", true).order("nama", { ascending: true });

  if (error) {
    console.error("GET TEKNISI ERROR:", error);
    throw new Error("Gagal mengambil data teknisi.");
  }

  return (data ?? []) as AdminTechnician[];
}

/*
|--------------------------------------------------------------------------
| GET CUSTOMER
|--------------------------------------------------------------------------
*/

export async function getAdminCustomers(): Promise<AdminCustomer[]> {
  await requireAdmin();

  const supabase = createSupabaseAdmin();

  const [{ data: customers, error: customerError }, { data: assignments, error: assignmentError }] = await Promise.all([
    supabase.from("customer").select("id, nama, alamat").order("nama", { ascending: true }),

    supabase.from("customer_teknisi").select("customer_id, teknisi_id"),
  ]);

  if (customerError) {
    console.error("GET CUSTOMER ERROR:", customerError);
    throw new Error("Gagal mengambil data customer.");
  }

  if (assignmentError) {
    console.error("GET CUSTOMER ASSIGNMENT ERROR:", assignmentError);
    throw new Error("Gagal mengambil data teknisi customer.");
  }

  const technicianIds = Array.from(new Set((assignments ?? []).map((item) => Number(item.teknisi_id))));

  let technicians: AdminTechnician[] = [];

  if (technicianIds.length > 0) {
    const { data, error } = await supabase.from("users").select("id, nama, username").in("id", technicianIds);

    if (error) {
      console.error("GET ASSIGNED TECHNICIAN ERROR:", error);
      throw new Error("Gagal mengambil teknisi customer.");
    }

    technicians = (data ?? []) as AdminTechnician[];
  }

  const technicianMap = new Map(technicians.map((technician) => [technician.id, technician]));

  const assignmentMap = new Map<string, AdminTechnician[]>();

  for (const assignment of assignments ?? []) {
    const technician = technicianMap.get(Number(assignment.teknisi_id));

    if (!technician) continue;

    const customerId = String(assignment.customer_id);
    const current = assignmentMap.get(customerId) ?? [];

    current.push(technician);
    assignmentMap.set(customerId, current);
  }

  return (customers ?? []).map((customer) => ({
    id: String(customer.id),
    nama: customer.nama,
    alamat: customer.alamat,
    teknisi: assignmentMap.get(String(customer.id)) ?? [],
  }));
}

/*
|--------------------------------------------------------------------------
| CREATE CUSTOMER
|--------------------------------------------------------------------------
*/

export async function createAdminCustomer(formData: FormData): Promise<CustomerActionResult> {
  await requireAdmin();

  const nama = String(formData.get("nama") ?? "").trim();
  const alamat = String(formData.get("alamat") ?? "").trim();
  const teknisiIds = getSelectedTechnicianIds(formData);

  if (!nama) {
    return { success: false, error: "Nama customer wajib diisi." };
  }

  if (nama.length < 3) {
    return {
      success: false,
      error: "Nama customer minimal 3 karakter.",
    };
  }

  if (!alamat) {
    return { success: false, error: "Alamat customer wajib diisi." };
  }

  if (alamat.length < 3) {
    return {
      success: false,
      error: "Alamat minimal 3 karakter.",
    };
  }

  const supabase = createSupabaseAdmin();

  const technicianValidation = await validateTechnicians(supabase, teknisiIds);

  if (!technicianValidation.valid) {
    return {
      success: false,
      error: technicianValidation.error,
    };
  }

  const { data: customer, error: customerError } = await supabase
    .from("customer")
    .insert({
      nama,
      alamat,
    })
    .select("id")
    .single();

  if (customerError || !customer) {
    console.error("CREATE CUSTOMER ERROR:", customerError);
    return {
      success: false,
      error: "Gagal menambahkan customer.",
    };
  }

  const { error: assignmentError } = await supabase.from("customer_teknisi").insert(
    teknisiIds.map((teknisiId) => ({
      customer_id: customer.id,
      teknisi_id: teknisiId,
    })),
  );

  if (assignmentError) {
    console.error("CREATE CUSTOMER ASSIGNMENT ERROR:", assignmentError);

    await supabase.from("customer").delete().eq("id", customer.id);

    return {
      success: false,
      error: "Customer gagal disimpan karena penugasan teknisi gagal.",
    };
  }

  revalidateCustomerPaths();

  return { success: true };
}

/*
|--------------------------------------------------------------------------
| UPDATE CUSTOMER
|--------------------------------------------------------------------------
*/

export async function updateAdminCustomer(formData: FormData): Promise<CustomerActionResult> {
  await requireAdmin();

  const id = String(formData.get("id") ?? "").trim();
  const nama = String(formData.get("nama") ?? "").trim();
  const alamat = String(formData.get("alamat") ?? "").trim();
  const teknisiIds = getSelectedTechnicianIds(formData);

  if (!id) {
    return { success: false, error: "ID customer tidak valid." };
  }

  if (!nama) {
    return { success: false, error: "Nama customer wajib diisi." };
  }

  if (nama.length < 3) {
    return {
      success: false,
      error: "Nama customer minimal 3 karakter.",
    };
  }

  if (!alamat) {
    return { success: false, error: "Alamat customer wajib diisi." };
  }

  if (alamat.length < 3) {
    return {
      success: false,
      error: "Alamat minimal 3 karakter.",
    };
  }

  const supabase = createSupabaseAdmin();

  const technicianValidation = await validateTechnicians(supabase, teknisiIds);

  if (!technicianValidation.valid) {
    return {
      success: false,
      error: technicianValidation.error,
    };
  }

  const { data: existingCustomer, error: findError } = await supabase.from("customer").select("id").eq("id", id).maybeSingle();

  if (findError || !existingCustomer) {
    return {
      success: false,
      error: "Customer tidak ditemukan.",
    };
  }

  const { data: oldAssignments, error: oldAssignmentError } = await supabase.from("customer_teknisi").select("teknisi_id").eq("customer_id", id);

  if (oldAssignmentError) {
    console.error("GET OLD ASSIGNMENT ERROR:", oldAssignmentError);
    return {
      success: false,
      error: "Gagal mengambil penugasan teknisi lama.",
    };
  }

  const { error: customerError } = await supabase
    .from("customer")
    .update({
      nama,
      alamat,
    })
    .eq("id", id);

  if (customerError) {
    console.error("UPDATE CUSTOMER ERROR:", customerError);
    return {
      success: false,
      error: "Gagal memperbarui customer.",
    };
  }

  const { error: deleteAssignmentError } = await supabase.from("customer_teknisi").delete().eq("customer_id", id);

  if (deleteAssignmentError) {
    console.error("DELETE CUSTOMER ASSIGNMENT ERROR:", deleteAssignmentError);

    return {
      success: false,
      error: "Data customer berhasil diperbarui, tetapi teknisi gagal diperbarui.",
    };
  }

  const { error: insertAssignmentError } = await supabase.from("customer_teknisi").insert(
    teknisiIds.map((teknisiId) => ({
      customer_id: id,
      teknisi_id: teknisiId,
    })),
  );

  if (insertAssignmentError) {
    console.error("UPDATE CUSTOMER ASSIGNMENT ERROR:", insertAssignmentError);

    // Coba kembalikan assignment lama agar data tidak kehilangan teknisi.
    const oldIds = (oldAssignments ?? []).map((item) => Number(item.teknisi_id)).filter((value) => Number.isInteger(value) && value > 0);

    if (oldIds.length > 0) {
      await supabase.from("customer_teknisi").insert(
        oldIds.map((teknisiId) => ({
          customer_id: id,
          teknisi_id: teknisiId,
        })),
      );
    }

    return {
      success: false,
      error: "Teknisi gagal diperbarui. Penugasan lama dikembalikan.",
    };
  }

  revalidateCustomerPaths();

  return { success: true };
}

/*
|--------------------------------------------------------------------------
| DELETE CUSTOMER
|--------------------------------------------------------------------------
*/

export async function deleteAdminCustomer(formData: FormData): Promise<CustomerActionResult> {
  await requireAdmin();

  const id = String(formData.get("id") ?? "").trim();

  if (!id) {
    return { success: false, error: "ID customer tidak valid." };
  }

  const supabase = createSupabaseAdmin();

  const { data: existingCustomer, error: findError } = await supabase.from("customer").select("id").eq("id", id).maybeSingle();

  if (findError || !existingCustomer) {
    return { success: false, error: "Customer tidak ditemukan." };
  }

  // Assignment customer_teknisi ikut terhapus karena FK menggunakan ON DELETE CASCADE.
  const { error } = await supabase.from("customer").delete().eq("id", id);

  if (error) {
    console.error("DELETE CUSTOMER ERROR:", error);
    return {
      success: false,
      error: "Gagal menghapus customer.",
    };
  }

  revalidateCustomerPaths();

  return { success: true };
}

/*
|--------------------------------------------------------------------------
| REVALIDATE
|--------------------------------------------------------------------------
*/

function revalidateCustomerPaths() {
  revalidatePath("/admin/customer");
  revalidatePath("/admin/dashboard");

  revalidatePath("/customer");
  revalidatePath("/mesin");
  revalidatePath("/report");
  revalidatePath("/dashboard");
}
