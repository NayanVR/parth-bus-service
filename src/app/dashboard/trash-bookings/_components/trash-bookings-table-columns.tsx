"use client";

import { Button } from "@/components/ui/button";
import { daysBetweenDates, formatIndianDateFromDate } from "@/lib/utils";
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
  RouterOutputs["trash"]["getTrashBookingsInInterval"]["data"]["bookings"][0]
>[] = [
  {
    header: "ID",
    accessorKey: "id",
  },
  {
    header: "Driver voucher",
    accessorKey: "voucherId",
    cell: ({ row }) => {
      return (
        <button
          className="rounded-xl bg-muted p-1 px-3 transition-all hover:bg-green-700 hover:text-white"
          onClick={() => {
            navigator.clipboard.writeText(
              `${window.location.origin}/duty-vouchers/${row.original.voucherId}`,
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
    accessorKey: "clientName",
    header: ({ column }) => {
      return (
        <Button
          variant="link"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Client Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
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
      return vehicle?.type ?? "N/A";
    },
  },
  {
    header: "Travel Place From",
    accessorKey: "travelPlaceFrom",
  },
  {
    header: "Travel Place To",
    accessorKey: "travelPlaceTo",
  },
  {
    header: "Travel From",
    accessorKey: "traveDatelFrom",
    cell: ({ row }) => formatIndianDateFromDate(row.original.travelDateFrom),
  },
  {
    header: "Travel To",
    accessorKey: "travelDateTo",
    cell: ({ row }) => formatIndianDateFromDate(row.original.travelDateTo),
  },
  {
    header: "No Of Travel Days",
    accessorKey: "noOfTravelDays",
    cell: ({ row }) =>
      daysBetweenDates(row.original.travelDateFrom, row.original.travelDateTo),
  },
  {
    header: "No Of Passengers",
    accessorKey: "noOfPassengers",
  },
  {
    header: "Booking Date",
    accessorKey: "bookingDate",
    cell: ({ row }) => formatIndianDateFromDate(row.original.bookingDate),
  },
  {
    header: "Estimated Cost",
    accessorKey: "estimatedCost",
  },
  {
    header: "Advance Payment",
    accessorKey: "advancePayment",
  },
  {
    header: "Remaining Payment",
    accessorKey: "remainingPayment",
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const trpcUtils = trpc.useUtils();
      const currentRow = row.original;
      const restoreBooking = trpc.trash.restoreBooking.useMutation({
        onSuccess: () => {
          trpcUtils.trash.getTrashBookingsInInterval.refetch();
        },
      });
      const deleteBooking = trpc.trash.permanentDeleteBooking.useMutation({
        onSuccess: () => {
          trpcUtils.trash.getTrashBookingsInInterval.refetch();
        },
      });

      return (
        <div className="flex gap-2">
          <Undo2Icon
            className="cursor-pointer text-green-700"
            size={20}
            onClick={() => {
              const promise = restoreBooking.mutateAsync(currentRow.id);
              toast.promise(promise, {
                loading: "Restoring booking...",
                success: "Booking restored",
                error: "Failed to restore booking",
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
                  This action cannot be undone. This will permanently data from
                  servers.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-destructive"
                  onClick={() => {
                    const promise = deleteBooking.mutateAsync(currentRow.id);
                    toast.promise(promise, {
                      loading: "Deleting booking permanently...",
                      success: "Booking deleted permanently",
                      error: "Failed to delete booking",
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
