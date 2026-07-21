"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { createSupabaseServer } from "@/lib/supabase/server";
import { comparePassword } from "./hash";

type LoginState = {
  error: string;
};

export async function login(prevState: LoginState, formData: FormData): Promise<LoginState> {
  const username = String(formData.get("username") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!username || !password) {
    return {
      error: "Username dan password wajib diisi.",
    };
  }

  const supabase = createSupabaseServer();

  const { data: user, error } = await supabase.from("users").select("*").eq("username", username).single();

  if (error || !user) {
    return {
      error: "Username tidak ditemukan.",
    };
  }

  const valid = await comparePassword(password, user.password);

  if (!valid) {
    return {
      error: "Password salah.",
    };
  }

  const cookieStore = await cookies();

  cookieStore.set("session", String(user.id), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 hari
  });

  redirect("/dashboard");
}
