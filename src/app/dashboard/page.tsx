"use client";

import React, { createContext, useMemo, useState } from "react";
import { BookingsDataTable } from "./_components/bookings-table";
import { columns } from "./_components/bookings-table-columns";
import { trpc } from "@/trpc/react";
import { DatePicker } from "@/components/ui/date-picker";
import { BookingsDataRangeContext } from "@/lib/contexts";

type Props = {};

export default function Dashboard(props: Props) {
  const [from, setFrom] = useState<Date>(
    new Date(new Date().getTime() - 70 * 24 * 60 * 60 * 1000),
  );
  const [to, setTo] = useState<Date>(
    new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000),
  );

  const { data: res } = trpc.bookings.getBookingsInInterval.useQuery({
    from,
    to,
  });

  // const csvData = useMemo(() => {
  //   return res?.data.bookings;
  // }, [res]);

  return (
    <>
      <h2 className="flex h-20 items-center bg-primary px-8 font-bold text-primary-foreground">
        Dashboard
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
        {res?.data.bookings && (
          <BookingsDataRangeContext.Provider value={{ from, to }}>
            <BookingsDataTable columns={columns} data={res.data.bookings} />
          </BookingsDataRangeContext.Provider>
        )}
        {/* <CSVLink data={csvData ?? []}>Export CSV</CSVLink> */}
      </div>
    </>
  );
}
