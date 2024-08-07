import React, { useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useFormik } from "formik";
import { toFormikValidate } from "zod-formik-adapter";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RouterOutputs, trpc } from "@/trpc/react";
import {
  DriverDutyVoucherInput,
  driverDutyVoucherSchema,
  UpdateDriverDutyVoucherInput,
} from "@/lib/types/driver-duty-schema";
import { toast } from "sonner";

type Props = {
  isOpen: boolean;
  setIsOpen: (newValue: boolean) => void;
  isEdit: boolean;
  data?: RouterOutputs["driverDuty"]["getDriverDutyVoucherInInterval"]["data"]["driverDutyVouchers"][0];
};

export default function VoucherDialog({
  isOpen,
  setIsOpen,
  isEdit,
  data,
}: Props) {
  const trpcUtils = trpc.useUtils();
  const { data: vehiclesData } = trpc.vehicles.getAllVehicles.useQuery();
  // const createDriverDutyVoucher =
  //   trpc.driverDuty.createDriverDutyVoucher.useMutation({
  //     onSuccess: () => {
  //       trpcUtils.driverDuty.getDriverDutyVoucherInInterval.refetch();
  //     },
  //   });
  const updateDriverDutyVoucher =
    trpc.driverDuty.updateDriverDutyVoucher.useMutation({
      onSuccess: () => {
        trpcUtils.driverDuty.getDriverDutyVoucherInInterval.refetch();
      },
    });

  const isPaymentInKMs = useMemo(() => {
    return !!data?.costPerKm;
  }, [data]);

  const formik = useFormik({
    initialValues: {
      clientId: data?.clientId!,
      clientName: data?.clientName ?? "",
      clientAddress: data?.clientAddress ?? "",
      clientPhone: data?.clientPhone!,
      clientAltPhone: data?.clientAltPhone!,
      vehicleId: data?.vehicleId ?? 0,
      driverName: data?.driverName ?? "",
      driverExpense: data?.driverExpense ?? 0,
      odometerStart: data?.odometerStart ?? 0,
      odometerEnd: data?.odometerEnd ?? 0,
      paymentCollected: data?.paymentCollected ?? 0,
      tollTaxes: data?.tollTaxes ?? 0,
      additionalExpenses: data?.additionalExpenses ?? 0,
      remarks: data?.remarks ?? "",
    } satisfies DriverDutyVoucherInput,
    validate: toFormikValidate(driverDutyVoucherSchema),
    onSubmit: async (values) => {
      // if (values.paymentCollected > data?.remainingPayment!) {
      //   toast.error("Payment collected cannot be more than remaining");
      //   return;
      // }
      const inputData: UpdateDriverDutyVoucherInput = {
        id: data?.id!,
        ...values,
        estimatedKMs: isPaymentInKMs
          ? values.odometerEnd! - values.odometerStart!
          : data?.estimatedKMs,
        estimatedCost: isPaymentInKMs
          ? (values.odometerEnd! - values.odometerStart!) * data?.costPerKm!
          : data?.estimatedCost,
        remainingPayment: isPaymentInKMs
          ? amountToCollect! - values.paymentCollected
          : data?.remainingPayment! - values.paymentCollected,
      };
      // if (isEdit) {
      const res = await updateDriverDutyVoucher.mutateAsync(inputData);
      if (res.status === "success") {
        setIsOpen(false);
      }
      // } else {
      //   const res = await createDriverDutyVoucher.mutateAsync(values);
      //   if (res.status === "success") {
      //     setIsOpen(false);
      //   }
      // }
    },
  });

  const travelCost = useMemo(() => {
    if (isPaymentInKMs && formik.values.odometerEnd) {
      return (
        (formik.values.odometerEnd! - formik.values.odometerStart!) *
          data?.costPerKm! -
        data?.advancePayment!
      );
    }
    return data?.remainingPayment || 0;
  }, [formik.values.odometerEnd, formik.values.odometerStart]);

  const amountToCollect = useMemo(() => {
    return travelCost + formik.values.tollTaxes;
  }, [travelCost, formik.values.tollTaxes]);

  const kmsTravelled = useMemo(() => {
    return formik.values.odometerEnd - formik.values.odometerStart;
  }, [formik.values.odometerEnd, formik.values.odometerStart]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-h-[calc(100vh-5rem)] overflow-scroll py-8 md:max-h-screen md:max-w-[80%]">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Edit voucher" : "Create voucher"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={formik.handleSubmit}>
          <div className="flex w-full flex-col gap-4 md:flex-row">
            <div className="w-full md:w-1/3">
              <h4 className="font-bold">Client Info</h4>
              <label className="mt-2 inline-block text-sm" htmlFor="clientName">
                Client Name
              </label>
              <Input
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
                id="clientAddress"
                placeholder="Client Address"
                value={formik.values.clientAddress}
                onChange={formik.handleChange}
                error={formik.errors.clientAddress}
              />
              <label
                className="mt-2 inline-block text-sm"
                htmlFor="clientPhone"
              >
                Client Phone
              </label>
              <Input
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
              <Select
                value={formik.values.vehicleId.toString()}
                onValueChange={(newVal) => {
                  formik.setFieldValue("vehicleId", Number(newVal));
                }}
              >
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
              <label
                className="mt-2 inline-block text-sm"
                htmlFor="odometerEnd"
              >
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
              <label
                className="mt-2 inline-block text-sm"
                htmlFor="kmsTravelled"
              >
                Kms Travelled
              </label>
              <Input
                readOnly
                id="kmsTravelled"
                placeholder="Kms Travelled"
                type="number"
                value={kmsTravelled}
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
              <label className="mt-2 inline-block text-sm" htmlFor="tollTaxes">
                Toll Taxes
              </label>
              <Input
                id="tollTaxes"
                placeholder="Toll Taxes"
                type="number"
                value={formik.values.tollTaxes}
                onChange={formik.handleChange}
                error={formik.errors.tollTaxes}
              />
              <label
                className="mt-2 inline-block text-sm"
                htmlFor="paymentCollected"
              >
                <span>
                  Travel Cost{": "}
                  <span className="font-bold text-green-700">{travelCost}</span>
                </span>
                {isPaymentInKMs && (
                  <span>
                    {" | "}Cost per KM: {data?.costPerKm}
                  </span>
                )}
                <br />
                Travel Cost + Toll Taxes{" = "}
                Payment{" "}
                {amountToCollect && amountToCollect <= 0 ? (
                  <span className="text-green-500">Completed</span>
                ) : (
                  <span className="text-red-500">
                    Pending:{" "}
                    <span className="font-bold">{amountToCollect}</span>{" "}
                  </span>
                )}
              </label>
              <Input
                id="paymentCollected"
                placeholder="Payment Collected"
                type="number"
                value={formik.values.paymentCollected}
                onChange={formik.handleChange}
                error={formik.errors.paymentCollected}
              />
              <label
                className="mt-2 inline-block text-sm"
                htmlFor="driverExpense"
              >
                Fuel Expense
              </label>
              <Input
                id="driverExpense"
                placeholder="Fuel Expense"
                type="number"
                value={formik.values.driverExpense}
                onChange={formik.handleChange}
                error={formik.errors.driverExpense}
              />
              <label
                className="mt-2 inline-block text-sm"
                htmlFor="additionalExpenses"
              >
                Additional Expenses
              </label>
              <Input
                id="additionalExpenses"
                placeholder="Additional expenses"
                type="number"
                value={formik.values.additionalExpenses}
                onChange={formik.handleChange}
                error={formik.errors.additionalExpenses}
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
          <DialogFooter>
            <Button
              disabled={formik.isSubmitting}
              className="mt-8"
              type="submit"
            >
              {isEdit ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
