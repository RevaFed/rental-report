"use server";

import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { createSupabaseAdmin } from "@/lib/supabase/admin";
import { getSession } from "@/lib/auth/session";

type AdminProfile = {
  id: number;
  nama: string;
  username: string;
  role: "admin";
  is_active: boolean;
  created_at: string | null;
  updated_at: string | null;
};

async function requireAdmin() {
  const session = await getSession();

  if (!session) {
    throw new Error("Sesi login tidak ditemukan.");
  }

  const supabase = createSupabaseAdmin();

  const { data: user, error } = await supabase.from("users").select("id,nama,username,role,is_active,created_at,updated_at").eq("id", Number(session)).maybeSingle();

  if (error) {
    console.error("requireAdmin profile:", error);
    throw new Error("Gagal memeriksa akun.");
  }

  if (!user || user.role !== "admin" || !user.is_active) {
    throw new Error("Akses admin tidak valid.");
  }

  return user as AdminProfile;
}

export async function getAdminProfile(): Promise<AdminProfile> {
  return requireAdmin();
}

export async function updateAdminProfile(formData: FormData) {
  const admin = await requireAdmin();

  const nama = String(formData.get("nama") ?? "").trim();
  const username = String(formData.get("username") ?? "").trim();

  if (nama.length < 2) {
    throw new Error("Nama minimal 2 karakter.");
  }

  if (username.length < 3) {
    throw new Error("Username minimal 3 karakter.");
  }

  const supabase = createSupabaseAdmin();

  const { data: duplicate, error: duplicateError } = await supabase.from("users").select("id").eq("username", username).neq("id", admin.id).maybeSingle();

  if (duplicateError) {
    console.error("updateAdminProfile duplicate:", duplicateError);
    throw new Error("Gagal memeriksa username.");
  }

  if (duplicate) {
    throw new Error("Username sudah digunakan.");
  }

  const { error } = await supabase
    .from("users")
    .update({
      nama,
      username,
      updated_at: new Date().toISOString(),
    })
    .eq("id", admin.id);

  if (error) {
    console.error("updateAdminProfile:", error);
    throw new Error("Gagal menyimpan profile.");
  }

  revalidatePath("/admin/profile");
  revalidatePath("/admin");

  return { success: true };
}

export async function changeAdminPassword(formData: FormData) {
  const admin = await requireAdmin();

  const currentPassword = String(formData.get("current_password") ?? "");
  const newPassword = String(formData.get("new_password") ?? "");
  const confirmPassword = String(formData.get("confirm_password") ?? "");

  if (!currentPassword || !newPassword || !confirmPassword) {
    throw new Error("Semua field password wajib diisi.");
  }

  if (newPassword.length < 8) {
    throw new Error("Password baru minimal 8 karakter.");
  }

  if (newPassword !== confirmPassword) {
    throw new Error("Konfirmasi password tidak sama.");
  }

  const supabase = createSupabaseAdmin();

  const { data: account, error: accountError } = await supabase.from("users").select("password").eq("id", admin.id).maybeSingle();

  if (accountError || !account?.password) {
    console.error("changeAdminPassword account:", accountError);
    throw new Error("Gagal memeriksa password.");
  }

  const valid = await bcrypt.compare(currentPassword, account.password);

  if (!valid) {
    throw new Error("Password saat ini salah.");
  }

  const password = await bcrypt.hash(newPassword, 10);

  const { error } = await supabase
    .from("users")
    .update({
      password,
      updated_at: new Date().toISOString(),
    })
    .eq("id", admin.id);

  if (error) {
    console.error("changeAdminPassword:", error);
    throw new Error("Gagal mengubah password.");
  }

  revalidatePath("/admin/profile");

  return { success: true };
}
