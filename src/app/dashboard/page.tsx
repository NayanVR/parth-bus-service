"use client";

import React, { useMemo, useState } from "react";
import { BookingsDataTable } from "./_components/bookings-table";
import { columns } from "./_components/bookings-table-columns";
import { trpc } from "@/trpc/react";
import { DatePicker } from "@/components/ui/date-picker";
import { BookingsDataRangeContext } from "@/lib/contexts";
import { CSVLink } from "react-csv";
import {
  formatIndianDateFromDate,
  getDefaultStartDate,
  getDefaultEndDate,
} from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

type Props = {};

export default function Dashboard(props: Props) {
  const [from, setFrom] = useState<Date>(getDefaultStartDate());
  const [to, setTo] = useState<Date>(getDefaultEndDate());

  const { data: res, isLoading } = trpc.bookings.getBookingsInInterval.useQuery(
    {
      from,
      to,
    },
  );

  const vehicles = trpc.vehicles.getAllVehicles.useQuery().data?.data.vehicles;

  const csvData = useMemo(() => {
    return res?.data.bookings.map((booking) => ({
      ID: booking.id,
      "Client Name": booking.clientName,
      "Client Phone": booking.clientPhone,
      "Client Alt Phone": booking.clientAltPhone,
      "Client Address": booking.clientAddress,
      Vehicle:
        vehicles?.find((vehicle) => vehicle.id === booking.vehicleId)?.type ||
        "N/A",
      "Travel Place From": booking.travelPlaceFrom,
      "Travel Place To": booking.travelPlaceTo,
      "Travel Date From": formatIndianDateFromDate(booking.travelDateFrom),
      "Travel Date To": formatIndianDateFromDate(booking.travelDateTo),
      "No of Passengers": booking.noOfPassengers,
      "Booking Date": formatIndianDateFromDate(booking.bookingDate),
      "Estimated KMs": booking.estimatedKMs || "N/A",
      "Cost Per KM": booking.costPerKm || "N/A",
      "Estimated Cost": booking.estimatedCost,
      "Advance Payment": booking.advancePayment,
      "Remaining Payment": booking.remainingPayment,
    }));
  }, [res?.data.bookings]);

  return (
    <>
      <h2 className="flex h-20 items-center bg-primary pl-20 pr-8 font-bold text-primary-foreground">
        Dashboard
      </h2>
      <div className="p-4 pb-8">
        <div className="my-3 flex flex-col gap-4 md:flex-row md:items-center">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              From
            </label>
            <DatePicker
              date={from}
              setDate={(date) => {
                if (date && date <= to) setFrom(date);
              }}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              To
            </label>
            <DatePicker
              date={to}
              setDate={(date) => {
                if (date && date >= from) setTo(date);
              }}
            />
          </div>
        </div>
        {isLoading && (
          <div className="flex w-full flex-col gap-4 py-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-72 w-full" />
          </div>
        )}
        {res?.data.bookings && (
          <BookingsDataRangeContext.Provider value={{ from, to }}>
            <BookingsDataTable columns={columns} data={res.data.bookings} />
          </BookingsDataRangeContext.Provider>
        )}
        {csvData && csvData.length > 0 && (
          <CSVLink
            className="rounded-md bg-primary px-6 py-3 font-normal text-primary-foreground"
            data={csvData}
          >
            Download CSV
          </CSVLink>
        )}
      </div>
    </>
  );
}
