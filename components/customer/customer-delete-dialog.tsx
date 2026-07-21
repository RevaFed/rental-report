"use client";

import { useTransition } from "react";

import { deleteCustomer } from "@/lib/actions/customer";

import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customer: {
    id: string;
    nama: string;
  } | null;
};

export default function CustomerDeleteDialog({ open, onOpenChange, customer }: Props) {
  const [pending, startTransition] = useTransition();

  if (!customer) return null;

  const handleDelete = () => {
    startTransition(async () => {
      await deleteCustomer(customer.id);
      onOpenChange(false);
    });
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Hapus Customer</AlertDialogTitle>

          <AlertDialogDescription>
            Apakah yakin ingin menghapus customer
            <b> {customer.nama}</b> ?
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel>Batal</AlertDialogCancel>

          <AlertDialogAction disabled={pending} onClick={handleDelete}>
            {pending ? "Menghapus..." : "Hapus"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
