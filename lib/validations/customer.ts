import { z } from "zod";

export const customerSchema = z.object({
  nama: z.string().min(3, "Minimal 3 karakter"),

  alamat: z.string().min(3, "Minimal 3 karakter"),
});

export type CustomerSchema = z.infer<typeof customerSchema>;
