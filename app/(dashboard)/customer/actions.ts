"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServer } from "@/lib/supabase/server";

export async function getCustomers() {
  const supabase = createSupabaseServer();

  const { data, error } = await supabase.from("customer").select("*").order("nama");

  if (error) throw new Error(error.message);

  return data;
}
