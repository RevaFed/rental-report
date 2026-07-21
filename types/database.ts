/* =========================
   USER
========================= */

export type User = {
  id: number;
  username: string;
  nama: string;
  password?: string;
};

/* =========================
   CUSTOMER
========================= */

export type Customer = {
  id: string;
  nama: string;
  alamat: string;
};

/* =========================
   MESIN
========================= */

export type Mesin = {
  id: string;
  customer_id: string;
  tipe_mesin: string;
  nomor_seri: string;

  customer: {
    id: string;
    nama: string;
  }[];
};

/* =========================
   REPORT ROW
========================= */

export type ReportRow = {
  id: number;

  jenis: "PM" | "CR" | "FU" | "OTH";

  customer_id: string;

  mesin_id: string;

  tipe_mesin: string;

  nomor_seri: string;

  masalah: string;

  jam_masuk: string;

  jam_keluar: string;

  keterangan: string;
};

/* =========================
   REPORT HARIAN
========================= */

export type ReportHarian = {
  id: string;

  tanggal: string;

  jenis: string;

  customer: {
    nama: string;
  }[];

  mesin: {
    nomor_seri: string;
  }[];

  jam_masuk: string;

  jam_keluar: string;

  masalah: string;

  keterangan: string;
};
