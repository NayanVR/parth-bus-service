"use client";

import { columns } from "./_components/vehicles-table-columns";
import { DataTable } from "./_components/vehicles-table";
import { trpc } from "@/trpc/react";
import { useMemo } from "react";
import { CSVLink } from "react-csv";

type Props = {};

export default function Vehicles(props: Props) {
  const { data: res } = trpc.vehicles.getAllVehicles.useQuery();

  const csvData = useMemo(() => {
    return res?.data.vehicles.map((vehicle) => ({
      ID: vehicle.id,
      "Plate Number": vehicle.plateNumber,
      "Vehicle Type": vehicle.type,
    }));
  }, [res?.data.vehicles]);

  return (
    <>
      <h2 className="flex h-20 items-center bg-primary pl-20 pr-8 font-bold text-primary-foreground">
        Vehicles
      </h2>
      <div className="p-4 pb-8">
        {res?.data.vehicles && (
          <DataTable columns={columns} data={res.data.vehicles} />
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
