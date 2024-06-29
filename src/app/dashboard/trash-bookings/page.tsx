"use client";

import React, { useState } from "react";
import { BookingsDataTable } from "./_components/trash-bookings-table";
import { columns } from "./_components/trash-bookings-table-columns";
import { trpc } from "@/trpc/react";
import { DatePicker } from "@/components/ui/date-picker";
import { BookingsDataRangeContext } from "@/lib/contexts";
import { Skeleton } from "@/components/ui/skeleton";

type Props = {};

export default function TrashBookings(props: Props) {
  const [from, setFrom] = useState<Date>(
    new Date(new Date().getTime() - 70 * 24 * 60 * 60 * 1000),
  );
  const [to, setTo] = useState<Date>(
    new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000),
  );

  const { data: res, isLoading } =
    trpc.trash.getTrashBookingsInInterval.useQuery({
      from,
      to,
    });

  return (
    <>
      <h2 className="flex h-20 items-center bg-primary pl-20 pr-8 font-bold text-primary-foreground">
        Trash Bookings
      </h2>
      <div className="p-4">
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
      </div>
      <div className="h-screen w-screen"></div>
    </>
  );
}
