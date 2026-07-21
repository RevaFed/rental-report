export type Customer = {
  id: string;
  nama: string;
};

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
