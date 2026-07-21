type Props = {
  title: string;
  value: number;
  color: "emerald" | "sky" | "amber" | "rose";
};

const colors = {
  emerald: {
    bg: "bg-emerald-100",
    text: "text-emerald-600",
    border: "border-emerald-200",
  },
  sky: {
    bg: "bg-sky-100",
    text: "text-sky-600",
    border: "border-sky-200",
  },
  amber: {
    bg: "bg-amber-100",
    text: "text-amber-600",
    border: "border-amber-200",
  },
  rose: {
    bg: "bg-rose-100",
    text: "text-rose-600",
    border: "border-rose-200",
  },
};

export default function JenisCard({ title, value, color }: Props) {
  const c = colors[color];

  return (
    <div className={`rounded-2xl border ${c.border} bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">Jenis</p>

          <h3 className={`mt-2 text-xl font-bold ${c.text}`}>{title}</h3>
        </div>

        <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${c.bg}`}>
          <span className={`text-lg font-bold ${c.text}`}>{value}</span>
        </div>
      </div>
    </div>
  );
}
