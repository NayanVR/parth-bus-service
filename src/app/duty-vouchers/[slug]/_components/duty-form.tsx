"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { updateDriverDutyVoucherSchema } from "@/lib/types/driver-duty-schema";
import { RouterOutputs, trpc } from "@/trpc/react";
import { useFormik } from "formik";
import { toast } from "sonner";
import { toFormikValidate } from "zod-formik-adapter";

type Props = {
  data: RouterOutputs["driverDuty"]["getDriverDutyVoucherById"]["data"]["driverDutyVoucher"];
};

function DutyForm({ data }: Props) {
  const trpcUtils = trpc.useUtils();
  const { data: vehiclesData } = trpc.vehicles.getAllVehicles.useQuery();
  const updateDriverDutyVoucher =
    trpc.driverDuty.updateDriverDutyVoucher.useMutation({
      onSuccess: () => {
        trpcUtils.driverDuty.getDriverDutyVoucherInInterval.refetch();
      },
    });

  const formik = useFormik({
    initialValues: {
      id: data.id!,
      clientId: data.clientId!,
      clientName: data.clientName!,
      clientAddress: data.clientAddress!,
      clientPhone: data.clientPhone!,
      clientAltPhone: data.clientAltPhone!,
      driverName: data.driverName!,
      vehicleId: data.vehicleId!,
      driverExpense: data.driverExpense!,
      odometerStart: data.odometerStart!,
      odometerEnd: data.odometerEnd!,
      paymentCollected: data.paymentCollected!,
      remarks: "",
    },
    validate: toFormikValidate(updateDriverDutyVoucherSchema),
    onSubmit: async (values) => {
      const res = updateDriverDutyVoucher
        .mutateAsync(values)
        .then((data) => {
          // formik.resetForm();
          console.log(data);
        })
        .catch((err) => {
          console.log(err);
        });
      toast.promise(res, {
        loading: "Creating driver duty voucher...",
        success: "Driver duty voucher created successfully.",
        error: "Failed to create driver duty voucher",
      });
    },
  });

  return (
    <>
      <h2 className="flex h-20 items-center bg-primary px-8 font-bold text-primary-foreground">
        Driver Duty Voucher
      </h2>
      <form
        className="container flex flex-col py-8"
        onSubmit={formik.handleSubmit}
      >
        <div className="flex w-full flex-col gap-4 md:flex-row">
          <div className="w-full md:w-1/3">
            <h4 className="font-bold">Client Info</h4>
            <label className="mt-2 inline-block text-sm" htmlFor="clientName">
              Client Name
            </label>
            <Input
              disabled
              id="clientName"
              placeholder="Client Name"
              value={formik.values.clientName}
              onChange={formik.handleChange}
              error={formik.errors.clientName}
            />
            <label
              className="mt-2 inline-block text-sm"
              htmlFor="clientAddress"
            >
              Client Address
            </label>
            <Input
              disabled
              id="clientAddress"
              placeholder="Client Address"
              value={formik.values.clientAddress}
              onChange={formik.handleChange}
              error={formik.errors.clientAddress}
            />
            <label className="mt-2 inline-block text-sm" htmlFor="clientPhone">
              Client Phone
            </label>
            <Input
              disabled
              id="clientPhone"
              placeholder="Client Phone"
              value={formik.values.clientPhone}
              onChange={formik.handleChange}
              error={formik.errors.clientPhone}
            />
            <label
              className="mt-2 inline-block text-sm"
              htmlFor="clientAltPhone"
            >
              Client Alt Phone
            </label>
            <Input
              disabled
              id="clientAltPhone"
              placeholder="Client Alt Phone"
              value={formik.values.clientAltPhone}
              onChange={formik.handleChange}
              error={formik.errors.clientAltPhone}
            />
          </div>
          <div className="w-full md:w-1/3">
            <h4 className="font-bold">Vehicle Info</h4>
            <label className="mt-2 inline-block text-sm" htmlFor="vehicleId">
              Vehicle ID
            </label>
            <Select disabled value={formik.values.vehicleId.toString()}>
              <SelectTrigger>
                <SelectValue placeholder="Vehicle" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">Select Vehicle</SelectItem>
                {vehiclesData?.data.vehicles?.map((vehicle) => (
                  <SelectItem key={vehicle.id} value={vehicle.id.toString()}>
                    {vehicle.plateNumber} - {vehicle.type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {formik.errors.vehicleId && (
              <p className="text-sm text-destructive">
                {formik.errors.vehicleId}
              </p>
            )}
            <label
              className="mt-2 inline-block text-sm"
              htmlFor="odomoterStart"
            >
              Odometer Start
            </label>
            <Input
              id="odometerStart"
              placeholder="Odometer Start"
              type="number"
              value={formik.values.odometerStart}
              onChange={formik.handleChange}
              error={formik.errors.odometerStart}
            />
            <label className="mt-2 inline-block text-sm" htmlFor="odometerEnd">
              Odometer End
            </label>
            <Input
              id="odometerEnd"
              placeholder="Odometer End"
              type="number"
              value={formik.values.odometerEnd}
              onChange={formik.handleChange}
              error={formik.errors.odometerEnd}
            />
          </div>
          <div className="w-full md:w-1/3">
            <h4 className="font-bold">Driver Info</h4>
            <label className="mt-2 inline-block text-sm" htmlFor="driverName">
              Driver Name
            </label>
            <Input
              id="driverName"
              placeholder="Driver Name"
              value={formik.values.driverName}
              onChange={formik.handleChange}
              error={formik.errors.driverName}
            />
            <label
              className="mt-2 inline-block text-sm"
              htmlFor="driverExpense"
            >
              Driver Expense
            </label>
            <Input
              id="driverExpense"
              placeholder="Driver Expense"
              type="number"
              value={formik.values.driverExpense}
              onChange={formik.handleChange}
              error={formik.errors.driverExpense}
            />
            <label
              className="mt-2 inline-block text-sm"
              htmlFor="paymentCollected"
            >
              Payment Collected
            </label>
            <Input
              id="paymentCollected"
              placeholder="Payment Collected"
              type="number"
              value={formik.values.paymentCollected}
              onChange={formik.handleChange}
              error={formik.errors.paymentCollected}
            />
            <label className="mt-2 inline-block text-sm" htmlFor="remarks">
              Remarks
            </label>
            <Input
              id="remarks"
              placeholder="Remarks"
              value={formik.values.remarks}
              onChange={formik.handleChange}
              error={formik.errors.remarks}
            />
          </div>
        </div>
        <Button className="mt-8 self-end" type="submit">
          Submit
        </Button>
      </form>
    </>
  );
}

export default DutyForm;
