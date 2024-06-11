"use client";

import React, { useState } from "react";
import { columns } from "./_components/voucher-table-columns";
import { trpc } from "@/trpc/react";
import { DatePicker } from "@/components/ui/date-picker";
import { DataTable } from "./_components/voucher-table";

type Props = {};

export default function DutyVouchers(props: Props) {
  const [from, setFrom] = useState<Date>(
    new Date(new Date().getTime() - 70 * 24 * 60 * 60 * 1000),
  );
  const [to, setTo] = useState<Date>(
    new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000),
  );

  const { data: res } = trpc.driverDuty.getDriverDutyVoucherInInterval.useQuery(
    { from, to },
  );

  return (
    <div className="p-4">
      <h2 className="my-1 font-bold">Driver Duty Vouchers</h2>
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
      {res?.data.driverDutyVouchers && (
        <DataTable columns={columns} data={res.data.driverDutyVouchers} />
      )}
    </div>
  );
}
