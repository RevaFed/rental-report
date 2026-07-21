import { z } from "zod";

export const mesinSchema = z.object({
  customer_id: z.string().min(1, "Customer wajib dipilih"),

  tipe_mesin: z.string().min(2, "Tipe mesin minimal 2 karakter"),

  nomor_seri: z.string().min(2, "Nomor seri minimal 2 karakter"),
});

export type MesinSchema = z.infer<typeof mesinSchema>;
