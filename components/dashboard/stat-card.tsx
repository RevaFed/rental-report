import { ReactNode } from "react";

type Props = {
  title: string;
  value: number;
  icon: ReactNode;
  color: "blue" | "green" | "orange" | "red";
};

const colors = {
  blue: {
    bg: "bg-blue-100",
    text: "text-blue-600",
    border: "border-blue-200",
  },

  green: {
    bg: "bg-green-100",
    text: "text-green-600",
    border: "border-green-200",
  },

  orange: {
    bg: "bg-orange-100",
    text: "text-orange-600",
    border: "border-orange-200",
  },

  red: {
    bg: "bg-red-100",
    text: "text-red-600",
    border: "border-red-200",
  },
};

export default function StatCard({ title, value, icon, color }: Props) {
  const c = colors[color];

  return (
    <div className={`rounded-2xl border ${c.border} bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg`}>
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0 flex-1">
          <p className="text-sm text-gray-500">{title}</p>

          <h2 className="mt-2 text-3xl font-bold md:text-4xl">{value}</h2>
        </div>

        <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${c.bg} ${c.text} md:h-14 md:w-14`}>{icon}</div>
      </div>
    </div>
  );
}
