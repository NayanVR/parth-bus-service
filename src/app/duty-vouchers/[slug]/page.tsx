import { api } from "@/trpc/server";
import DutyForm from "./_components/duty-form";

export default async function DriverDutyVoucher({
  params,
}: {
  params: { slug: string };
}) {
  try {
    const res = await api.driverDuty.getDriverDutyVoucherById(params.slug);

    return <DutyForm data={res.data.driverDutyVoucher} />;
  } catch (e: any) {
    if (e.message.includes("uuid")) {
      return (
        <main className="bg-gradient flex h-screen items-center justify-center">
          <h2 className="font-bold text-white">
            Driver Duty Voucher not found
          </h2>
        </main>
      );
    }
    return (
      <main className="bg-gradient flex h-screen items-center justify-center">
        <h2 className="font-bold text-white">{e.message}</h2>
      </main>
    );
  }
}
