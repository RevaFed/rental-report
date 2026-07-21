"use client";

import { useTransition } from "react";

import { deleteMesin } from "@/lib/actions/mesin";

import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;

  mesin: {
    id: string;
    tipe_mesin: string;
  } | null;
};

export default function MesinDeleteDialog({ open, onOpenChange, mesin }: Props) {
  const [pending, startTransition] = useTransition();

  if (!mesin) return null;

  const handleDelete = () => {
    startTransition(async () => {
      await deleteMesin(mesin.id);
      onOpenChange(false);
    });
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Hapus Mesin</AlertDialogTitle>

          <AlertDialogDescription>
            Hapus mesin
            <b> {mesin.tipe_mesin}</b>?
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel>Batal</AlertDialogCancel>

          <AlertDialogAction onClick={handleDelete} disabled={pending}>
            {pending ? "Menghapus..." : "Hapus"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
