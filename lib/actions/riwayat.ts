"use server";

import { createSupabaseServer } from "@/lib/supabase/server";

export async function getRiwayat() {
  const supabase = createSupabaseServer();

  const { data, error } = await supabase.from("report_harian").select("tanggal").order("tanggal", { ascending: false });

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
