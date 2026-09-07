"use server";

import { createSupabaseAdmin } from "@/lib/supabase/admin";
import { getSession } from "@/lib/auth/session";

export async function getSidebarUser() {
  const session = await getSession();

  if (!session) {
    return null;
  }

  const supabase = createSupabaseAdmin();

  const { data, error } = await supabase.from("users").select("id,nama,username,role,is_active").eq("id", Number(session)).maybeSingle();

  if (error || !data || !data.is_active || data.role !== "teknisi") {
    return null;
  }

  return {
    nama: data.nama,
    username: data.username,
  };
}
