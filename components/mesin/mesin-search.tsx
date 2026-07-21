"use client";

type Props = {
  value: string;
  onChange: (value: string) => void;
};

export default function MesinSearch({ value, onChange }: Props) {
  return <input value={value} onChange={(e) => onChange(e.target.value)} placeholder="Cari customer, tipe mesin, nomor seri..." className="w-80 rounded-lg border px-3 py-2" />;
}
