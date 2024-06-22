"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Trash2Icon, Undo2Icon } from "lucide-react";
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
import { formatIndianDateFromDate } from "@/lib/utils";

export const columns: ColumnDef<
  RouterOutputs["trash"]["getTrashMaintenancesInInterval"]["data"]["maintenances"][0]
>[] = [
  {
    header: "ID",
    accessorKey: "id",
  },
  {
    accessorKey: "vehicleId",
    header: "Vehicle ID",
    cell: ({ row }) => {
      const vehicles =
        trpc.vehicles.getAllVehicles.useQuery().data?.data.vehicles;
      const vehicle = vehicles?.find(
        (vehicle) => vehicle.id === row.original.vehicleId,
      );
      return vehicle?.plateNumber || "N/A";
    },
  },
  {
    accessorKey: "maintenanceCost",
    header: "Maintenance Cost",
  },
  {
    accessorKey: "maintenanceDateFrom",
    header: "Maintenance From",
    cell: ({ row }) =>
      formatIndianDateFromDate(row.original.maintenanceDateFrom),
  },
  {
    accessorKey: "maintenanceDateTo",
    header: "Maintenance To",
    cell: ({ row }) => formatIndianDateFromDate(row.original.maintenanceDateTo),
  },
  {
    accessorKey: "odometerKm",
    header: "Odometer Km",
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const trpcUtils = trpc.useUtils();
      const currentRow = row.original;
      const restoreMaintenance = trpc.trash.restoreMaintenance.useMutation({
        onSuccess: () => {
          trpcUtils.trash.getTrashMaintenancesInInterval.refetch();
        },
      });
      const deleteMaintenance =
        trpc.trash.permanentDeleteMaintenance.useMutation({
          onSuccess: () => {
            trpcUtils.trash.getTrashMaintenancesInInterval.refetch();
          },
        });

      return (
        <div className="flex gap-2">
          <Undo2Icon
            className="cursor-pointer text-green-700"
            size={20}
            onClick={() => {
              restoreMaintenance.mutate(currentRow.id);
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
                  This action cannot be undone. This will permanently data from
                  servers.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-destructive"
                  onClick={() => deleteMaintenance.mutate(currentRow.id)}
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
