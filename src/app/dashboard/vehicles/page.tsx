import { columns } from "./_components/vehicles-table-columns";
import { DataTable } from "./_components/vehicles-table";
import { api } from "@/trpc/server";

type Props = {};

export default async function Vehicles(props: Props) {
  const { data } = await api.vehicles.getAllVehicles();

  return (
    <div className="p-4">
      <h2 className="my-1 font-bold">Driver Duty Vouchers</h2>
      <DataTable columns={columns} data={data.vehicles} />
    </div>
  );
}
