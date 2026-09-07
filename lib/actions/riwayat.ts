"use server";

import { createSupabaseAdmin } from "@/lib/supabase/admin";
import { getSession } from "@/lib/auth/session";

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

  const supabase = createSupabaseAdmin();

  const { data: user, error } = await supabase.from("users").select("id,username,nama,role,is_active").eq("id", Number(session)).maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!user || user.role !== "teknisi" || !user.is_active) {
    throw new Error("Akses teknisi tidak valid.");
  }

  return user as CurrentTechnician;
}

export async function getRiwayat() {
  const user = await requireTechnician();

  const supabase = createSupabaseAdmin();

  const { data, error } = await supabase.from("report_harian").select("tanggal").eq("created_by", user.id).order("tanggal", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  const map = new Map<
    string,
    {
      tanggal: string;
      total: number;
    }
  >();

  data.forEach((item) => {
    if (map.has(item.tanggal)) {
      map.get(item.tanggal)!.total++;
    } else {
      map.set(item.tanggal, {
        tanggal: item.tanggal,
        total: 1,
      });
    }
  });

  return Array.from(map.values());
}
