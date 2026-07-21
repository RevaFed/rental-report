"use server";

import { createSupabaseServer } from "@/lib/supabase/server";
import bcrypt from "bcryptjs";

type State = {
  success: string;
  error: string;
};

export async function updateProfile(prevState: State, formData: FormData): Promise<State> {
  const id = Number(formData.get("id"));

  const nama = String(formData.get("nama") ?? "").trim();

  const username = String(formData.get("username") ?? "").trim();

  if (!nama || !username) {
    return {
      success: "",
      error: "Semua field wajib diisi.",
    };
  }

  const supabase = createSupabaseServer();

  const { error } = await supabase
    .from("users")
    .update({
      nama,
      username,
    })
    .eq("id", id);

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

export async function updatePassword(prevState: State, formData: FormData): Promise<State> {
  const id = Number(formData.get("id"));

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

  const supabase = createSupabaseServer();

  const { data: user } = await supabase.from("users").select("password").eq("id", id).single();

  if (!user) {
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
    })
    .eq("id", id);

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
