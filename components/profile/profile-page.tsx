"use client";

import ProfileForm from "./profile-form";
import PasswordForm from "./password-form";

type User = {
  id: number;
  nama: string;
  username: string;
  role: "admin" | "teknisi";
  is_active: boolean;
  wilayah: string | null;
};

type Props = {
  user: User;
};

export default function ProfilePage({ user }: Props) {
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Profil Saya</h1>

        <p className="mt-1 text-gray-500">Kelola akun login Anda</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <ProfileForm user={user} />

        <PasswordForm id={user.id} />
      </div>
    </div>
  );
}
