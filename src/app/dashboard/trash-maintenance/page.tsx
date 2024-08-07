"use client";

import React, { useState } from "react";
import { columns } from "./_components/trash-maintenance-table-columns";
import { trpc } from "@/trpc/react";
import { DatePicker } from "@/components/ui/date-picker";
import { DataTable } from "./_components/trash-maintenance-table";
import { Skeleton } from "@/components/ui/skeleton";
import { getDefaultStartDate } from "@/lib/utils";

type Props = {};

export default function TrashMaintenances(props: Props) {
  const [from, setFrom] = useState<Date>(getDefaultStartDate());
  const [to, setTo] = useState<Date>(getDefaultStartDate());

  const { data: res, isLoading } =
    trpc.trash.getTrashMaintenancesInInterval.useQuery({
      from,
      to,
    });

  return (
    <>
      <h2 className="flex h-20 items-center bg-primary pl-20 pr-8 font-bold text-primary-foreground">
        Trash Maintenances
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
        {res?.data.maintenances && (
          <DataTable columns={columns} data={res.data.maintenances} />
        )}
      </div>
    </>
  );
}
