"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServer } from "@/lib/supabase/server";

export async function getReportMaster() {
  const supabase = createSupabaseServer();

  const { data: customers, error: customerError } = await supabase.from("customer").select("*").order("nama");

  if (customerError) {
    throw new Error(customerError.message);
  }

  const { data: mesin, error: mesinError } = await supabase.from("mesin").select("*").order("nomor_seri");

  if (mesinError) {
    throw new Error(mesinError.message);
  }

  return {
    customers,
    mesin,
  };
}

export async function deleteReport(formData: FormData) {
  const tanggal = String(formData.get("tanggal"));

  const supabase = createSupabaseServer();

  const { error } = await supabase.from("report_harian").delete().eq("tanggal", tanggal);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/riwayat");
}
