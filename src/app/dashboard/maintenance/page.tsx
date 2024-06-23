"use client";

import React, { useMemo, useState } from "react";
import { columns } from "./_components/maintenance-table-columns";
import { trpc } from "@/trpc/react";
import { DatePicker } from "@/components/ui/date-picker";
import { DataTable } from "./_components/maintenance-table";
import { CSVLink } from "react-csv";
import { formatIndianDateFromDate } from "@/lib/utils";

type Props = {};

export default function Maintenances(props: Props) {
  const [from, setFrom] = useState<Date>(
    new Date(new Date().getTime() - 70 * 24 * 60 * 60 * 1000),
  );
  const [to, setTo] = useState<Date>(
    new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000),
  );

  const { data: res } = trpc.maintenance.getMaintenancesInInterval.useQuery({
    from,
    to,
  });

  const vehicles = trpc.vehicles.getAllVehicles.useQuery().data?.data.vehicles;

  const csvData = useMemo(() => {
    return res?.data.maintenances.map((maintenance) => ({
      ID: maintenance.id,
      Vehicle:
        vehicles?.find((vehicle) => vehicle.id === maintenance.vehicleId)
          ?.plateNumber || "N/A",
      "Maintenance Cost": maintenance.maintenanceCost,
      "Maintenance From": formatIndianDateFromDate(
        maintenance.maintenanceDateFrom,
      ),
      "Maintenance To": formatIndianDateFromDate(maintenance.maintenanceDateTo),
      "Odometer Km": maintenance.odometerKm,
    }));
  }, [res?.data.maintenances]);

  return (
    <>
      <h2 className="flex h-20 items-center bg-primary pl-20 pr-8 font-bold text-primary-foreground">
        Maintenances
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
        {res?.data.maintenances && (
          <DataTable columns={columns} data={res.data.maintenances} />
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
