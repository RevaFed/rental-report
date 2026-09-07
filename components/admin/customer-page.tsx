"use client";

import { useState, useTransition, type FormEvent, type ReactNode } from "react";

import { Plus, Pencil, Trash2, Search, ChevronLeft, ChevronRight, Users, X, MapPin, UserRound } from "lucide-react";

import { createAdminCustomer, updateAdminCustomer, deleteAdminCustomer, type AdminCustomer, type AdminTechnician } from "@/lib/actions/admin-customer";

type Props = {
  initialCustomers: AdminCustomer[];
  technicians: AdminTechnician[];
};

type ModalType = "add" | "edit" | null;

export default function CustomerAdminPage({ initialCustomers, technicians }: Props) {
  const [customers] = useState<AdminCustomer[]>(initialCustomers);
  const [search, setSearch] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const [modal, setModal] = useState<ModalType>(null);
  const [selected, setSelected] = useState<AdminCustomer | null>(null);

  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  const [nama, setNama] = useState("");
  const [alamat, setAlamat] = useState("");
  const [selectedTechnicians, setSelectedTechnicians] = useState<number[]>([]);

  function openAddModal() {
    setSelected(null);
    setNama("");
    setAlamat("");
    setSelectedTechnicians([]);
    setError("");
    setModal("add");
  }

  function openEditModal(customer: AdminCustomer) {
    setSelected(customer);
    setNama(customer.nama);
    setAlamat(customer.alamat);
    setSelectedTechnicians(customer.teknisi.map((item) => item.id));
    setError("");
    setModal("edit");
  }

  function closeModal() {
    if (isPending) return;

    setModal(null);
    setSelected(null);
    setError("");
  }

  function toggleTechnician(id: number) {
    setSelectedTechnicians((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));
  }

  function buildFormData(customerId?: string) {
    const formData = new FormData();

    if (customerId) {
      formData.set("id", customerId);
    }

    formData.set("nama", nama);
    formData.set("alamat", alamat);

    selectedTechnicians.forEach((id) => {
      formData.append("teknisi_ids", String(id));
    });

    return formData;
  }

  function handleAdd(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    if (selectedTechnicians.length === 0) {
      setError("Pilih minimal satu teknisi.");
      return;
    }

    const formData = buildFormData();

    startTransition(async () => {
      const result = await createAdminCustomer(formData);

      if (!result.success) {
        setError(result.error ?? "Gagal menambahkan customer.");
        return;
      }

      window.location.reload();
    });
  }

  function handleDelete(customer: AdminCustomer) {
    const confirmed = window.confirm(`Yakin ingin menghapus customer "${customer.nama}"?\n\nData customer dan penugasan teknisinya akan dihapus.`);

    if (!confirmed) return;

    setError("");

    const formData = new FormData();
    formData.set("id", String(customer.id));

    startTransition(async () => {
      const result = await deleteAdminCustomer(formData);

      if (!result.success) {
        setError(result.error ?? "Gagal menghapus customer.");
        return;
      }

      window.location.reload();
    });
  }

  function handleEdit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!selected) return;

    setError("");

    if (selectedTechnicians.length === 0) {
      setError("Pilih minimal satu teknisi.");
      return;
    }

    const formData = buildFormData(String(selected.id));

    startTransition(async () => {
      const result = await updateAdminCustomer(formData);

      if (!result.success) {
        setError(result.error ?? "Gagal memperbarui customer.");
        return;
      }

      window.location.reload();
    });
  }

  const filteredCustomers = customers.filter((customer) => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) return true;

    return customer.nama.toLowerCase().includes(keyword) || customer.alamat.toLowerCase().includes(keyword) || customer.teknisi.some((technician) => technician.nama.toLowerCase().includes(keyword));
  });

  const totalPages = Math.max(1, Math.ceil(filteredCustomers.length / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (safeCurrentPage - 1) * pageSize;
  const paginatedCustomers = filteredCustomers.slice(startIndex, startIndex + pageSize);

  const showingFrom = filteredCustomers.length === 0 ? 0 : startIndex + 1;
  const showingTo = Math.min(startIndex + pageSize, filteredCustomers.length);

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Customer</h1>

          <p className="mt-1 text-sm text-gray-500">Kelola data customer dan teknisi penanggung jawab.</p>
        </div>

        <button type="button" onClick={openAddModal} className="inline-flex items-center justify-center gap-2 rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-800">
          <Plus className="h-4 w-4" />
          Tambah Customer
        </button>
      </div>

      {/* STAT */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Customer</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">{customers.length}</p>
            </div>

            <div className="rounded-xl bg-gray-100 p-3">
              <Users className="h-5 w-5 text-gray-700" />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Data Terdaftar</p>
              <p className="mt-2 text-lg font-bold text-gray-900">Customer Rental</p>
            </div>

            <div className="rounded-xl bg-gray-100 p-3">
              <MapPin className="h-5 w-5 text-gray-700" />
            </div>
          </div>
        </div>
      </div>

      {/* SEARCH + LIMIT */}
      <div className="flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Cari customer, alamat, atau teknisi..."
            className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none transition placeholder:text-gray-400 focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10"
          />
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-500">Tampilkan</label>
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm font-medium text-gray-700 outline-none focus:border-gray-900"
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
          <span className="text-sm text-gray-500">baris</span>
        </div>
      </div>

      {/* TABLE */}
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Customer</th>

                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Alamat</th>

                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Teknisi</th>

                <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">Aksi</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {paginatedCustomers.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center">
                    <Users className="mx-auto h-10 w-10 text-gray-300" />

                    <p className="mt-3 text-sm font-medium text-gray-900">{customers.length === 0 ? "Belum ada customer" : "Customer tidak ditemukan"}</p>

                    <p className="mt-1 text-sm text-gray-500">{customers.length === 0 ? "Tambahkan customer pertama untuk mulai menggunakan sistem." : "Coba gunakan kata kunci pencarian yang lain."}</p>
                  </td>
                </tr>
              ) : (
                paginatedCustomers.map((customer) => (
                  <tr key={customer.id} className="transition hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-900 text-sm font-bold text-white">{customer.nama.charAt(0).toUpperCase()}</div>

                        <div>
                          <p className="font-semibold text-gray-900">{customer.nama}</p>

                          <p className="text-xs text-gray-500">ID #{customer.id}</p>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex max-w-xl items-start gap-2 text-sm text-gray-600">
                        <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
                        <span>{customer.alamat}</span>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      {customer.teknisi.length > 0 ? (
                        <div className="flex max-w-sm flex-wrap gap-2">
                          {customer.teknisi.map((technician) => (
                            <span key={technician.id} className="inline-flex items-center gap-1.5 rounded-lg bg-gray-100 px-2.5 py-1.5 text-xs font-semibold text-gray-700">
                              <UserRound className="h-3.5 w-3.5" />
                              {technician.nama}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-xs font-medium text-gray-400">Belum ditugaskan</span>
                      )}
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex justify-end">
                        <button
                          type="button"
                          onClick={() => openEditModal(customer)}
                          disabled={isPending}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-700 transition hover:bg-gray-100 disabled:opacity-50"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                          Edit
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDelete(customer)}
                          disabled={isPending}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Hapus
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

      {/* PAGINATION */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-gray-500">
          Menampilkan <span className="font-semibold text-gray-700">{showingFrom}</span>–<span className="font-semibold text-gray-700">{showingTo}</span> dari
          <span className="font-semibold text-gray-700"> {filteredCustomers.length}</span> customer
        </p>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
            disabled={safeCurrentPage <= 1}
            className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronLeft className="h-4 w-4" />
            Sebelumnya
          </button>

          <span className="min-w-[90px] text-center text-sm font-semibold text-gray-700">
            Halaman {safeCurrentPage} / {totalPages}
          </span>

          <button
            type="button"
            onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
            disabled={safeCurrentPage >= totalPages}
            className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Berikutnya
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* ADD MODAL */}
      {modal === "add" && (
        <Modal title="Tambah Customer" description="Tambahkan customer baru dan tentukan teknisi penanggung jawab." onClose={closeModal}>
          <form onSubmit={handleAdd} className="space-y-5">
            {error && <ErrorMessage message={error} />}

            <FormField label="Nama Customer" value={nama} onChange={setNama} placeholder="Contoh: PT Maju Jaya" />

            <TextAreaField label="Alamat" value={alamat} onChange={setAlamat} placeholder="Masukkan alamat lengkap customer" />

            <TechnicianSelector technicians={technicians} selected={selectedTechnicians} onToggle={toggleTechnician} />

            <ModalButtons onCancel={closeModal} loading={isPending} submitText="Tambah Customer" />
          </form>
        </Modal>
      )}

      {/* EDIT MODAL */}
      {modal === "edit" && selected && (
        <Modal title="Edit Customer" description={`Perbarui data ${selected.nama} dan teknisi penanggung jawab.`} onClose={closeModal}>
          <form onSubmit={handleEdit} className="space-y-5">
            {error && <ErrorMessage message={error} />}

            <FormField label="Nama Customer" value={nama} onChange={setNama} placeholder="Nama customer" />

            <TextAreaField label="Alamat" value={alamat} onChange={setAlamat} placeholder="Alamat lengkap customer" />

            <TechnicianSelector technicians={technicians} selected={selectedTechnicians} onToggle={toggleTechnician} />

            <ModalButtons onCancel={closeModal} loading={isPending} submitText="Simpan Perubahan" />
          </form>
        </Modal>
      )}
    </div>
  );
}

/*
|--------------------------------------------------------------------------
| TECHNICIAN SELECTOR
|--------------------------------------------------------------------------
*/

function TechnicianSelector({ technicians, selected, onToggle }: { technicians: AdminTechnician[]; selected: number[]; onToggle: (id: number) => void }) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <label className="block text-sm font-semibold text-gray-700">Teknisi Penanggung Jawab</label>

        <span className="text-xs text-gray-400">{selected.length} dipilih</span>
      </div>

      <div className="max-h-48 space-y-2 overflow-y-auto rounded-xl border border-gray-200 p-2">
        {technicians.length === 0 ? (
          <div className="px-3 py-4 text-center text-sm text-gray-500">Belum ada teknisi aktif.</div>
        ) : (
          technicians.map((technician) => {
            const checked = selected.includes(technician.id);

            return (
              <label key={technician.id} className={`flex cursor-pointer items-center gap-3 rounded-lg border px-3 py-3 transition ${checked ? "border-gray-900 bg-gray-50" : "border-transparent hover:bg-gray-50"}`}>
                <input type="checkbox" checked={checked} onChange={() => onToggle(technician.id)} className="h-4 w-4 rounded border-gray-300 text-gray-900 focus:ring-gray-900" />

                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-900 text-xs font-bold text-white">{technician.nama.charAt(0).toUpperCase()}</div>

                <div>
                  <p className="text-sm font-semibold text-gray-800">{technician.nama}</p>

                  <p className="text-xs text-gray-400">@{technician.username}</p>
                </div>
              </label>
            );
          })
        )}
      </div>

      <p className="mt-2 text-xs text-gray-400">Customer dapat ditangani oleh lebih dari satu teknisi.</p>
    </div>
  );
}

/*
|--------------------------------------------------------------------------
| MODAL
|--------------------------------------------------------------------------
*/

function Modal({ title, description, onClose, children }: { title: string; description: string; onClose: () => void; children: ReactNode }) {
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
| INPUT
|--------------------------------------------------------------------------
*/

function FormField({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (value: string) => void; placeholder?: string }) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-gray-700">{label}</label>

      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required
        className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-gray-400 focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10"
      />
    </div>
  );
}

/*
|--------------------------------------------------------------------------
| TEXTAREA
|--------------------------------------------------------------------------
*/

function TextAreaField({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (value: string) => void; placeholder?: string }) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-gray-700">{label}</label>

      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required
        rows={4}
        className="w-full resize-none rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-gray-400 focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10"
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
| BUTTONS
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
