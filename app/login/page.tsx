"use client";

import { useActionState } from "react";
import { login } from "@/lib/auth/login";
import { Eye, EyeOff, Lock, User } from "lucide-react";
import { useState } from "react";

const initialState = {
  error: "",
};

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);

  const [state, formAction, pending] = useActionState(login, initialState);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 p-5">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold">Rental Report</h1>

          <p className="mt-2 text-gray-500">Login ke sistem</p>
        </div>

        <form action={formAction} className="space-y-5">
          {/* Username */}

          <div>
            <label className="mb-2 block text-sm font-medium">Username</label>

            <div className="relative">
              <User size={18} className="absolute left-3 top-3 text-gray-400" />

              <input name="username" placeholder="Masukkan username" className="w-full rounded-lg border py-3 pl-10 pr-4 outline-none transition focus:border-black" />
            </div>
          </div>

          {/* Password */}

          <div>
            <label className="mb-2 block text-sm font-medium">Password</label>

            <div className="relative">
              <Lock size={18} className="absolute left-3 top-3 text-gray-400" />

              <input name="password" type={showPassword ? "text" : "password"} placeholder="Masukkan password" className="w-full rounded-lg border py-3 pl-10 pr-12 outline-none transition focus:border-black" />

              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3">
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Error */}

          {state?.error && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{state.error}</div>}

          {/* Button */}

          <button disabled={pending} className="w-full rounded-lg bg-black py-3 font-semibold text-white transition hover:bg-gray-800 disabled:opacity-50">
            {pending ? "Loading..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}
