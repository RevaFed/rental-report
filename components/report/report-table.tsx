"use client";

import { Trash2, Plus, Search } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { ReportRow, Customer, Mesin } from "@/types/report";
import CustomerQuickDialog from "./customer-quick-dialog";
import CustomerBackupDialog, { BackupCustomerData } from "./customer-backup-dialog";
import { UserPlus, Building2 } from "lucide-react";

type Props = {
  rows: ReportRow[];

  setRows: React.Dispatch<React.SetStateAction<ReportRow[]>>;

  customers: Customer[];

  mesin: Mesin[];
};

export default function ReportTable({ rows, setRows, customers, mesin }: Props) {
  const [openCustomerDialog, setOpenCustomerDialog] = useState(false);

  const [selectedRow, setSelectedRow] = useState<number | null>(null);
  const [mesinList, setMesinList] = useState(mesin);
  const [customerList, setCustomerList] = useState(customers);
  const [openBackupDialog, setOpenBackupDialog] = useState(false);
  const [customerSearch, setCustomerSearch] = useState("");
  const [openCustomerSearch, setOpenCustomerSearch] = useState<number | null>(null);
  const [customerDropdownRect, setCustomerDropdownRect] = useState<{
    top: number;
    left: number;
    width: number;
  } | null>(null);
  const customerDropdownRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (openCustomerSearch === null) return;

    const handleScroll = (event: Event) => {
      // Jangan tutup dropdown ketika user sedang scroll daftar customer.
      if (customerDropdownRef.current?.contains(event.target as Node)) {
        return;
      }

      // Kalau scroll terjadi di luar dropdown, tutup agar tidak menggantung.
      setOpenCustomerSearch(null);
      setCustomerDropdownRect(null);
    };

    window.addEventListener("scroll", handleScroll, true);
    return () => window.removeEventListener("scroll", handleScroll, true);
  }, [openCustomerSearch]);
  function tambahBaris() {
    setRows([
      ...rows,
      {
        id: `new-${Date.now()}`,

        jenis: "PM",

        customer_id: "",
        mesin_id: "",

        // Customer Backup
        is_backup: false,
        customer_backup: "",
        alamat_backup: "",

        tipe_mesin: "",
        nomor_seri: "",

        masalah: "",

        jam_masuk: "",

        jam_keluar: "",

        keterangan: "",
      },
    ]);
  }

  function hapusBaris(id: string) {
    setRows(rows.filter((row) => row.id !== id));
  }

  function updateRow(index: number, field: keyof ReportRow, value: string) {
    const temp = [...rows];

    temp[index] = {
      ...temp[index],
      [field]: value,
    };

    if (field === "customer_id") {
      temp[index].customer_id = value;

      temp[index].mesin_id = "";
      temp[index].tipe_mesin = "";
      temp[index].nomor_seri = "";
    }

    if (field === "mesin_id") {
      const pilihMesin = mesinList.find((m) => m.id === value);

      if (pilihMesin) {
        temp[index].mesin_id = value;
        temp[index].tipe_mesin = pilihMesin.tipe_mesin;
        temp[index].nomor_seri = pilihMesin.nomor_seri;
      }
    }

    setRows(temp);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
        <button
          onClick={tambahBaris}
          className="
          flex
          items-center
          justify-center
          gap-2
          rounded-lg
          bg-black
          px-4
          py-2.5
          text-white
          transition
          hover:bg-gray-800
          "
        >
          <Plus size={18} />
          Tambah Baris
        </button>
      </div>

      <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-[1350px] w-full border-collapse">
            <thead className="sticky top-0 z-10 bg-gray-100">
              <tr>
                <th className="w-14 p-3 text-center font-semibold">No</th>
                <th className="w-24 p-3 text-center">Jenis</th>
                <th className="min-w-[320px] p-3 text-left">Customer</th>
                <th className="min-w-[170px] p-3 text-left">Nomor Seri</th>
                <th className="min-w-[90px] p-3 text-left">Type</th>
                <th className="min-w-[250px] p-3 text-left">Masalah</th>
                <th className="w-32 p-3 text-center">Jam In</th>
                <th className="w-32 p-3 text-center">Jam Out</th>
                <th className="w-24 p-3 text-center">Ket</th>
                <th className="w-12 p-3 text-center">Aksi</th>
              </tr>
            </thead>

            <tbody>
              {rows.length === 0 && (
                <tr>
                  <td colSpan={10} className="p-8 text-center">
                    Belum ada data
                  </td>
                </tr>
              )}

              {rows.map((row, index) => {
                const mesinCustomer = mesinList.filter((m) => m.customer_id === row.customer_id);

                return (
                  <tr key={row.id}>
                    <td className="p-2">{index + 1}</td>

                    <td className="p-2">
                      <select
                        className="
                          w-full
                          rounded-lg
                          border
                          px-3
                          py-2
                          text-sm
                          outline-none
                          focus:border-black
                          "
                        value={row.jenis}
                        onChange={(e) =>
                          updateRow(
                            index,

                            "jenis",

                            e.target.value,
                          )
                        }
                      >
                        <option value="PM">PM</option>

                        <option value="CR">CR</option>

                        <option value="OTH">OTH</option>

                        <option value="FU">FU</option>
                      </select>
                    </td>

                    <td className="p-2">
                      <div className="space-y-2">
                        {row.is_backup ? (
                          <div className="rounded-lg border border-amber-300 bg-amber-50 p-3">
                            <div className="mb-2 flex items-center justify-between">
                              <span className="rounded bg-amber-500 px-2 py-1 text-xs font-semibold text-white">Customer Backup</span>

                              <button
                                type="button"
                                title="Edit Customer Backup"
                                onClick={() => {
                                  setSelectedRow(index);
                                  setOpenBackupDialog(true);
                                }}
                                className="flex h-8 w-8 items-center justify-center rounded-lg border border-amber-300 bg-white text-amber-600 hover:bg-amber-100"
                              >
                                <Building2 size={16} />
                              </button>
                            </div>

                            <div className="font-semibold">{row.customer_backup}</div>

                            <div className="text-sm text-gray-500">{row.alamat_backup}</div>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <div className="relative flex-1">
                              <button
                                type="button"
                                className="flex w-full items-center justify-between rounded-lg border bg-white px-3 py-2 text-left text-sm outline-none focus:border-black"
                                onClick={(e) => {
                                  if (openCustomerSearch === index) {
                                    setOpenCustomerSearch(null);
                                    setCustomerDropdownRect(null);
                                    return;
                                  }

                                  const rect = e.currentTarget.getBoundingClientRect();
                                  setCustomerDropdownRect({
                                    top: rect.bottom + 4,
                                    left: rect.left,
                                    width: rect.width,
                                  });
                                  setOpenCustomerSearch(index);
                                  setCustomerSearch("");
                                }}
                              >
                                <span className={row.customer_id ? "text-gray-900" : "text-gray-400"}>{customerList.find((c) => c.id === row.customer_id)?.nama ?? "Pilih customer..."}</span>
                                <Search size={16} className="text-gray-400" />
                              </button>

                              {openCustomerSearch === index && customerDropdownRect && (
                                <div
                                  ref={customerDropdownRef}
                                  className="fixed z-[9999] rounded-xl border bg-white p-2 shadow-2xl"
                                  style={{
                                    top: customerDropdownRect.top,
                                    left: customerDropdownRect.left,
                                    width: customerDropdownRect.width,
                                  }}
                                >
                                  <div className="relative mb-2">
                                    <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input
                                      autoFocus
                                      value={customerSearch}
                                      onChange={(e) => setCustomerSearch(e.target.value)}
                                      placeholder="Cari customer..."
                                      className="w-full rounded-lg border px-9 py-2 text-sm outline-none focus:border-black"
                                    />
                                  </div>

                                  <div className="max-h-56 overflow-y-auto">
                                    {customerList
                                      .filter((c) => {
                                        const q = customerSearch.trim().toLowerCase();
                                        return !q || c.nama.toLowerCase().includes(q);
                                      })
                                      .map((c) => (
                                        <div key={c.id} className="flex items-center gap-2 rounded-lg px-2 py-1 hover:bg-gray-50">
                                          <button
                                            type="button"
                                            className="min-w-0 flex-1 rounded-lg px-2 py-2 text-left"
                                            onClick={() => {
                                              updateRow(index, "customer_id", c.id);
                                              setOpenCustomerSearch(null);
                                              setCustomerSearch("");
                                            }}
                                          >
                                            <div className="truncate text-sm font-medium">{c.nama}</div>
                                          </button>
                                        </div>
                                      ))}

                                    {customerList.filter((c) => {
                                      const q = customerSearch.trim().toLowerCase();
                                      return !q || c.nama.toLowerCase().includes(q);
                                    }).length === 0 && <div className="p-4 text-center text-sm text-gray-500">Customer tidak ditemukan.</div>}
                                  </div>
                                </div>
                              )}
                            </div>

                            <button
                              type="button"
                              title="Tambah Customer"
                              onClick={() => {
                                setSelectedRow(index);
                                setOpenCustomerDialog(true);
                              }}
                              className="flex h-10 w-10 items-center justify-center rounded-lg border border-blue-300 bg-blue-50 text-blue-600 hover:bg-blue-100"
                            >
                              <UserPlus size={18} />
                            </button>

                            <button
                              type="button"
                              title="Customer Backup"
                              onClick={() => {
                                setSelectedRow(index);
                                setOpenBackupDialog(true);
                              }}
                              className="flex h-10 w-10 items-center justify-center rounded-lg border border-amber-300 bg-amber-50 text-amber-600 hover:bg-amber-100"
                            >
                              <Building2 size={18} />
                            </button>
                          </div>
                        )}
                      </div>
                    </td>

                    <td className="p-2">
                      {row.is_backup ? (
                        <div className="rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-sm">{row.nomor_seri}</div>
                      ) : (
                        <select
                          className="
                              w-full
                              rounded-lg
                              border
                              px-3
                              py-2
                              text-sm
                              outline-none
                              focus:border-black
                            "
                          value={row.mesin_id}
                          onChange={(e) => updateRow(index, "mesin_id", e.target.value)}
                        >
                          <option value="">Pilih</option>

                          {mesinCustomer.map((m) => (
                            <option key={m.id} value={m.id}>
                              {m.nomor_seri}
                            </option>
                          ))}
                        </select>
                      )}
                    </td>

                    <td className="p-2">{row.tipe_mesin}</td>

                    <td className="p-2">
                      <input
                        className="
                        w-full
                        rounded-lg
                        border
                        px-3
                        py-2
                        text-sm
                        outline-none
                        focus:border-black
                        "
                        value={row.masalah}
                        onChange={(e) =>
                          updateRow(
                            index,

                            "masalah",

                            e.target.value,
                          )
                        }
                      />
                    </td>

                    <td className="p-2">
                      <input
                        className="
                        w-full
                        rounded-lg
                        border
                        px-3
                        py-2
                        text-sm
                        outline-none
                        focus:border-black
                        "
                        type="time"
                        value={row.jam_masuk}
                        onChange={(e) =>
                          updateRow(
                            index,

                            "jam_masuk",

                            e.target.value,
                          )
                        }
                      />
                    </td>

                    <td className="p-2">
                      <input
                        className="
                        w-full
                        rounded-lg
                        border
                        px-3
                        py-2
                        text-sm
                        outline-none
                        focus:border-black
                        "
                        type="time"
                        value={row.jam_keluar}
                        onChange={(e) =>
                          updateRow(
                            index,

                            "jam_keluar",

                            e.target.value,
                          )
                        }
                      />
                    </td>

                    <td className="w-24 p-2 text-center">
                      <select
                        value={row.keterangan}
                        onChange={(e) => updateRow(index, "keterangan", e.target.value)}
                        className="
                          w-full
                          rounded-lg
                          border
                          px-2
                          py-2
                          text-sm
                          outline-none
                          focus:border-black
                        "
                      >
                        <option value="">Pilih</option>
                        <option value="OK">OK</option>
                        <option value="OTH">OTH</option>
                        <option value="FU">FU</option>
                      </select>
                    </td>
                    <td className="w-12 p-2 text-center align-middle">
                      <button onClick={() => hapusBaris(row.id)} className="inline-flex h-8 w-8 items-center justify-center rounded-md text-red-500 hover:bg-red-50">
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <CustomerQuickDialog
            open={openCustomerDialog}
            onClose={() => setOpenCustomerDialog(false)}
            onCreated={({ customer, mesin }) => {
              // Tambahkan customer baru
              setCustomerList((prev) => [...prev, customer]);

              // Tambahkan mesin baru
              setMesinList((prev) => [...prev, mesin]);

              if (selectedRow !== null) {
                // Pilih customer
                updateRow(selectedRow, "customer_id", customer.id);

                // Pilih mesin
                updateRow(selectedRow, "mesin_id", mesin.id);
              }

              setOpenCustomerDialog(false);
            }}
          />
          <CustomerBackupDialog
            open={openBackupDialog}
            onClose={() => setOpenBackupDialog(false)}
            onCreated={(data: BackupCustomerData) => {
              if (selectedRow === null) return;

              setRows((prev) =>
                prev.map((row, i) => {
                  if (i !== selectedRow) return row;

                  return {
                    ...row,

                    is_backup: true,

                    customer_backup: data.customer,
                    alamat_backup: data.alamat,

                    customer_id: "",
                    mesin_id: "",

                    tipe_mesin: data.tipe_mesin,
                    nomor_seri: data.nomor_seri,
                  };
                }),
              );

              setOpenBackupDialog(false);
            }}
          />
        </div>
      </div>
    </div>
  );
}
