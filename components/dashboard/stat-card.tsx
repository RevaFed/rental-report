import { ReactNode } from "react";

type Props = {
  title: string;
  value: number;
  icon: ReactNode;
  color: "blue" | "green" | "orange" | "red" | "emerald" | "rose";
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

  emerald: {
    bg: "bg-emerald-100",
    text: "text-emerald-600",
    border: "border-emerald-200",
  },

  rose: {
    bg: "bg-rose-100",
    text: "text-rose-600",
    border: "border-rose-200",
  },
};

export default function StatCard({ title, value, icon, color }: Props) {
  const c = colors[color];

  return (
    <div
      className={`
        rounded-2xl
        border
        ${c.border}
        bg-white
        p-5
        shadow-sm
        transition-all
        duration-300
        hover:-translate-y-1
        hover:shadow-lg
      `}
    >
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium uppercase tracking-wide text-gray-500">{title}</p>

          <h2 className="mt-2 text-2xl font-bold text-gray-900 md:text-3xl">{value.toLocaleString("id-ID")}</h2>
        </div>

        <div
          className={`
    flex
    h-9
    w-9
    items-center
    justify-center
    rounded-lg
    ${c.bg}
    ${c.text}
  `}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}
