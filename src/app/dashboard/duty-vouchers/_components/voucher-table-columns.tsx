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
import { RouterOutputs, trpc } from "@/trpc/react";
import VoucherDialog from "./voucher-dialog";
import { toast } from "sonner";

export const columns: ColumnDef<
  RouterOutputs["driverDuty"]["getDriverDutyVoucherInInterval"]["data"]["driverDutyVouchers"][0]
>[] = [
  {
    header: "URL",
    accessorKey: "id",
    cell: ({ row }) => {
      return (
        <button
          className="rounded-xl bg-muted p-1 px-3 transition-all hover:bg-green-700 hover:text-white"
          onClick={() => {
            navigator.clipboard.writeText(
              `${window.location.origin}/duty-vouchers/${row.original.id}`,
            );
            toast.success("Copied to clipboard");
          }}
        >
          copy
        </button>
      );
    },
  },
  {
    accessorKey: "driverName",
    header: ({ column }) => {
      return (
        <Button
          variant="link"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Driver Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
  {
    header: "Client Name",
    accessorKey: "clientName",
  },
  {
    header: "Client Address",
    accessorKey: "clientAddress",
  },
  {
    header: "Client Phone",
    accessorKey: "clientPhone",
  },
  {
    header: "Client Alt Phone",
    accessorKey: "clientAltPhone",
  },
  {
    header: "Vehicle ID",
    accessorKey: "vehicleId",
    cell: ({ row }) => {
      const vehicles =
        trpc.vehicles.getAllVehicles.useQuery().data?.data.vehicles;
      const vehicle = vehicles?.find(
        (vehicle) => vehicle.id === row.original.vehicleId,
      );
      return vehicle?.plateNumber ?? "N/A";
    },
  },
  {
    header: "Driver Expense",
    accessorKey: "driverExpense",
  },
  {
    header: "Odometer Start",
    accessorKey: "odometerStart",
  },
  {
    header: "Odometer End",
    accessorKey: "odometerEnd",
  },
  {
    header: "Payment Collected",
    accessorKey: "paymentCollected",
  },
  {
    header: "Remarks",
    accessorKey: "remarks",
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const trpcUtils = trpc.useUtils();
      const [isOpen, setIsOpen] = useState(false);
      const currentRow = row.original;
      const deleteDriverDutyVoucher =
        trpc.driverDuty.deleteDriverDutyVoucher.useMutation({
          onSuccess: () => {
            trpcUtils.driverDuty.getDriverDutyVoucherInInterval.refetch();
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
                  onClick={() => deleteDriverDutyVoucher.mutate(currentRow.id)}
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
