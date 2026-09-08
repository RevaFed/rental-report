"use client";

import { useEffect, useState } from "react";
import ReportToolbar from "./report-toolbar";
import ReportTable from "./report-table";

import { Customer, Mesin, ReportRow } from "@/types/report";

import { getReportByDate, saveReport } from "@/lib/actions/report";

import { createReportPDF, exportReportPDF } from "@/lib/pdf/report";

import { createReportExcel, exportReportExcel } from "@/lib/excel/report";

import { FileSpreadsheet, FileText, Save, MessageCircle, X } from "lucide-react";

type Props = {
  customers: Customer[];
  mesin: Mesin[];
  teknisi: string;
  wilayah: string;
  initialTanggal?: string;
};

type ServerReport = {
  id: string;
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

  const [shareModal, setShareModal] = useState(false);

  const [sharing, setSharing] = useState(false);

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

      const invalidRows: number[] = [];

      const payload = rows
        .map((row, index) => {
          const customerValid = row.is_backup ? row.customer_backup.trim() !== "" : row.customer_id !== "";

          const mesinValid = row.is_backup || row.mesin_id !== "";

          if (!customerValid || !mesinValid) {
            invalidRows.push(index + 1);
          }

          return {
            report_id: typeof row.id === "string" ? row.id : null,

            tanggal,

            customer_id: row.is_backup ? null : row.customer_id || null,

            mesin_id: row.is_backup ? null : row.mesin_id || null,

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

            urutan: index + 1,
          };
        })
        .filter((row) => {
          const hasAnyData = row.customer_id || row.customer_backup || row.mesin_id || row.masalah || row.jam_masuk || row.jam_keluar || row.keterangan;

          return row.report_id !== null || hasAnyData;
        });

      if (invalidRows.length > 0) {
        alert(`Data pada row ${invalidRows.join(", ")} belum lengkap. Pastikan Customer dan Mesin sudah dipilih.`);

        return;
      }

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

  function getExportRows() {
    return rows.map((row) => ({
      jenis: row.jenis,

      customer: row.is_backup ? row.customer_backup : (customers.find((c) => c.id === row.customer_id)?.nama ?? ""),

      tipe_mesin: row.tipe_mesin,

      nomor_seri: row.nomor_seri,

      masalah: row.masalah,

      jam_masuk: row.jam_masuk,

      jam_keluar: row.jam_keluar,

      keterangan: row.keterangan,
    }));
  }

  async function handleExportPDF() {
    await exportReportPDF(tanggal, teknisi, wilayah, note, getExportRows());
  }

  async function handleExportExcel() {
    await exportReportExcel(tanggal, teknisi, wilayah, note, getExportRows());
  }

  function getShareText() {
    return ["Report Harian", "", `Tanggal: ${tanggal}`, `Teknisi: ${teknisi}`, `Wilayah: ${wilayah}`, `Jumlah laporan: ${rows.length}`, note ? `Catatan: ${note}` : ""].filter(Boolean).join("\n");
  }

  async function shareFile(file: File) {
    if (typeof navigator === "undefined" || !navigator.share) {
      return false;
    }

    try {
      const canShare =
        typeof navigator.canShare === "function"
          ? navigator.canShare({
              files: [file],
            })
          : false;

      if (!canShare) {
        return false;
      }

      await navigator.share({
        title: `Report Harian ${tanggal}`,
        text: getShareText(),
        files: [file],
      });

      return true;
    } catch (error: any) {
      if (error?.name === "AbortError") {
        return true;
      }

      console.error("SHARE ERROR:", error);

      return false;
    }
  }

  async function handleSharePDF() {
    try {
      setSharing(true);

      const file = await createReportPDF(tanggal, teknisi, wilayah, note, getExportRows());

      const shared = await shareFile(file);

      if (!shared) {
        const url = URL.createObjectURL(file);

        const link = document.createElement("a");

        link.href = url;
        link.download = file.name;

        document.body.appendChild(link);

        link.click();
        link.remove();

        URL.revokeObjectURL(url);

        window.open(`https://wa.me/?text=${encodeURIComponent(getShareText())}`, "_blank");

        alert("PDF sudah didownload. WhatsApp dibuka. Silakan lampirkan PDF tersebut.");
      }

      setShareModal(false);
    } catch (error: any) {
      console.error("SHARE PDF ERROR:", error);

      alert(error?.message ?? "Gagal membuat PDF.");
    } finally {
      setSharing(false);
    }
  }

  async function handleShareExcel() {
    try {
      setSharing(true);

      const file = await createReportExcel(tanggal, teknisi, wilayah, note, getExportRows());

      const shared = await shareFile(file);

      if (!shared) {
        const url = URL.createObjectURL(file);

        const link = document.createElement("a");

        link.href = url;
        link.download = file.name;

        document.body.appendChild(link);

        link.click();
        link.remove();

        URL.revokeObjectURL(url);

        window.open(`https://wa.me/?text=${encodeURIComponent(getShareText())}`, "_blank");

        alert("Excel sudah didownload. WhatsApp dibuka. Silakan lampirkan Excel tersebut.");
      }

      setShareModal(false);
    } catch (error: any) {
      console.error("SHARE EXCEL ERROR:", error);

      alert(error?.message ?? "Gagal membuat Excel.");
    } finally {
      setSharing(false);
    }
  }

  useEffect(() => {
    loadReport();
  }, [tanggal]);

  return (
    <div className="space-y-6">
      {/* HEADER */}

      <div>
        <h1 className="text-3xl font-bold tracking-tight">Report Harian</h1>

        <p className="mt-1 text-sm text-gray-500">Input laporan kunjungan teknisi rental.</p>
      </div>

      {/* ACTION */}

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

        <button
          onClick={() => setShareModal(true)}
          disabled={loading || rows.length === 0 || sharing}
          className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <MessageCircle size={18} />
          Share ke WhatsApp
        </button>

        <button onClick={handleSave} disabled={saving || loading} className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50">
          <Save size={18} />

          {saving ? "Menyimpan..." : "Simpan Report"}
        </button>
      </div>

      {/* TABLE */}

      <ReportTable rows={rows} setRows={setRows} customers={customers} mesin={mesin} />

      {/* TOOLBAR */}

      <ReportToolbar tanggal={tanggal} teknisi={teknisi} wilayah={wilayah} note={note} onTanggal={setTanggal} onNote={setNote} />

      {/* SHARE MODAL */}

      {shareModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold">Share Report</h2>

                <p className="mt-1 text-sm text-gray-500">Pilih format file untuk dibagikan ke WhatsApp.</p>
              </div>

              <button type="button" onClick={() => setShareModal(false)} disabled={sharing} className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700">
                <X size={20} />
              </button>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={handleSharePDF}
                disabled={sharing}
                className="flex flex-col items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 p-5 text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <FileText size={30} />

                <span className="font-semibold">PDF</span>

                <span className="text-xs text-red-500">Dokumen PDF</span>
              </button>

              <button
                type="button"
                onClick={handleShareExcel}
                disabled={sharing}
                className="flex flex-col items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-5 text-emerald-700 transition hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <FileSpreadsheet size={30} />

                <span className="font-semibold">Excel</span>

                <span className="text-xs text-emerald-500">File Excel</span>
              </button>
            </div>

            {sharing && <div className="mt-5 text-center text-sm text-gray-500">Menyiapkan file...</div>}

            <button type="button" onClick={() => setShareModal(false)} disabled={sharing} className="mt-5 w-full rounded-lg border px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-50">
              Batal
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
