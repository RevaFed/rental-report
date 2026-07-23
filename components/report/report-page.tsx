"use client";

import { useEffect, useState } from "react";
import ReportToolbar from "./report-toolbar";
import ReportTable from "./report-table";

import { Customer, Mesin, ReportRow } from "@/types/report";
import { supabase } from "@/lib/supabase/client";

import { exportReportPDF } from "@/lib/pdf/report";
import { exportReportExcel } from "@/lib/excel/report";
import { FileSpreadsheet, FileText, Save } from "lucide-react";

type Props = {
  customers: Customer[];
  mesin: Mesin[];
  initialTanggal?: string;
};

export default function ReportPage({ customers, mesin, initialTanggal }: Props) {
  const today = new Date().toISOString().split("T")[0];
  const [note, setNote] = useState("");
  const [tanggal, setTanggal] = useState(initialTanggal ?? today);
  const [rows, setRows] = useState<ReportRow[]>([]);

  const [saving, setSaving] = useState(false);

  async function handleSave() {
    try {
      setSaving(true);

      const payload = rows
        .filter((row) => {
          if (row.is_backup) {
            return row.customer_backup.trim() !== "";
          }

          return row.customer_id !== "" && row.mesin_id !== "";
        })
        .map((row) => ({
          tanggal,

          customer_id: row.is_backup ? null : row.customer_id,

          mesin_id: row.is_backup ? null : row.mesin_id,

          is_backup: row.is_backup,

          customer_backup: row.is_backup ? row.customer_backup : null,

          alamat_backup: row.is_backup ? row.alamat_backup : null,

          tipe_mesin_backup: row.is_backup ? row.tipe_mesin : null,

          nomor_seri_backup: row.is_backup ? row.nomor_seri : null,

          jenis: row.jenis,

          masalah: row.masalah || null,

          jam_masuk: row.jam_masuk || null,

          jam_keluar: row.jam_keluar || null,

          keterangan: row.keterangan || null,

          note: note || null,
        }));

      if (payload.length === 0) {
        alert("Belum ada data yang bisa disimpan.");
        return;
      }

      const { error } = await supabase.from("report_harian").insert(payload);

      if (error) throw error;

      alert("Report berhasil disimpan.");
    } catch (error: any) {
      console.log("ERROR:", error);
      console.log("MESSAGE:", error?.message);
      console.log("DETAILS:", error?.details);
      console.log("HINT:", error?.hint);
      console.log("CODE:", error?.code);

      alert(error?.message ?? "Gagal menyimpan report.");
    } finally {
      setSaving(false);
    }
  }

  async function loadReport() {
    const { data, error } = await supabase.from("report_harian").select("*").eq("tanggal", tanggal);

    if (error) {
      console.error(error);
      return;
    }
    if (data.length > 0) {
      setNote(data[0].note ?? "");
    } else {
      setNote("");
    }

    const reportRows: ReportRow[] = data.map((item) => {
      const dataMesin = mesin.find((m) => m.id === item.mesin_id);

      return {
        id: item.id,

        jenis: item.jenis,

        customer_id: item.customer_id ?? "",

        mesin_id: item.mesin_id ?? "",

        is_backup: item.is_backup ?? false,

        customer_backup: item.customer_backup ?? "",

        alamat_backup: item.alamat_backup ?? "",

        tipe_mesin: item.is_backup ? (item.tipe_mesin_backup ?? "") : (dataMesin?.tipe_mesin ?? ""),

        nomor_seri: item.is_backup ? (item.nomor_seri_backup ?? "") : (dataMesin?.nomor_seri ?? ""),

        masalah: item.masalah ?? "",

        jam_masuk: item.jam_masuk ?? "",

        jam_keluar: item.jam_keluar ?? "",

        keterangan: item.keterangan ?? "",
      };
    });

    setRows(reportRows);
  }

  async function handleExportPDF() {
    const pdfRows = rows.map((row) => ({
      jenis: row.jenis,

      customer: row.is_backup ? row.customer_backup : (customers.find((c) => c.id === row.customer_id)?.nama ?? ""),

      tipe_mesin: row.tipe_mesin,

      nomor_seri: row.nomor_seri,

      masalah: row.masalah,

      jam_masuk: row.jam_masuk,

      jam_keluar: row.jam_keluar,

      keterangan: row.keterangan,
    }));

    await exportReportPDF(tanggal, "Agus Indra Wijaya", "Barat - Pusat - Utara", note, pdfRows);
  }

  async function handleExportExcel() {
    const excelRows = rows.map((row) => ({
      jenis: row.jenis,

      customer: row.is_backup ? row.customer_backup : (customers.find((c) => c.id === row.customer_id)?.nama ?? ""),

      tipe_mesin: row.is_backup ? row.tipe_mesin : row.tipe_mesin,

      nomor_seri: row.is_backup ? row.nomor_seri : row.nomor_seri,

      masalah: row.masalah,

      jam_masuk: row.jam_masuk,

      jam_keluar: row.jam_keluar,

      keterangan: row.keterangan,
    }));

    await exportReportExcel(tanggal, "Agus Indra Wijaya", "Barat - Pusat - Utara", note, excelRows);
  }

  useEffect(() => {
    loadReport();
  }, [tanggal]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Report Harian</h1>

        <p className="mt-1 text-sm text-gray-500">Input laporan kunjungan teknisi rental.</p>
      </div>
      {/* Action */}
      <div className="flex flex-wrap gap-3">
        <button onClick={handleExportPDF} className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-red-700">
          <FileText size={18} />
          Export PDF
        </button>

        <button onClick={handleExportExcel} className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-emerald-700">
          <FileSpreadsheet size={18} />
          Export Excel
        </button>

        <button onClick={handleSave} disabled={saving} className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50">
          <Save size={18} />
          {saving ? "Menyimpan..." : "Simpan Report"}
        </button>
      </div>
      {/* TABLE */}
      <ReportTable rows={rows} setRows={setRows} customers={customers} mesin={mesin} />

      {/* Toolbar */}
      <ReportToolbar tanggal={tanggal} teknisi="Agus Indra Wijaya" wilayah="Barat - Pusat - Utara" note={note} onTanggal={setTanggal} onNote={setNote} />
    </div>
  );
}
