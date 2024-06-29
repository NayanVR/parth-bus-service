"use client";

import { Button } from "@/components/ui/button";
import { daysBetweenDates, formatIndianDateFromDate } from "@/lib/utils";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, EditIcon, Trash2Icon } from "lucide-react";
import BookingDialog from "./booking-dialog";
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
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";

export const columns: ColumnDef<
  RouterOutputs["bookings"]["getBookingsInInterval"]["data"]["bookings"][0]
>[] = [
  {
    header: "ID",
    accessorKey: "id",
    cell: ({ row }) => (
      <button
        className="rounded-xl bg-muted p-1 px-3 transition-all hover:bg-green-700 hover:text-white"
        onClick={() => {
          navigator.clipboard.writeText(
            `${window.location.origin}/duty-vouchers/${row.original.voucherId}`,
          );
          toast.success("Copied to clipboard");
        }}
      >
        {row.original.id}
      </button>
    ),
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
    header: "Estimated KMs",
    accessorKey: "estimatedKMs",
    cell: ({ row }) => row.original.estimatedKMs ?? "N/A",
  },
  {
    header: "Cost Per KM",
    accessorKey: "costPerKm",
    cell: ({ row }) => row.original.costPerKm ?? "N/A",
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
    header: "Payment Collected By Driver",
    accessorKey: "paymentCollected",
  },
  {
    header: "Payment Received At Parth",
    accessorKey: "isPaymentCollected",
    cell: ({ row }) => {
      const trpcUtils = trpc.useUtils();
      const updatePaymentCollected =
        trpc.bookings.updatePaymentCollected.useMutation({
          onSuccess: () => {
            trpcUtils.bookings.getBookingsInInterval.refetch();
          },
        });
      return (
        <Checkbox
          checked={row.original.isPaymentCollected}
          onCheckedChange={(checked) => {
            updatePaymentCollected.mutate({
              id: row.original.id,
              isPaymentCollected: Boolean(checked),
            });
          }}
        />
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
      const deleteBooking = trpc.bookings.deleteBooking.useMutation({
        onSuccess: () => {
          trpcUtils.bookings.getBookingsInInterval.refetch();
        },
      });

      return (
        <div className="flex gap-2">
          <BookingDialog
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
                  onClick={() => deleteBooking.mutate(currentRow.id)}
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
