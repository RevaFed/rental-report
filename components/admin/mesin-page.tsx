"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { ChevronDown, Pencil, Plus, Search, Trash2, X } from "lucide-react";
import { createAdminMesin, deleteAdminMesin, updateAdminMesin, type AdminMesin, type AdminMesinCustomer } from "@/lib/actions/admin-mesin";

type Props = {
  initialMesin: AdminMesin[];
  customers: AdminMesinCustomer[];
};

type FormState = {
  customer_id: string;
  tipe_mesin: string;
  nomor_seri: string;
};

const emptyForm: FormState = {
  customer_id: "",
  tipe_mesin: "",
  nomor_seri: "",
};

function CustomerSearchSelect({ customers, value, onChange }: { customers: AdminMesinCustomer[]; value: string; onChange: (value: string) => void }) {
  const [open, setOpen] = useState(false);
  const [keyword, setKeyword] = useState("");

  const selectedCustomer = customers.find((customer) => customer.id === value);

  const filteredCustomers = useMemo(() => {
    const query = keyword.trim().toLowerCase();

    if (!query) return customers;

    return customers.filter((customer) => customer.nama.toLowerCase().includes(query));
  }, [customers, keyword]);

  useEffect(() => {
    if (!open) {
      setKeyword("");
    }
  }, [open]);

  return (
    <div className="relative">
      <label className="mb-2 block text-sm font-medium">Customer</label>

      <button type="button" onClick={() => setOpen((current) => !current)} className="flex w-full items-center justify-between rounded-lg border bg-white px-3 py-2.5 text-left text-sm hover:border-gray-400">
        <span className={selectedCustomer ? "text-gray-900" : "text-gray-400"}>{selectedCustomer?.nama ?? "-- Pilih Customer --"}</span>
        <ChevronDown size={17} className={`shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute left-0 right-0 z-30 mt-2 overflow-hidden rounded-lg border bg-white shadow-lg">
          <div className="border-b p-2">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                autoFocus
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="Cari customer..."
                className="w-full rounded-md border bg-gray-50 py-2 pl-9 pr-3 text-sm outline-none focus:border-gray-400 focus:bg-white"
              />
            </div>
          </div>

          <div className="max-h-56 overflow-y-auto p-1">
            {filteredCustomers.length === 0 ? (
              <div className="px-3 py-6 text-center text-sm text-gray-400">Customer tidak ditemukan.</div>
            ) : (
              filteredCustomers.map((customer) => {
                const selected = customer.id === value;

                return (
                  <button
                    key={customer.id}
                    type="button"
                    onClick={() => {
                      onChange(customer.id);
                      setOpen(false);
                      setKeyword("");
                    }}
                    className={`flex w-full items-center justify-between rounded-md px-3 py-2.5 text-left text-sm transition ${selected ? "bg-gray-100 font-medium" : "hover:bg-gray-50"}`}
                  >
                    <span className="truncate">{customer.nama}</span>
                    {selected && <span className="ml-3 shrink-0 text-xs text-gray-500">Dipilih</span>}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function MesinAdminPage({ initialMesin, customers }: Props) {
  const [mesin, setMesin] = useState(initialMesin);
  const [search, setSearch] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const [openForm, setOpenForm] = useState(false);
  const [editing, setEditing] = useState<AdminMesin | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    setMesin(initialMesin);
  }, [initialMesin]);

  const filtered = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) return mesin;

    return mesin.filter((item) => [item.customer?.nama ?? "", item.tipe_mesin, item.nomor_seri].some((value) => value.toLowerCase().includes(keyword)));
  }, [mesin, search]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, pageSize]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const start = (safePage - 1) * pageSize;
  const paginated = filtered.slice(start, start + pageSize);

  const openAdd = () => {
    setEditing(null);
    setForm(emptyForm);
    setError("");
    setOpenForm(true);
  };

  const openEdit = (item: AdminMesin) => {
    setEditing(item);
    setForm({
      customer_id: item.customer_id,
      tipe_mesin: item.tipe_mesin,
      nomor_seri: item.nomor_seri,
    });
    setError("");
    setOpenForm(true);
  };

  const submit = () => {
    setError("");

    const data = new FormData();
    if (editing) data.append("id", editing.id);
    data.append("customer_id", form.customer_id);
    data.append("tipe_mesin", form.tipe_mesin);
    data.append("nomor_seri", form.nomor_seri);

    startTransition(async () => {
      const result = editing ? await updateAdminMesin(data) : await createAdminMesin(data);

      if (!result.success) {
        setError(result.error ?? "Terjadi kesalahan.");
        return;
      }

      window.location.reload();
    });
  };

  const handleDelete = (item: AdminMesin) => {
    if (!confirm(`Yakin ingin menghapus mesin ${item.tipe_mesin}?`)) return;

    const data = new FormData();
    data.append("id", item.id);

    startTransition(async () => {
      const result = await deleteAdminMesin(data);

      if (!result.success) {
        alert(result.error ?? "Gagal menghapus mesin.");
        return;
      }

      window.location.reload();
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Mesin</h1>
          <p className="mt-1 text-sm text-gray-500">Kelola seluruh mesin customer.</p>
        </div>

        <button onClick={openAdd} className="inline-flex items-center justify-center gap-2 rounded-lg bg-black px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-800">
          <Plus size={17} />
          Tambah Mesin
        </button>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:w-96">
          <Search size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cari customer, tipe mesin, nomor seri..." className="w-full rounded-lg border bg-white py-2.5 pl-10 pr-3 text-sm outline-none focus:border-gray-400" />
        </div>

        <select value={pageSize} onChange={(e) => setPageSize(Number(e.target.value))} className="rounded-lg border bg-white px-3 py-2.5 text-sm">
          <option value={10}>10 / halaman</option>
          <option value={25}>25 / halaman</option>
          <option value={50}>50 / halaman</option>
          <option value={100}>100 / halaman</option>
        </select>
      </div>

      <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-[850px] w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="w-16 p-3 text-center font-medium">No</th>
                <th className="p-3 text-left font-medium">Customer</th>
                <th className="p-3 text-left font-medium">Tipe Mesin</th>
                <th className="p-3 text-left font-medium">Nomor Seri</th>
                <th className="w-28 p-3 text-center font-medium">Aksi</th>
              </tr>
            </thead>

            <tbody>
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-gray-400">
                    Data mesin kosong
                  </td>
                </tr>
              ) : (
                paginated.map((item, index) => (
                  <tr key={item.id} className="border-t transition hover:bg-gray-50">
                    <td className="p-3 text-center text-gray-500">{start + index + 1}</td>
                    <td className="p-3 font-medium">{item.customer?.nama ?? "-"}</td>
                    <td className="p-3">{item.tipe_mesin}</td>
                    <td className="p-3 font-mono text-xs sm:text-sm">{item.nomor_seri}</td>
                    <td className="p-3">
                      <div className="flex justify-center gap-1">
                        <button onClick={() => openEdit(item)} className="rounded-lg p-2 hover:bg-gray-100" title="Edit">
                          <Pencil size={17} />
                        </button>
                        <button onClick={() => handleDelete(item)} disabled={pending} className="rounded-lg p-2 text-red-500 hover:bg-red-50 disabled:opacity-50" title="Hapus">
                          <Trash2 size={17} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col gap-3 border-t bg-gray-50 px-4 py-3 text-sm sm:flex-row sm:items-center sm:justify-between">
          <span className="text-gray-500">{filtered.length === 0 ? "Tidak ada data" : `Menampilkan ${start + 1}–${Math.min(start + paginated.length, filtered.length)} dari ${filtered.length} mesin`}</span>

          <div className="flex items-center gap-3">
            <button onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))} disabled={safePage === 1} className="rounded-lg border bg-white px-3 py-2 disabled:cursor-not-allowed disabled:opacity-50">
              ← Sebelumnya
            </button>

            <span className="text-gray-600">
              Halaman <b>{safePage}</b> / <b>{totalPages}</b>
            </span>

            <button onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))} disabled={safePage === totalPages} className="rounded-lg border bg-white px-3 py-2 disabled:cursor-not-allowed disabled:opacity-50">
              Selanjutnya →
            </button>
          </div>
        </div>
      </div>

      {openForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">{editing ? "Edit Mesin" : "Tambah Mesin"}</h2>
                <p className="mt-1 text-sm text-gray-500">Isi data mesin customer.</p>
              </div>

              <button onClick={() => setOpenForm(false)} className="rounded-lg p-2 hover:bg-gray-100">
                <X size={18} />
              </button>
            </div>

            {error && <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">{error}</div>}

            <div className="space-y-4">
              <CustomerSearchSelect customers={customers} value={form.customer_id} onChange={(customerId) => setForm((v) => ({ ...v, customer_id: customerId }))} />

              <div>
                <label className="mb-2 block text-sm font-medium">Tipe Mesin</label>
                <input value={form.tipe_mesin} onChange={(e) => setForm((v) => ({ ...v, tipe_mesin: e.target.value }))} placeholder="Contoh: IR C3020" className="w-full rounded-lg border px-3 py-2.5 text-sm" />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">Nomor Seri</label>
                <input value={form.nomor_seri} onChange={(e) => setForm((v) => ({ ...v, nomor_seri: e.target.value }))} placeholder="Contoh: DHM10309" className="w-full rounded-lg border px-3 py-2.5 text-sm" />
              </div>

              <button onClick={submit} disabled={pending} className="w-full rounded-lg bg-black py-2.5 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50">
                {pending ? "Menyimpan..." : editing ? "Update Mesin" : "Simpan Mesin"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
