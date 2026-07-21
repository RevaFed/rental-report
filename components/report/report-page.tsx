"use client";

import { useEffect, useState } from "react";

import ReportToolbar from "./report-toolbar";
import ReportTable from "./report-table";

import { Customer, Mesin, ReportRow } from "@/types/report";
import { supabase } from "@/lib/supabase/client";

import { exportReportPDF } from "@/lib/pdf/report";

type Props = {
  customers: Customer[];
  mesin: Mesin[];
  initialTanggal?: string;
};

export default function ReportPage({ customers, mesin, initialTanggal }: Props) {
  const today = new Date().toISOString().split("T")[0];

  const [tanggal, setTanggal] = useState(initialTanggal ?? today);

  const [rows, setRows] = useState<ReportRow[]>([]);

  const [saving, setSaving] = useState(false);

  async function handleSave() {
    try {
      setSaving(true);

      const payload = rows
        .filter((row) => row.customer_id !== "" && row.mesin_id !== "")
        .map((row) => ({
          tanggal,
          customer_id: row.customer_id,
          mesin_id: row.mesin_id,
          jenis: row.jenis,
          masalah: row.masalah || null,
          jam_masuk: row.jam_masuk || null,
          jam_keluar: row.jam_keluar || null,
          keterangan: row.keterangan || null,
        }));

      if (payload.length === 0) {
        alert("Belum ada data yang bisa disimpan.");
        return;
      }

      const { error } = await supabase.from("report_harian").insert(payload);

      if (error) throw error;

      alert("Report berhasil disimpan.");
    } catch (error) {
      console.error(error);
      alert("Gagal menyimpan report.");
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

    const reportRows: ReportRow[] = data.map((item) => {
      // Cari data mesin dari array mesin yang sudah dikirim ke ReportPage
      const dataMesin = mesin.find((m) => m.id === item.mesin_id);

      return {
        id: item.id,

        jenis: item.jenis,

        customer_id: item.customer_id,

        mesin_id: item.mesin_id,

        tipe_mesin: dataMesin?.tipe_mesin ?? "",

        nomor_seri: dataMesin?.nomor_seri ?? "",

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
      customer: customers.find((c) => c.id === row.customer_id)?.nama ?? "",
      tipe_mesin: row.tipe_mesin,
      nomor_seri: row.nomor_seri,
      masalah: row.masalah,
      jam_masuk: row.jam_masuk,
      jam_keluar: row.jam_keluar,
      keterangan: row.keterangan,
    }));

    await exportReportPDF(tanggal, "Agus Indra Wijaya", "Barat - Pusat - Utara", pdfRows);
  }

  useEffect(() => {
    loadReport();
  }, [tanggal]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Report Harian</h1>

          <p className="mt-1 text-sm text-gray-500">Input laporan kunjungan teknisi rental.</p>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={handleExportPDF} className="inline-flex items-center rounded-lg bg-red-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-red-700">
            📄 Export PDF
          </button>

          <button onClick={handleSave} disabled={saving} className="inline-flex items-center rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50">
            {saving ? "Menyimpan..." : "💾 Simpan Report"}
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <ReportToolbar tanggal={tanggal} teknisi="Agus Indra Wijaya" wilayah="Barat - Pusat - Utara" onTanggal={setTanggal} />

      {/* Table */}
      <ReportTable rows={rows} setRows={setRows} customers={customers} mesin={mesin} />
    </div>
  );
}
