"use client";

import { ColumnDef } from "@tanstack/react-table";
import { EditIcon, Trash2Icon } from "lucide-react";
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
import { RouterOutputs, trpc } from "@/trpc/react";
import MaintenanceDialog from "./maintenance-dialog";
import { formatIndianDateFromDate } from "@/lib/utils";

export const columns: ColumnDef<
  RouterOutputs["maintenance"]["getMaintenancesInInterval"]["data"]["maintenances"][0]
>[] = [
  {
    header: "ID",
    accessorKey: "id",
  },
  {
    accessorKey: "vehicleType",
    header: "Vehicle Type",
    cell: ({ row }) => {
      const vehicles =
        trpc.vehicles.getAllVehicles.useQuery().data?.data.vehicles;
      const vehicle = vehicles?.find(
        (vehicle) => vehicle.id === row.original.vehicleId,
      );
      return vehicle?.type || "N/A";
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
    accessorKey: "remarks",
    header: "Remarks",
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const trpcUtils = trpc.useUtils();
      const [isOpen, setIsOpen] = useState(false);
      const currentRow = row.original;
      const deleteMaintenance = trpc.maintenance.deleteMaintenance.useMutation({
        onSuccess: () => {
          trpcUtils.maintenance.getMaintenancesInInterval.refetch();
        },
      });

      return (
        <div className="flex gap-2">
          <MaintenanceDialog
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
              <Trash2Icon className="text-destructive" size={20} />
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  Move this record to trash.
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
