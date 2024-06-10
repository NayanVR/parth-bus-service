import React from "react";
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
  bookingsSchema,
  BookingsSchemaInput,
} from "@/lib/types/bookings-schema";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import { RouterOutputs, trpc } from "@/trpc/react";
import { daysBetweenDates } from "@/lib/utils";

type Props = {
  isOpen: boolean;
  setIsOpen: (newValue: boolean) => void;
  isEdit: boolean;
  data?: RouterOutputs["admin"]["getBookingsInInterval"]["data"]["bookings"][0];
};

export default function BookingDialog({
  isOpen,
  setIsOpen,
  isEdit,
  data,
}: Props) {
  const trpcUtils = trpc.useUtils();
  const { data: vehiclesData } = trpc.vehicles.getAllVehicles.useQuery();
  const createBooking = trpc.admin.createVehicleBooking.useMutation({
    onSuccess: () => {
      trpcUtils.admin.getBookingsInInterval.refetch();
    },
  });
  const updateBooking = trpc.admin.updateVehicleBooking.useMutation({
    onSuccess: () => {
      trpcUtils.admin.getBookingsInInterval.refetch();
    },
  });

  const formik = useFormik({
    initialValues: {
      clientName: data?.clientName ?? "",
      clientAddress: data?.clientAddress ?? "",
      clientPhone: data?.clientPhone ?? "",
      clientAltPhone: data?.clientAltPhone ?? "",
      vehicleId: data?.vehicleId ?? 0,
      travelPlace: data?.travelPlace ?? "",
      travelFrom: data?.travelFrom ?? new Date(),
      travelTo: data?.travelTo ?? new Date(),
      noOfTravelDays: data?.noOfTravelDays ?? 0,
      noOfPassengers: data?.noOfPassengers ?? 0,
      bookingDate: data?.bookingDate ?? new Date(),
      returnDate: data?.returnDate ?? new Date(),
      estimatedCost: data?.estimatedCost ?? 0,
      advancePayment: data?.advancePayment ?? 0,
      remainingPayment: data?.remainingPayment ?? 0,
    } satisfies BookingsSchemaInput,
    validate: toFormikValidate(bookingsSchema),
    onSubmit: async (values) => {
      if (isEdit) {
        const res = await updateBooking.mutateAsync({
          id: data?.id ?? 0,
          ...values,
        });
        if (res.status === "success") {
          setIsOpen(false);
        }
      } else {
        const res = await createBooking.mutateAsync(values);
        if (res.status === "success") {
          setIsOpen(false);
        }
      }
    },
  });

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-h-screen overflow-scroll py-8 md:max-w-[80%]">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Edit booking" : "Create booking"}
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
              <h4 className="font-bold">Travel Info</h4>
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
                htmlFor="travelPlace"
              >
                Travel Place
              </label>
              <Input
                id="travelPlace"
                placeholder="Travel Place"
                value={formik.values.travelPlace}
                onChange={formik.handleChange}
                error={formik.errors.travelPlace}
              />
              <label className="mt-2 inline-block text-sm" htmlFor="travelFrom">
                Travel From
              </label>
              <DatePicker
                date={formik.values.travelFrom}
                setDate={(date) => {
                  formik.setFieldValue("travelFrom", date);
                  if (date && date <= formik.values.travelTo) {
                    formik.setFieldValue(
                      "noOfTravelDays",
                      daysBetweenDates(date, formik.values.travelTo) + 1,
                    );
                  }
                }}
                className="w-full"
              />
              {formik.errors.travelFrom && (
                <p className="text-sm text-destructive">
                  {String(formik.errors.travelFrom)}
                </p>
              )}
              <label className="mt-2 inline-block text-sm" htmlFor="travelTo">
                Travel To
              </label>
              <DatePicker
                date={formik.values.travelTo}
                setDate={(date) => {
                  formik.setFieldValue("travelTo", date);
                  if (date && date >= formik.values.travelFrom) {
                    formik.setFieldValue(
                      "noOfTravelDays",
                      daysBetweenDates(formik.values.travelFrom, date) + 1,
                    );
                  }
                }}
                className="w-full"
              />
              {formik.errors.travelTo && (
                <p className="text-sm text-destructive">
                  {String(formik.errors.travelTo)}
                </p>
              )}
              <label
                className="mt-2 inline-block text-sm"
                htmlFor="noOfTravelDays"
              >
                No Of Travel Days
              </label>
              <Input
                readOnly
                id="noOfTravelDays"
                placeholder="No Of Travel Days"
                type="number"
                value={formik.values.noOfTravelDays}
                error={formik.errors.noOfTravelDays}
              />
              <label
                className="mt-2 inline-block text-sm"
                htmlFor="noOfPassengers"
              >
                No Of Passengers
              </label>
              <Input
                id="noOfPassengers"
                placeholder="No Of Passengers"
                type="number"
                min={0}
                value={formik.values.noOfPassengers}
                onChange={formik.handleChange}
                error={formik.errors.noOfPassengers}
              />
            </div>
            <div className="w-full md:w-1/3">
              <h4 className="font-bold">Booking Info</h4>
              <label
                className="mt-2 inline-block text-sm"
                htmlFor="bookingDate"
              >
                Booking Date
              </label>
              <DatePicker
                date={formik.values.bookingDate}
                setDate={(date) => {
                  formik.setFieldValue("bookingDate", date);
                }}
                className="w-full"
              />
              {formik.errors.bookingDate && (
                <p className="text-sm text-destructive">
                  {String(formik.errors.bookingDate)}
                </p>
              )}
              <label className="mt-2 inline-block text-sm" htmlFor="returnDate">
                Return Date
              </label>
              <DatePicker
                date={formik.values.returnDate}
                setDate={(date) => {
                  formik.setFieldValue("returnDate", date);
                }}
                className="w-full"
              />
              {formik.errors.returnDate && (
                <p className="text-sm text-destructive">
                  {String(formik.errors.returnDate)}
                </p>
              )}
              <label
                className="mt-2 inline-block text-sm"
                htmlFor="estimatedCost"
              >
                Estimated Cost
              </label>
              <Input
                id="estimatedCost"
                placeholder="Estimated Cost"
                type="number"
                value={formik.values.estimatedCost}
                onChange={(e) => {
                  const data = Number(e.target.value);
                  formik.setFieldValue("estimatedCost", data);
                  if (data >= formik.values.advancePayment)
                    formik.setFieldValue(
                      "remainingPayment",
                      data - formik.values.advancePayment,
                    );
                }}
                error={formik.errors.estimatedCost}
              />
              <label
                className="mt-2 inline-block text-sm"
                htmlFor="advancePayment"
              >
                Advance Payment
              </label>
              <Input
                id="advancePayment"
                placeholder="Advance Payment"
                type="number"
                value={formik.values.advancePayment}
                onChange={(e) => {
                  const data = Number(e.target.value);
                  formik.setFieldValue("advancePayment", data);
                  if (data <= formik.values.estimatedCost)
                    formik.setFieldValue(
                      "remainingPayment",
                      formik.values.estimatedCost - Number(data),
                    );
                }}
                error={formik.errors.advancePayment}
              />
              <label
                className="mt-2 inline-block text-sm"
                htmlFor="remainingPayment"
              >
                Remaining Payment
              </label>
              <Input
                readOnly
                id="remainingPayment"
                placeholder="Remaining Payment"
                type="number"
                value={formik.values.remainingPayment}
                error={formik.errors.remainingPayment}
              />
            </div>
          </div>
          <DialogFooter>
            <Button className="mt-8" type="submit">
              {isEdit ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
