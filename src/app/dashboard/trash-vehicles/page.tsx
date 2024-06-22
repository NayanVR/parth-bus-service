"use client";

import { columns } from "./_components/trash-vehicles-table-columns";
import { DataTable } from "./_components/trash-vehicles-table";
import { trpc } from "@/trpc/react";

type Props = {};

export default function Vehicles(props: Props) {
  const { data: res } = trpc.trash.getTrashVehicles.useQuery();

  return (
    <>
      <h2 className="flex h-20 items-center bg-primary pl-20 pr-8 font-bold text-primary-foreground">
        Vehicles
      </h2>
      <div className="p-4">
        {res?.data.vehicles && (
          <DataTable columns={columns} data={res.data.vehicles} />
        )}
      </div>
    </>
  );
}
