export type ReportRow = {
  id: string;

  jenis: "PM" | "CR" | "OTH" | "FU";

  customer_id: string;

  mesin_id: string;

  // =========================
  // CUSTOMER BACKUP
  // =========================

  is_backup: boolean;

  customer_backup: string;

  alamat_backup: string;

  // =========================

  tipe_mesin: string;

  nomor_seri: string;

  masalah: string;

  jam_masuk: string;

  jam_keluar: string;

  keterangan: string;
};

export type Customer = {
  id: string;
  nama: string;
};

export type Mesin = {
  id: string;
  customer_id: string;
  tipe_mesin: string;
  nomor_seri: string;
};
