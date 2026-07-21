"use client";

import { Trash2, Plus } from "lucide-react";

import { ReportRow, Customer, Mesin } from "@/types/report";

type Props = {
  rows: ReportRow[];

  setRows: React.Dispatch<React.SetStateAction<ReportRow[]>>;

  customers: Customer[];

  mesin: Mesin[];
};

export default function ReportTable({ rows, setRows, customers, mesin }: Props) {
  function tambahBaris() {
    setRows([
      ...rows,
      {
        id: Date.now(),

        jenis: "PM",

        customer_id: "",

        mesin_id: "",

        tipe_mesin: "",

        nomor_seri: "",

        masalah: "",

        jam_masuk: "",

        jam_keluar: "",

        keterangan: "",
      },
    ]);
  }

  function hapusBaris(id: number) {
    setRows(rows.filter((row) => row.id !== id));
  }

  function updateRow(index: number, field: keyof ReportRow, value: string) {
    const temp = [...rows];

    temp[index] = {
      ...temp[index],
      [field]: value,
    };

    if (field === "customer_id") {
      temp[index].mesin_id = "";
      temp[index].tipe_mesin = "";
      temp[index].nomor_seri = "";
    }

    if (field === "mesin_id") {
      const pilihMesin = mesin.find((m) => m.id === value);

      if (pilihMesin) {
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
                <th className="min-w-[220px] p-3 text-left">Customer</th>
                <th className="min-w-[170px] p-3 text-left">Nomor Seri</th>
                <th className="min-w-[120px] p-3 text-left">Type</th>
                <th className="min-w-[250px] p-3 text-left">Masalah</th>
                <th className="w-32 p-3 text-center">Jam In</th>
                <th className="w-32 p-3 text-center">Jam Out</th>
                <th className="min-w-[220px] p-3 text-left">Ket</th>
                <th className="w-16 p-3"></th>
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
                const mesinCustomer = mesin.filter((m) => m.customer_id === row.customer_id);

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
                        value={row.customer_id}
                        onChange={(e) =>
                          updateRow(
                            index,

                            "customer_id",

                            e.target.value,
                          )
                        }
                      >
                        <option value="">Pilih</option>

                        {customers.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.nama}
                          </option>
                        ))}
                      </select>
                    </td>

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
                        value={row.mesin_id}
                        onChange={(e) =>
                          updateRow(
                            index,

                            "mesin_id",

                            e.target.value,
                          )
                        }
                      >
                        <option value="">Pilih</option>

                        {mesinCustomer.map((m) => (
                          <option key={m.id} value={m.id}>
                            {m.nomor_seri}
                          </option>
                        ))}
                      </select>
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
                        value={row.keterangan}
                        onChange={(e) =>
                          updateRow(
                            index,

                            "keterangan",

                            e.target.value,
                          )
                        }
                      />
                    </td>

                    <td className="p-2">
                      <button
                        onClick={() => hapusBaris(row.id)}
                        className="
                        rounded-lg
                        p-2
                        text-red-500
                        transition
                        hover:bg-red-50
                        "
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
