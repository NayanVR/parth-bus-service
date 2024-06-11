"use client";

import { Button } from "@/components/ui/button";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, EditIcon, Trash2Icon } from "lucide-react";
import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { trpc } from "@/trpc/react";
import { SelectVehicle } from "@/server/db/schema";
import VoucherDialog from "./vehicles-dialog";

export const columns: ColumnDef<SelectVehicle>[] = [
  {
    header: "ID",
    accessorKey: "id",
  },
  {
    accessorKey: "plateNumber",
    header: ({ column }) => {
      return (
        <Button
          variant="link"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Plate Number
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
  {
    accessorKey: "type",
    header: ({ column }) => {
      return (
        <Button
          variant="link"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Vehicle Type
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const trpcUtils = trpc.useUtils();
      const [isOpen, setIsOpen] = useState(false);
      const currentRow = row.original;
      const deleteVehicle = trpc.vehicles.deleteVehicle.useMutation({
        onSuccess: () => {
          trpcUtils.vehicles.getAllVehicles.refetch();
        },
      });

      return (
        <div className="flex gap-2">
          <VoucherDialog
            isOpen={isOpen}
            setIsOpen={setIsOpen}
            isEdit={true}
            data={currentRow}
          />
          <EditIcon
            className="cursor-pointer"
            onClick={() => {
              setIsOpen(true);
            }}
            size={20}
          />
          <AlertDialog>
            <AlertDialogTrigger>
              <Trash2Icon size={20} />
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently data from
                  servers.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-destructive"
                  onClick={() => deleteVehicle.mutate(currentRow.id)}
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      );
    },
  },
];
