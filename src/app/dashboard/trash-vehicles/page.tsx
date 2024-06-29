"use client";

import { columns } from "./_components/trash-vehicles-table-columns";
import { DataTable } from "./_components/trash-vehicles-table";
import { trpc } from "@/trpc/react";
import { Skeleton } from "@/components/ui/skeleton";

type Props = {};

export default function Vehicles(props: Props) {
  const { data: res, isLoading } = trpc.trash.getTrashVehicles.useQuery();

  return (
    <>
      <h2 className="flex h-20 items-center bg-primary pl-20 pr-8 font-bold text-primary-foreground">
        Trash Vehicles
      </h2>
      <div className="p-4">
        {isLoading && (
          <div className="flex w-full flex-col gap-4 py-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-72 w-full" />
          </div>
        )}
        {res?.data.vehicles && (
          <DataTable columns={columns} data={res.data.vehicles} />
        )}
      </div>
    </>
  );
}
