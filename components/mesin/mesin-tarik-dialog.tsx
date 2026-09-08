"use client";

import { useState, useTransition } from "react";
import { tarikMesin } from "@/lib/actions/mesin";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import type { Mesin } from "@/types/mesin";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mesin: Mesin | null;
};

export default function MesinTarikDialog({
  open,
  onOpenChange,
  mesin,
}: Props) {
  const [alasan, setAlasan] = useState("");
  const [pending, startTransition] = useTransition();

  if (!mesin) return null;

  const handleOpenChange = (value: boolean) => {
    if (!value && !pending) {
      setAlasan("");
    }

    onOpenChange(value);
  };

  const handleTarik = () => {
    if (!alasan.trim()) {
      alert("Alasan penarikan wajib diisi.");
      return;
    }

    startTransition(async () => {
      try {
        const formData = new FormData();
        formData.set("id", mesin.id);
        formData.set("alasan", alasan.trim());

        await tarikMesin(formData);

        setAlasan("");
        onOpenChange(false);

        // Refresh data server tanpa reload penuh halaman.
        window.location.reload();
      } catch (error: any) {
        alert(
          error?.message ??
            "Gagal menarik mesin.",
        );
      }
    });
  };

  return (
    <AlertDialog
      open={open}
      onOpenChange={handleOpenChange}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Tarik Mesin
          </AlertDialogTitle>

          <AlertDialogDescription asChild>
            <div className="space-y-3">
              <p>
                Yakin ingin menarik mesin{" "}
                <strong>
                  {mesin.tipe_mesin}
                </strong>{" "}
                dengan nomor seri{" "}
                <strong>
                  {mesin.nomor_seri}
                </strong>
                ?
              </p>

              <div className="space-y-2 text-left">
                <label
                  htmlFor="alasan-penarikan"
                  className="text-sm font-medium text-gray-900"
                >
                  Alasan Penarikan
                </label>

                <textarea
                  id="alasan-penarikan"
                  value={alasan}
                  onChange={(event) =>
                    setAlasan(event.target.value)
                  }
                  placeholder="Contoh: Mesin sudah ditarik dari customer karena kontrak selesai."
                  rows={4}
                  disabled={pending}
                  className="w-full resize-none rounded-lg border px-3 py-2 text-sm text-gray-900 outline-none focus:border-black"
                />
              </div>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={pending}>
            Batal
          </AlertDialogCancel>

          <AlertDialogAction
            onClick={(event) => {
              event.preventDefault();
              handleTarik();
            }}
            disabled={
              pending ||
              alasan.trim().length < 3
            }
          >
            {pending
              ? "Menarik..."
              : "Tarik Mesin"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
