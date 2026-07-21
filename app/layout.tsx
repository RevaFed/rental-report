import type { Metadata } from "next";
import { Geist, Geist_Mono, JetBrains_Mono } from "next/font/google";

import "./globals.css";

import { cn } from "@/lib/utils";

const geistSans = Geist({
  subsets: ["latin"],
  variable: "--font-sans",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: {
    default: "Rental Report",
    template: "%s | Rental Report",
  },
  description: "Aplikasi Laporan Harian Teknisi Rental",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning className={cn("h-full antialiased", geistSans.variable, geistMono.variable, jetbrainsMono.variable)}>
      <body className={cn("min-h-screen", "bg-gray-50", "text-gray-900", "font-mono")}>{children}</body>
    </html>
  );
}
