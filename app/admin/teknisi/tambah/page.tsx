import Link from "next/link";
import { ArrowLeft, UserPlus } from "lucide-react";
import { redirect } from "next/navigation";

import { createTeknisi } from "@/lib/actions/teknisi";

type Props = {
  searchParams: Promise<{
    error?: string;
  }>;
};

async function handleCreateTeknisi(formData: FormData) {
  "use server";

  const result = await createTeknisi(formData);

  if (result.success) {
    redirect("/admin/teknisi");
  }

  const error = encodeURIComponent(result.error ?? "Gagal menambahkan teknisi.");
  redirect(`/admin/teknisi/tambah?error=${error}`);
}

export default async function TambahTeknisiPage({ searchParams }: Props) {
  const params = await searchParams;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* HEADER */}
      <div>
        <Link href="/admin/teknisi" className="mb-4 inline-flex items-center gap-2 text-sm text-gray-500 transition hover:text-black">
          <ArrowLeft size={16} />
          Kembali ke Teknisi
        </Link>

        <h1 className="text-3xl font-bold tracking-tight">Tambah Teknisi</h1>

        <p className="mt-1 text-sm text-gray-500">Buat akun baru untuk teknisi</p>
      </div>

      {/* ERROR */}
      {params.error && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{params.error}</div>}

      {/* FORM */}
      <form action={handleCreateTeknisi} className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm md:p-8">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
            <UserPlus size={21} />
          </div>

          <div>
            <h2 className="font-semibold">Informasi Akun</h2>

            <p className="text-sm text-gray-500">Masukkan data login teknisi</p>
          </div>
        </div>

        <div className="space-y-5">
          <Field label="Nama Lengkap" name="nama" placeholder="Contoh: Budi Santoso" required />

          <Field label="Username" name="username" placeholder="Contoh: budi" required />

          <Field label="Wilayah" name="wilayah" placeholder="Contoh: Barat" required />

          <div className="grid gap-5 md:grid-cols-2">
            <Field label="Password" name="password" type="password" placeholder="Minimal 8 karakter" required />

            <Field label="Konfirmasi Password" name="password_confirmation" type="password" placeholder="Ulangi password" required />
          </div>
        </div>

        <div className="mt-8 flex justify-end gap-3 border-t pt-6">
          <Link href="/admin/teknisi" className="rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-medium transition hover:bg-gray-100">
            Batal
          </Link>

          <button type="submit" className="rounded-xl bg-black px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-800">
            Simpan Teknisi
          </button>
        </div>
      </form>
    </div>
  );
}

function Field({ label, name, type = "text", placeholder, required = false }: { label: string; name: string; type?: string; placeholder?: string; required?: boolean }) {
  return (
    <div>
      <label htmlFor={name} className="mb-2 block text-sm font-medium">
        {label}
      </label>

      <input
        id={name}
        name={name}
        type={type}
        placeholder={placeholder}
        required={required}
        className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition placeholder:text-gray-400 focus:border-black focus:ring-2 focus:ring-black/5"
      />
    </div>
  );
}
