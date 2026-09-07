"use client";

import { FormEvent, useState, useTransition } from "react";
import { changeAdminPassword, updateAdminProfile } from "@/lib/actions/admin-profile";
import { ShieldCheck, User, AtSign, KeyRound, CheckCircle2, LockKeyhole, Save, Loader2 } from "lucide-react";

type AdminProfile = {
  id: number;
  nama: string;
  username: string;
  role: "admin";
  is_active: boolean;
  created_at: string | null;
  updated_at: string | null;
};

type Props = {
  profile: AdminProfile;
};

function formatDate(value: string | null) {
  if (!value) return "-";

  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "long",
    timeStyle: "short",
  }).format(new Date(value));
}

export default function AdminProfilePage({ profile: initialProfile }: Props) {
  const [profile, setProfile] = useState(initialProfile);

  const [nama, setNama] = useState(profile.nama);
  const [username, setUsername] = useState(profile.username);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [profilePending, startProfileTransition] = useTransition();
  const [passwordPending, startPasswordTransition] = useTransition();

  const [profileMessage, setProfileMessage] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");
  const [profileError, setProfileError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  function submitProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setProfileMessage("");
    setProfileError("");

    const formData = new FormData(event.currentTarget);
    startProfileTransition(async () => {
      try {
        await updateAdminProfile(formData);

        const updated = {
          ...profile,
          nama: String(formData.get("nama") ?? ""),
          username: String(formData.get("username") ?? ""),
          updated_at: new Date().toISOString(),
        };

        setProfile(updated);
        setNama(updated.nama);
        setUsername(updated.username);
        setProfileMessage("Profile berhasil diperbarui.");
      } catch (error) {
        setProfileError(error instanceof Error ? error.message : "Gagal menyimpan profile.");
      }
    });
  }

  function submitPassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setPasswordMessage("");
    setPasswordError("");

    const formData = new FormData(event.currentTarget);

    startPasswordTransition(async () => {
      try {
        await changeAdminPassword(formData);

        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        event.currentTarget.reset();

        setPasswordMessage("Password berhasil diubah.");
      } catch (error) {
        setPasswordError(error instanceof Error ? error.message : "Gagal mengubah password.");
      }
    });
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Profile</h1>
        <p className="mt-1 text-sm text-muted-foreground">Kelola informasi akun Administrator.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
        <section className="rounded-xl border bg-card shadow-sm">
          <div className="border-b px-6 py-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <User className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-semibold">Informasi Profile</h2>
                <p className="text-sm text-muted-foreground">Informasi dasar akun admin.</p>
              </div>
            </div>
          </div>

          <form onSubmit={submitProfile} className="space-y-5 p-6">
            <div className="space-y-2">
              <label htmlFor="nama" className="text-sm font-medium">
                Nama
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  id="nama"
                  name="nama"
                  value={nama}
                  onChange={(e) => setNama(e.target.value)}
                  className="h-10 w-full rounded-md border bg-background pl-9 pr-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="username" className="text-sm font-medium">
                Username
              </label>
              <div className="relative">
                <AtSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  id="username"
                  name="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="h-10 w-full rounded-md border bg-background pl-9 pr-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                  required
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-lg border bg-muted/30 p-4">
                <p className="text-xs text-muted-foreground">Role</p>
                <div className="mt-2 flex items-center gap-2 text-sm font-medium">
                  <ShieldCheck className="h-4 w-4" />
                  Administrator
                </div>
              </div>

              <div className="rounded-lg border bg-muted/30 p-4">
                <p className="text-xs text-muted-foreground">Status</p>
                <div className="mt-2 flex items-center gap-2 text-sm font-medium">
                  <CheckCircle2 className="h-4 w-4" />
                  {profile.is_active ? "Aktif" : "Nonaktif"}
                </div>
              </div>
            </div>

            <div className="text-xs text-muted-foreground">Akun dibuat: {formatDate(profile.created_at)}</div>

            {profileError && <div className="rounded-md border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">{profileError}</div>}

            {profileMessage && (
              <div className="flex items-center gap-2 rounded-md border border-emerald-500/30 bg-emerald-500/5 px-4 py-3 text-sm text-emerald-600">
                <CheckCircle2 className="h-4 w-4" />
                {profileMessage}
              </div>
            )}

            <button
              type="submit"
              disabled={profilePending}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {profilePending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {profilePending ? "Menyimpan..." : "Simpan Profile"}
            </button>
          </form>
        </section>

        <section className="rounded-xl border bg-card shadow-sm">
          <div className="border-b px-6 py-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <KeyRound className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-semibold">Keamanan</h2>
                <p className="text-sm text-muted-foreground">Ubah password akun administrator.</p>
              </div>
            </div>
          </div>

          <form onSubmit={submitPassword} className="space-y-5 p-6">
            <div className="space-y-2">
              <label htmlFor="current_password" className="text-sm font-medium">
                Password Saat Ini
              </label>
              <div className="relative">
                <LockKeyhole className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  id="current_password"
                  name="current_password"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="h-10 w-full rounded-md border bg-background pl-9 pr-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                  autoComplete="current-password"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="new_password" className="text-sm font-medium">
                Password Baru
              </label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  id="new_password"
                  name="new_password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="h-10 w-full rounded-md border bg-background pl-9 pr-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                  autoComplete="new-password"
                  minLength={8}
                  required
                />
              </div>
              <p className="text-xs text-muted-foreground">Minimal 8 karakter.</p>
            </div>

            <div className="space-y-2">
              <label htmlFor="confirm_password" className="text-sm font-medium">
                Konfirmasi Password Baru
              </label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  id="confirm_password"
                  name="confirm_password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="h-10 w-full rounded-md border bg-background pl-9 pr-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                  autoComplete="new-password"
                  minLength={8}
                  required
                />
              </div>
            </div>

            {passwordError && <div className="rounded-md border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">{passwordError}</div>}

            {passwordMessage && (
              <div className="flex items-center gap-2 rounded-md border border-emerald-500/30 bg-emerald-500/5 px-4 py-3 text-sm text-emerald-600">
                <CheckCircle2 className="h-4 w-4" />
                {passwordMessage}
              </div>
            )}

            <button
              type="submit"
              disabled={passwordPending}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {passwordPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <KeyRound className="h-4 w-4" />}
              {passwordPending ? "Mengubah..." : "Ubah Password"}
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}
