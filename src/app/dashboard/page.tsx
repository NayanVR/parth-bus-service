import { api } from "@/trpc/server";
import React from "react";
import { DataTable } from "./_components/bookings-table";
import { columns } from "./_components/bookings-table-columns";

type Props = {};

export default async function Dashboard(props: Props) {
  const { data } = await api.admin.getBookingsInInterval({
    from: new Date(new Date().getTime() - 70 * 24 * 60 * 60 * 1000),
    to: new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000),
  });

  return (
    <div className="p-4">
      <DataTable columns={columns} data={data.bookings} />
    </div>
  );
}
