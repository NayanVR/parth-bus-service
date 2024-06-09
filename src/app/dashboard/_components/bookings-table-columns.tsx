"use client";

import { Button } from "@/components/ui/button";
import { formatIndianDateFromDate } from "@/lib/utils";
import { SelectBooking } from "@/server/db/schema";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, EditIcon, Trash2Icon } from "lucide-react";

export const columns: ColumnDef<SelectBooking>[] = [
  {
    header: "ID",
    accessorKey: "id",
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
  },
  {
    header: "Travel Place",
    accessorKey: "travelPlace",
  },
  {
    header: "Travel From",
    accessorKey: "travelFrom",
    cell: ({ row }) => formatIndianDateFromDate(row.original.travelFrom),
  },
  {
    header: "Travel To",
    accessorKey: "travelTo",
    cell: ({ row }) => formatIndianDateFromDate(row.original.travelTo),
  },
  {
    header: "No Of Travel Days",
    accessorKey: "noOfTravelDays",
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
    header: "Return Date",
    accessorKey: "returnDate",
    cell: ({ row }) => formatIndianDateFromDate(row.original.returnDate),
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
      const currentRow = row.original;
      return (
        <div className="flex gap-2">
          <EditIcon
            className="cursor-pointer"
            onClick={() => {
              // Open edit modal
            }}
            size={20}
          />
          <Trash2Icon
            className="cursor-pointer"
            onClick={() => {
              // Open delete modal
            }}
            size={20}
          />
        </div>
      );
    },
  },
];
