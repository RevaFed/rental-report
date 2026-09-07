"use client";

import { useEffect, useState } from "react";
import ReportToolbar from "./report-toolbar";
import ReportTable from "./report-table";

import { Customer, Mesin, ReportRow } from "@/types/report";
import { getReportByDate, saveReport } from "@/lib/actions/report";

import { exportReportPDF } from "@/lib/pdf/report";
import { exportReportExcel } from "@/lib/excel/report";
import { FileSpreadsheet, FileText, Save } from "lucide-react";

type Props = {
  customers: Customer[];
  mesin: Mesin[];
  teknisi: string;
  wilayah: string;
  initialTanggal?: string;
};

type ServerReport = {
  id: number;
  jenis: "PM" | "CR" | "OTH" | "FU";
  customer_id: string | null;
  mesin_id: string | null;
  is_backup: boolean | null;
  customer_backup: string | null;
  alamat_backup: string | null;
  tipe_mesin_backup: string | null;
  nomor_seri_backup: string | null;
  masalah: string | null;
  jam_masuk: string | null;
  jam_keluar: string | null;
  keterangan: string | null;
  note: string | null;
};

export default function ReportPage({ customers, mesin, teknisi, wilayah, initialTanggal }: Props) {
  const today = new Date().toISOString().split("T")[0];

  const [note, setNote] = useState("");
  const [tanggal, setTanggal] = useState(initialTanggal ?? today);
  const [rows, setRows] = useState<ReportRow[]>([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);

  async function loadReport() {
    try {
      setLoading(true);

      const result = await getReportByDate(tanggal);
      const data = (result.data ?? []) as ServerReport[];

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
    } catch (error: any) {
      console.error("LOAD REPORT ERROR:", error);
      alert(error?.message ?? "Gagal memuat report.");
    } finally {
      setLoading(false);
    }
  }

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

      await saveReport(payload);

      alert("Report berhasil disimpan.");
      await loadReport();
    } catch (error: any) {
      console.error("SAVE REPORT ERROR:", error);
      alert(error?.message ?? "Gagal menyimpan report.");
    } finally {
      setSaving(false);
    }
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

    await exportReportPDF(tanggal, teknisi, wilayah, note, pdfRows);
  }

  async function handleExportExcel() {
    const excelRows = rows.map((row) => ({
      jenis: row.jenis,
      customer: row.is_backup ? row.customer_backup : (customers.find((c) => c.id === row.customer_id)?.nama ?? ""),
      tipe_mesin: row.tipe_mesin,
      nomor_seri: row.nomor_seri,
      masalah: row.masalah,
      jam_masuk: row.jam_masuk,
      jam_keluar: row.jam_keluar,
      keterangan: row.keterangan,
    }));

    await exportReportExcel(tanggal, teknisi, wilayah, note, excelRows);
  }

  useEffect(() => {
    loadReport();
  }, [tanggal]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Report Harian</h1>
        <p className="mt-1 text-sm text-gray-500">Input laporan kunjungan teknisi rental.</p>
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          onClick={handleExportPDF}
          disabled={loading || rows.length === 0}
          className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <FileText size={18} />
          Export PDF
        </button>

        <button
          onClick={handleExportExcel}
          disabled={loading || rows.length === 0}
          className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <FileSpreadsheet size={18} />
          Export Excel
        </button>

        <button onClick={handleSave} disabled={saving || loading} className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50">
          <Save size={18} />
          {saving ? "Menyimpan..." : "Simpan Report"}
        </button>
      </div>

      <ReportTable rows={rows} setRows={setRows} customers={customers} mesin={mesin} />

      <ReportToolbar tanggal={tanggal} teknisi={teknisi} wilayah={wilayah} note={note} onTanggal={setTanggal} onNote={setNote} />
    </div>
  );
}
