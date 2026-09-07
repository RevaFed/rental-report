"use client";

import { useState, useTransition, type FormEvent } from "react";

import { Plus, Pencil, Power, Users, X, MapPin } from "lucide-react";

import { createTeknisi, updateTeknisi, toggleTeknisi, type Teknisi } from "@/lib/actions/teknisi";

type Props = {
  initialTeknisi: Teknisi[];
};

type ModalType = "add" | "edit" | null;

export default function TeknisiPage({ initialTeknisi }: Props) {
  const [teknisi, setTeknisi] = useState(initialTeknisi);

  const [modal, setModal] = useState<ModalType>(null);
  const [selected, setSelected] = useState<Teknisi | null>(null);

  const [isPending, startTransition] = useTransition();

  const [error, setError] = useState("");

  /*
  |--------------------------------------------------------------------------
  | FORM
  |--------------------------------------------------------------------------
  */

  const [nama, setNama] = useState("");
  const [username, setUsername] = useState("");
  const [wilayah, setWilayah] = useState("");

  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");

  /*
  |--------------------------------------------------------------------------
  | OPEN ADD
  |--------------------------------------------------------------------------
  */

  function openAddModal() {
    setSelected(null);

    setNama("");
    setUsername("");
    setWilayah("");
    setPassword("");
    setPasswordConfirmation("");

    setError("");
    setModal("add");
  }

  /*
  |--------------------------------------------------------------------------
  | OPEN EDIT
  |--------------------------------------------------------------------------
  */

  function openEditModal(item: Teknisi) {
    setSelected(item);

    setNama(item.nama);
    setUsername(item.username);
    setWilayah(item.wilayah ?? "");

    setPassword("");
    setPasswordConfirmation("");

    setError("");
    setModal("edit");
  }

  /*
  |--------------------------------------------------------------------------
  | CLOSE MODAL
  |--------------------------------------------------------------------------
  */

  function closeModal() {
    if (isPending) return;

    setModal(null);
    setSelected(null);
    setError("");
  }

  /*
  |--------------------------------------------------------------------------
  | SUBMIT ADD
  |--------------------------------------------------------------------------
  */

  function handleAdd(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setError("");

    const formData = new FormData();

    formData.set("nama", nama);
    formData.set("username", username);
    formData.set("wilayah", wilayah);
    formData.set("password", password);
    formData.set("password_confirmation", passwordConfirmation);

    startTransition(async () => {
      const result = await createTeknisi(formData);

      if (!result.success) {
        setError(result.error ?? "Gagal menambahkan teknisi.");
        return;
      }

      /*
       * Refresh data dari server.
       */
      window.location.reload();
    });
  }

  /*
  |--------------------------------------------------------------------------
  | SUBMIT EDIT
  |--------------------------------------------------------------------------
  */

  function handleEdit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!selected) return;

    setError("");

    const formData = new FormData();

    formData.set("id", String(selected.id));
    formData.set("nama", nama);
    formData.set("username", username);
    formData.set("wilayah", wilayah);

    /*
     * Password kosong = password tidak diubah.
     */
    if (password) {
      formData.set("password", password);
      formData.set("password_confirmation", passwordConfirmation);
    }

    startTransition(async () => {
      const result = await updateTeknisi(formData);

      if (!result.success) {
        setError(result.error ?? "Gagal memperbarui teknisi.");
        return;
      }

      window.location.reload();
    });
  }

  /*
  |--------------------------------------------------------------------------
  | TOGGLE STATUS
  |--------------------------------------------------------------------------
  */

  function handleToggle(item: Teknisi) {
    const action = item.is_active ? "menonaktifkan" : "mengaktifkan";

    const confirmed = window.confirm(`Yakin ingin ${action} teknisi "${item.nama}"?`);

    if (!confirmed) return;

    const formData = new FormData();
    formData.set("id", String(item.id));

    startTransition(async () => {
      const result = await toggleTeknisi(formData);

      if (!result.success) {
        window.alert(result.error ?? "Gagal mengubah status teknisi.");
        return;
      }

      setTeknisi((current) =>
        current.map((tech) =>
          tech.id === item.id
            ? {
                ...tech,
                is_active: !tech.is_active,
              }
            : tech,
        ),
      );
    });
  }

  return (
    <div className="space-y-6">
      {/* HEADER */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Teknisi</h1>

          <p className="mt-1 text-sm text-gray-500">Kelola akun dan wilayah teknisi.</p>
        </div>

        <button type="button" onClick={openAddModal} className="inline-flex items-center justify-center gap-2 rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-800">
          <Plus className="h-4 w-4" />
          Tambah Teknisi
        </button>
      </div>

      {/* STAT */}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Teknisi</p>

              <p className="mt-2 text-3xl font-bold text-gray-900">{teknisi.length}</p>
            </div>

            <div className="rounded-xl bg-gray-100 p-3">
              <Users className="h-5 w-5 text-gray-700" />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Teknisi Aktif</p>

              <p className="mt-2 text-3xl font-bold text-gray-900">{teknisi.filter((item) => item.is_active).length}</p>
            </div>

            <div className="rounded-xl bg-gray-100 p-3">
              <Power className="h-5 w-5 text-gray-700" />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Teknisi Nonaktif</p>

              <p className="mt-2 text-3xl font-bold text-gray-900">{teknisi.filter((item) => !item.is_active).length}</p>
            </div>

            <div className="rounded-xl bg-gray-100 p-3">
              <Power className="h-5 w-5 text-gray-700" />
            </div>
          </div>
        </div>
      </div>

      {/* TABLE */}

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Teknisi</th>

                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Username</th>

                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Wilayah</th>

                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Status</th>

                <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">Aksi</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {teknisi.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <Users className="mx-auto h-10 w-10 text-gray-300" />

                    <p className="mt-3 text-sm font-medium text-gray-900">Belum ada teknisi</p>

                    <p className="mt-1 text-sm text-gray-500">Tambahkan teknisi pertama untuk mulai menggunakan sistem.</p>
                  </td>
                </tr>
              ) : (
                teknisi.map((item) => (
                  <tr key={item.id} className="transition hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-900 text-sm font-bold text-white">{item.nama.charAt(0).toUpperCase()}</div>

                        <div>
                          <p className="font-semibold text-gray-900">{item.nama}</p>

                          <p className="text-xs text-gray-500">ID #{item.id}</p>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4 text-sm text-gray-700">@{item.username}</td>

                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 rounded-lg bg-gray-100 px-2.5 py-1.5 text-sm font-medium text-gray-700">
                        <MapPin className="h-3.5 w-3.5" />
                        {item.wilayah || "-"}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      {item.is_active ? (
                        <span className="inline-flex rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">Aktif</span>
                      ) : (
                        <span className="inline-flex rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-700">Nonaktif</span>
                      )}
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        <button type="button" onClick={() => openEditModal(item)} className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-700 transition hover:bg-gray-100">
                          <Pencil className="h-3.5 w-3.5" />
                          Edit
                        </button>

                        <button
                          type="button"
                          disabled={isPending}
                          onClick={() => handleToggle(item)}
                          className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${
                            item.is_active ? "bg-red-50 text-red-700 hover:bg-red-100" : "bg-green-50 text-green-700 hover:bg-green-100"
                          }`}
                        >
                          <Power className="h-3.5 w-3.5" />

                          {item.is_active ? "Nonaktifkan" : "Aktifkan"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADD MODAL */}

      {modal === "add" && (
        <Modal title="Tambah Teknisi" description="Buat akun teknisi baru." onClose={closeModal}>
          <form onSubmit={handleAdd} className="space-y-5">
            {error && <ErrorMessage message={error} />}

            <FormField label="Nama Teknisi" value={nama} onChange={setNama} placeholder="Contoh: Budi Santoso" />

            <FormField label="Username" value={username} onChange={setUsername} placeholder="Contoh: budi" />

            <div>
              <FormField label="Wilayah" value={wilayah} onChange={setWilayah} placeholder="Contoh: Barat" />
            </div>

            <FormField label="Password" type="password" value={password} onChange={setPassword} placeholder="Minimal 8 karakter" />

            <FormField label="Konfirmasi Password" type="password" value={passwordConfirmation} onChange={setPasswordConfirmation} placeholder="Ulangi password" />

            <ModalButtons onCancel={closeModal} loading={isPending} submitText="Tambah Teknisi" />
          </form>
        </Modal>
      )}

      {/* EDIT MODAL */}

      {modal === "edit" && selected && (
        <Modal title="Edit Teknisi" description={`Perbarui data ${selected.nama}.`} onClose={closeModal}>
          <form onSubmit={handleEdit} className="space-y-5">
            {error && <ErrorMessage message={error} />}

            <FormField label="Nama Teknisi" value={nama} onChange={setNama} placeholder="Nama teknisi" />

            <FormField label="Username" value={username} onChange={setUsername} placeholder="Username" />

            <div>
              <FormField label="Wilayah" value={wilayah} onChange={setWilayah} placeholder="Contoh: Barat" />
            </div>

            <div className="border-t border-gray-100 pt-5">
              <p className="mb-3 text-sm font-bold text-gray-900">Ganti Password</p>

              <p className="mb-4 text-xs text-gray-500">Kosongkan jika password tidak ingin diubah.</p>

              <div className="space-y-4">
                <FormField label="Password Baru" type="password" value={password} onChange={setPassword} placeholder="Kosongkan jika tidak ingin mengubah password" required={false} />

                <FormField label="Konfirmasi Password Baru" type="password" value={passwordConfirmation} onChange={setPasswordConfirmation} placeholder="Kosongkan jika tidak ingin mengubah password" required={false} />
              </div>
            </div>

            <ModalButtons onCancel={closeModal} loading={isPending} submitText="Simpan Perubahan" />
          </form>
        </Modal>
      )}
    </div>
  );
}

/*
|--------------------------------------------------------------------------
| MODAL
|--------------------------------------------------------------------------
*/

function Modal({ title, description, onClose, children }: { title: string; description: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white shadow-2xl">
        <div className="flex items-start justify-between border-b border-gray-100 px-6 py-5">
          <div>
            <h2 className="text-lg font-bold text-gray-900">{title}</h2>

            <p className="mt-1 text-sm text-gray-500">{description}</p>
          </div>

          <button type="button" onClick={onClose} className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

/*
|--------------------------------------------------------------------------
| FORM FIELD
|--------------------------------------------------------------------------
*/

function FormField({ label, value, onChange, placeholder, type = "text", required = true }: { label: string; value: string; onChange: (value: string) => void; placeholder?: string; type?: string; required?: boolean }) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-gray-700">{label}</label>

      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-gray-400 focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10"
      />
    </div>
  );
}

/*
|--------------------------------------------------------------------------
| ERROR
|--------------------------------------------------------------------------
*/

function ErrorMessage({ message }: { message: string }) {
  return <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{message}</div>;
}

/*
|--------------------------------------------------------------------------
| MODAL BUTTONS
|--------------------------------------------------------------------------
*/

function ModalButtons({ onCancel, loading, submitText }: { onCancel: () => void; loading: boolean; submitText: string }) {
  return (
    <div className="flex justify-end gap-3 border-t border-gray-100 pt-5">
      <button type="button" onClick={onCancel} disabled={loading} className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:opacity-50">
        Batal
      </button>

      <button type="submit" disabled={loading} className="rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50">
        {loading ? "Menyimpan..." : submitText}
      </button>
    </div>
  );
}
