"use server";

import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { createSupabaseServer } from "@/lib/supabase/server";

export type Teknisi = {
  id: number;
  username: string;
  nama: string;
  wilayah: string | null;
  role: "teknisi";
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type ActionResult = {
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

/*
|--------------------------------------------------------------------------
| GET ALL TEKNISI
|--------------------------------------------------------------------------
*/

export async function getTeknisi(): Promise<Teknisi[]> {
  await requireAdmin();

  const supabase = createSupabaseServer();

  const { data, error } = await supabase.from("users").select("id, username, nama, wilayah, role, is_active, created_at, updated_at").eq("role", "teknisi").order("created_at", { ascending: false });

  if (error) {
    throw new Error("Gagal mengambil data teknisi.");
  }

  return (data ?? []) as Teknisi[];
}

/*
|--------------------------------------------------------------------------
| CREATE TEKNISI
|--------------------------------------------------------------------------
*/

export async function createTeknisi(formData: FormData): Promise<ActionResult> {
  await requireAdmin();

  const nama = String(formData.get("nama") ?? "").trim();
  const username = String(formData.get("username") ?? "")
    .trim()
    .toLowerCase();
  const wilayah = String(formData.get("wilayah") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const passwordConfirmation = String(formData.get("password_confirmation") ?? "");

  if (!nama) {
    return {
      success: false,
      error: "Nama teknisi wajib diisi.",
    };
  }

  if (!username) {
    return {
      success: false,
      error: "Username wajib diisi.",
    };
  }

  if (!wilayah) {
    return {
      success: false,
      error: "Wilayah wajib dipilih.",
    };
  }

  if (!password) {
    return {
      success: false,
      error: "Password wajib diisi.",
    };
  }

  if (password.length < 8) {
    return {
      success: false,
      error: "Password minimal 8 karakter.",
    };
  }

  if (password !== passwordConfirmation) {
    return {
      success: false,
      error: "Konfirmasi password tidak cocok.",
    };
  }

  const supabase = createSupabaseServer();

  /*
   * Cek username
   */
  const { data: existingUser } = await supabase.from("users").select("id").eq("username", username).maybeSingle();

  if (existingUser) {
    return {
      success: false,
      error: "Username sudah digunakan.",
    };
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const { error } = await supabase.from("users").insert({
    username,
    password: hashedPassword,
    nama,
    wilayah,
    role: "teknisi",
    is_active: true,
  });

  if (error) {
    console.error("CREATE TEKNISI ERROR:", error);

    return {
      success: false,
      error: "Gagal menambahkan teknisi.",
    };
  }

  revalidatePath("/admin/teknisi");
  revalidatePath("/admin/dashboard");

  return {
    success: true,
  };
}

/*
|--------------------------------------------------------------------------
| UPDATE TEKNISI
|--------------------------------------------------------------------------
*/

export async function updateTeknisi(formData: FormData): Promise<ActionResult> {
  await requireAdmin();

  const id = Number(formData.get("id"));
  const nama = String(formData.get("nama") ?? "").trim();
  const username = String(formData.get("username") ?? "")
    .trim()
    .toLowerCase();
  const wilayah = String(formData.get("wilayah") ?? "").trim();

  const password = String(formData.get("password") ?? "");
  const passwordConfirmation = String(formData.get("password_confirmation") ?? "");

  if (!id || Number.isNaN(id)) {
    return {
      success: false,
      error: "ID teknisi tidak valid.",
    };
  }

  if (!nama) {
    return {
      success: false,
      error: "Nama teknisi wajib diisi.",
    };
  }

  if (!username) {
    return {
      success: false,
      error: "Username wajib diisi.",
    };
  }

  if (!wilayah) {
    return {
      success: false,
      error: "Wilayah wajib dipilih.",
    };
  }

  const supabase = createSupabaseServer();

  /*
   * Pastikan target adalah teknisi
   */
  const { data: teknisi, error: teknisiError } = await supabase.from("users").select("id, role").eq("id", id).single();

  if (teknisiError || !teknisi || teknisi.role !== "teknisi") {
    return {
      success: false,
      error: "Teknisi tidak ditemukan.",
    };
  }

  /*
   * Cek username dipakai user lain
   */
  const { data: duplicateUser } = await supabase.from("users").select("id").eq("username", username).neq("id", id).maybeSingle();

  if (duplicateUser) {
    return {
      success: false,
      error: "Username sudah digunakan oleh user lain.",
    };
  }

  /*
   * Update data utama
   */
  const { error: updateError } = await supabase
    .from("users")
    .update({
      nama,
      username,
      wilayah,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (updateError) {
    console.error("UPDATE TEKNISI ERROR:", updateError);

    return {
      success: false,
      error: "Gagal memperbarui data teknisi.",
    };
  }

  /*
   * Password opsional saat edit
   */
  if (password) {
    if (password.length < 8) {
      return {
        success: false,
        error: "Password baru minimal 8 karakter.",
      };
    }

    if (password !== passwordConfirmation) {
      return {
        success: false,
        error: "Konfirmasi password baru tidak cocok.",
      };
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const { error: passwordError } = await supabase
      .from("users")
      .update({
        password: hashedPassword,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (passwordError) {
      console.error("RESET PASSWORD ERROR:", passwordError);

      return {
        success: false,
        error: "Data berhasil diperbarui, tetapi password gagal diubah.",
      };
    }
  }

  revalidatePath("/admin/teknisi");
  revalidatePath("/admin/dashboard");

  return {
    success: true,
  };
}

/*
|--------------------------------------------------------------------------
| TOGGLE ACTIVE / NONACTIVE
|--------------------------------------------------------------------------
*/

export async function toggleTeknisi(formData: FormData): Promise<ActionResult> {
  await requireAdmin();

  const id = Number(formData.get("id"));

  if (!id || Number.isNaN(id)) {
    return {
      success: false,
      error: "ID teknisi tidak valid.",
    };
  }

  const supabase = createSupabaseServer();

  const { data: teknisi, error } = await supabase.from("users").select("id, role, is_active").eq("id", id).single();

  if (error || !teknisi || teknisi.role !== "teknisi") {
    return {
      success: false,
      error: "Teknisi tidak ditemukan.",
    };
  }

  const { error: updateError } = await supabase
    .from("users")
    .update({
      is_active: !teknisi.is_active,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (updateError) {
    console.error("TOGGLE TEKNISI ERROR:", updateError);

    return {
      success: false,
      error: "Gagal mengubah status teknisi.",
    };
  }

  revalidatePath("/admin/teknisi");
  revalidatePath("/admin/dashboard");

  return {
    success: true,
  };
}
