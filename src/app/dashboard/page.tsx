"use client";

import React, { useEffect, useState } from "react";
import { DataTable } from "./_components/bookings-table";
import { columns } from "./_components/bookings-table-columns";
import { RouterOutputs, trpc } from "@/trpc/react";
import { DatePicker } from "@/components/ui/date-picker";

type Props = {};

export default function Dashboard(props: Props) {
  const [from, setFrom] = useState<Date>(
    new Date(new Date().getTime() - 70 * 24 * 60 * 60 * 1000),
  );
  const [to, setTo] = useState<Date>(
    new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000),
  );
  //   const [data, setdata] = useState<
  //     RouterOutputs["admin"]["getBookingsInInterval"]["data"]["bookings"]
  //   >([]);
  const { data: res } = trpc.admin.getBookingsInInterval.useQuery({ from, to });

  //   useEffect(() => {
  //     const fetchData = async () => {
  //       const res = trpc.admin.getBookingsInInterval.useQuery({ from, to });
  //       setdata(res.data?.data.bookings || []);
  //     };
  //     fetchData();
  //   }, [from, to]);

  return (
    <div className="p-4">
      <h2 className="my-1 font-bold">Dashboard</h2>
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
          <label className="block text-sm font-medium text-gray-700">To</label>
          <DatePicker
            date={to}
            setDate={(date) => {
              if (date && date >= from) setTo(date);
            }}
          />
        </div>
      </div>
      {res?.data.bookings && (
        <DataTable columns={columns} data={res.data.bookings} />
      )}
    </div>
  );
}
