"use client";

import { Button } from "@/components/ui/button";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, Trash2Icon, Undo2Icon } from "lucide-react";
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
import { RouterOutputs, trpc } from "@/trpc/react";
import { toast } from "sonner";

export const columns: ColumnDef<
  RouterOutputs["trash"]["getTrashVehicles"]["data"]["vehicles"][0]
>[] = [
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
      const currentRow = row.original;
      const restoreMaintenance = trpc.trash.restoreVehicle.useMutation({
        onSuccess: () => {
          trpcUtils.trash.getTrashVehicles.refetch();
        },
      });
      const deleteVehicle = trpc.trash.permanentDeleteVehicle.useMutation({
        onSuccess: () => {
          trpcUtils.trash.getTrashVehicles.refetch();
        },
      });

      return (
        <div className="flex gap-2">
          <Undo2Icon
            className="cursor-pointer text-green-700"
            size={20}
            onClick={() => {
              const promise = restoreMaintenance.mutateAsync(currentRow.id);
              toast.promise(promise, {
                loading: "Restoring vehicle...",
                success: "Vehicle restored",
                error: "Failed to restore vehicle",
              });
            }}
          />
          <AlertDialog>
            <AlertDialogTrigger>
              <Trash2Icon className="text-destructive" size={20} />
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will delete all bookings and driver vouchers associated
                  with this vehicle. This action cannot be undone. This will
                  permanently data from servers.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-destructive"
                  onClick={() => {
                    const promise = deleteVehicle.mutateAsync(currentRow.id);
                    toast.promise(promise, {
                      loading: "Deleting vehicle permanently...",
                      success: "Vehicle deleted permanently",
                      error: "Failed to delete vehicle",
                    });
                  }}
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
