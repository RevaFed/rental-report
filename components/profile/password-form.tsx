"use client";

import { useActionState } from "react";

import { updatePassword } from "@/lib/actions/profile";

type Props = {
  id: number;
};

const initialState = {
  success: "",
  error: "",
};

export default function PasswordForm({ id }: Props) {
  const [state, formAction, pending] = useActionState(updatePassword, initialState);

  return (
    <div className="rounded-2xl border bg-white p-6 shadow-sm">
      <h2 className="mb-5 text-xl font-semibold">Ganti Password</h2>

      <form action={formAction} className="space-y-5">
        <input type="hidden" name="id" value={id} />

        <div>
          <label className="mb-2 block text-sm font-medium">Password Lama</label>

          <input type="password" name="old_password" className="w-full rounded-xl border px-4 py-3 outline-none focus:border-black" />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">Password Baru</label>

          <input type="password" name="new_password" className="w-full rounded-xl border px-4 py-3 outline-none focus:border-black" />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">Konfirmasi Password</label>

          <input type="password" name="confirm_password" className="w-full rounded-xl border px-4 py-3 outline-none focus:border-black" />
        </div>

        {state.error && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{state.error}</div>}

        {state.success && <div className="rounded-lg bg-green-50 p-3 text-sm text-green-600">{state.success}</div>}

        <button disabled={pending} className="w-full rounded-xl bg-black py-3 font-medium text-white hover:bg-gray-800 disabled:opacity-50">
          {pending ? "Menyimpan..." : "Ubah Password"}
        </button>
      </form>
    </div>
  );
}
