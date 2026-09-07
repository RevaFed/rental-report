"use server";

import { cookies } from "next/headers";
import { createSupabaseServer } from "@/lib/supabase/server";
import { createSupabaseAdmin } from "@/lib/supabase/admin";
import bcrypt from "bcryptjs";

type State = {
  success: string;
  error: string;
};

async function getCurrentUserId(): Promise<number | null> {
  const cookieStore = await cookies();
  const session = cookieStore.get("session")?.value;

  if (!session) return null;

  const id = Number(session);

  if (!Number.isInteger(id) || id <= 0) {
    return null;
  }

  return id;
}

async function getCurrentUser() {
  const id = await getCurrentUserId();

  if (!id) return null;

  const supabase = createSupabaseServer();

  const { data, error } = await supabase.from("users").select("id, nama, username, role, is_active, wilayah").eq("id", id).maybeSingle();

  if (error || !data || !data.is_active) {
    return null;
  }

  return data;
}

export async function getProfile() {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error("Sesi login tidak valid.");
  }

  return user;
}

export async function updateProfile(_prevState: State, formData: FormData): Promise<State> {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return {
      success: "",
      error: "Sesi login tidak valid. Silakan login kembali.",
    };
  }

  const nama = String(formData.get("nama") ?? "").trim();
  const username = String(formData.get("username") ?? "").trim();

  if (!nama || !username) {
    return {
      success: "",
      error: "Semua field wajib diisi.",
    };
  }

  const supabase = createSupabaseAdmin();

  const { data: duplicate } = await supabase.from("users").select("id").eq("username", username).neq("id", currentUser.id).maybeSingle();

  if (duplicate) {
    return {
      success: "",
      error: "Username sudah digunakan.",
    };
  }

  const { error } = await supabase
    .from("users")
    .update({
      nama,
      username,
      updated_at: new Date().toISOString(),
    })
    .eq("id", currentUser.id);

  if (error) {
    return {
      success: "",
      error: error.message,
    };
  }

  return {
    success: "Profil berhasil diperbarui.",
    error: "",
  };
}

export async function updatePassword(_prevState: State, formData: FormData): Promise<State> {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return {
      success: "",
      error: "Sesi login tidak valid. Silakan login kembali.",
    };
  }

  const oldPassword = String(formData.get("old_password") ?? "");
  const newPassword = String(formData.get("new_password") ?? "");
  const confirmPassword = String(formData.get("confirm_password") ?? "");

  if (!oldPassword || !newPassword || !confirmPassword) {
    return {
      success: "",
      error: "Semua field wajib diisi.",
    };
  }

  if (newPassword.length < 6) {
    return {
      success: "",
      error: "Password minimal 6 karakter.",
    };
  }

  if (newPassword !== confirmPassword) {
    return {
      success: "",
      error: "Konfirmasi password tidak sama.",
    };
  }

  const supabase = createSupabaseAdmin();

  const { data: user, error: userError } = await supabase.from("users").select("password").eq("id", currentUser.id).maybeSingle();

  if (userError || !user) {
    return {
      success: "",
      error: "User tidak ditemukan.",
    };
  }

  const valid = await bcrypt.compare(oldPassword, user.password);

  if (!valid) {
    return {
      success: "",
      error: "Password lama salah.",
    };
  }

  const hash = await bcrypt.hash(newPassword, 12);

  const { error } = await supabase
    .from("users")
    .update({
      password: hash,
      updated_at: new Date().toISOString(),
    })
    .eq("id", currentUser.id);

  if (error) {
    return {
      success: "",
      error: error.message,
    };
  }

  return {
    success: "Password berhasil diperbarui.",
    error: "",
  };
}
