"use client";

type Props = {
  value: string;
  onChange: (value: string) => void;
};

export default function CustomerSearch({ value, onChange }: Props) {
  return <input placeholder="Cari customer..." value={value} onChange={(e) => onChange(e.target.value)} className="w-80 rounded-lg border px-3 py-2" />;
}
