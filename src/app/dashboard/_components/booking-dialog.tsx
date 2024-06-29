import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
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
import { toast } from "sonner";
import { BookingsDataRangeContext } from "@/lib/contexts";

type Props = {
  isOpen: boolean;
  setIsOpen: (newValue: boolean) => void;
  isEdit: boolean;
  data?: RouterOutputs["bookings"]["getBookingsInInterval"]["data"]["bookings"][0];
};

const paymentMethods: { [key: string]: string } = {
  estimatedCost: "Estimated Cost",
  costPerKMs: "Cost Per KMs",
};

export default function BookingDialog({
  isOpen,
  setIsOpen,
  isEdit,
  data,
}: Props) {
  const trpcUtils = trpc.useUtils();
  const { data: vehiclesData } = trpc.vehicles.getAllVehicles.useQuery();
  const { from, to } = useContext(BookingsDataRangeContext);
  const [paymentType, setPaymentType] = useState(paymentMethods.estimatedCost);

  const createBooking = trpc.bookings.createVehicleBooking.useMutation({
    onSuccess: (res) => {
      trpcUtils.bookings.getBookingsInInterval.refetch();
    },
  });
  const updateBooking = trpc.bookings.updateVehicleBooking.useMutation({
    onSuccess: (res) => {
      trpcUtils.bookings.getBookingsInInterval.refetch();
    },
  });

  const formik = useFormik({
    initialValues: {
      clientName: data?.clientName ?? "",
      clientAddress: data?.clientAddress ?? "",
      clientPhone: data?.clientPhone!,
      clientAltPhone: data?.clientAltPhone!,
      vehicleId: data?.vehicleId ?? 0,
      travelPlaceFrom: data?.travelPlaceFrom ?? "",
      travelPlaceTo: data?.travelPlaceTo ?? "",
      travelDateFrom: data?.travelDateFrom ?? undefined!,
      travelDateTo: data?.travelDateTo ?? undefined!,
      noOfPassengers: data?.noOfPassengers!,
      bookingDate: data?.bookingDate ?? new Date(),
      estimatedKMs: data?.estimatedKMs ?? null,
      costPerKm: data?.costPerKm ?? null,
      estimatedCost: data?.estimatedCost!,
      advancePayment: data?.advancePayment!,
      remainingPayment: data?.remainingPayment!,
    } satisfies BookingsSchemaInput,
    validate: toFormikValidate(bookingsSchema),
    onSubmit: async (values) => {
      if (
        checkOccupancy(values.travelDateFrom) ||
        checkOccupancy(values.travelDateTo)
      ) {
        toast.error("Vehicle is not available for the selected dates");
        return;
      }

      if (paymentType === paymentMethods.costPerKMs) {
        if (!values.estimatedKMs || !values.costPerKm) {
          toast.error("Estimated KMs and Cost Per KMs are required");
          return;
        }
      } else {
        values.estimatedKMs = null;
        values.costPerKm = null;
      }

      if (isEdit) {
        if (data === undefined) {
          toast.error("Something went wrong");
          return;
        }
        const res = await updateBooking.mutateAsync({
          id: data?.id ?? 0,
          clientId: data?.clientId ?? 0,
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

  const occupiedDates =
    trpc.vehicles.getVehicleOccupiedDates.useQuery({
      vehicleId: formik.values.vehicleId,
      from,
      to,
    }) ?? [];

  const noOfTravelDays = useMemo(() => {
    if (formik.values.travelDateFrom && formik.values.travelDateTo) {
      return daysBetweenDates(
        formik.values.travelDateFrom,
        formik.values.travelDateTo,
      );
    }
    return 0;
  }, [formik.values.travelDateFrom, formik.values.travelDateTo]);

  useEffect(() => {
    formik.setFieldValue(
      "remainingPayment",
      formik.values.estimatedCost - formik.values.advancePayment,
    );
  }, [formik.values.estimatedCost, formik.values.advancePayment]);

  useEffect(() => {
    if (formik.values.estimatedKMs && formik.values.costPerKm) {
      formik.setFieldValue(
        "estimatedCost",
        formik.values.estimatedKMs * formik.values.costPerKm,
      );
    }
  }, [formik.values.estimatedKMs, formik.values.costPerKm]);

  useEffect(() => {
    if (data?.costPerKm && data?.estimatedKMs) {
      setPaymentType(paymentMethods.costPerKMs);
    }
  }, [data]);

  // true if date is occupied
  const checkOccupancy = useCallback(
    (date: Date) => {
      const dateTime = date.getTime();
      if (
        data &&
        (dateTime == data.travelDateFrom.getTime() ||
          dateTime == data.travelDateTo.getTime())
      )
        return false;
      if (date < from || date > to) return true;
      const dateFoundInRange = occupiedDates.data?.data.occupiedDates.find(
        (occupiedDate) =>
          dateTime >= occupiedDate.from.getTime() &&
          dateTime <= occupiedDate.to.getTime(),
      );
      if (dateFoundInRange) return true;
      return false;
    },
    [data, occupiedDates],
  );

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(newVal) => {
        setIsOpen(newVal);
        formik.resetForm();
      }}
    >
      <DialogContent className="max-h-[calc(100vh-5rem)] overflow-scroll py-8 md:max-h-screen md:max-w-[80%]">
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
                type="number"
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
                type="number"
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
                  trpcUtils.vehicles.getVehicleOccupiedDates.refetch({
                    vehicleId: Number(newVal),
                    from,
                    to,
                  });
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
                htmlFor="travelPlaceFrom"
              >
                Travel Place From
              </label>
              <Input
                id="travelPlaceFrom"
                placeholder="Travel Place From"
                value={formik.values.travelPlaceFrom}
                onChange={formik.handleChange}
                error={formik.errors.travelPlaceFrom}
              />
              <label
                className="mt-2 inline-block text-sm"
                htmlFor="travelPlaceTo"
              >
                Travel Place To
              </label>
              <Input
                id="travelPlaceTo"
                placeholder="Travel Place To"
                value={formik.values.travelPlaceTo}
                onChange={formik.handleChange}
                error={formik.errors.travelPlaceTo}
              />
              <label className="mt-2 inline-block text-sm" htmlFor="travelFrom">
                Travel Date From
              </label>
              <DatePicker
                date={formik.values.travelDateFrom}
                setDate={(date) => formik.setFieldValue("travelDateFrom", date)}
                className="w-full"
                disabled={checkOccupancy || occupiedDates.isLoading}
              />
              {formik.errors.travelDateFrom && (
                <p className="text-sm text-destructive">
                  {String(formik.errors.travelDateFrom)}
                </p>
              )}
              <label className="mt-2 inline-block text-sm" htmlFor="travelTo">
                Travel Date To
              </label>
              <DatePicker
                date={formik.values.travelDateTo}
                setDate={(date) => formik.setFieldValue("travelDateTo", date)}
                className="w-full"
                disabled={checkOccupancy}
              />
              {formik.errors.travelDateTo && (
                <p className="text-sm text-destructive">
                  {String(formik.errors.travelDateTo)}
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
                value={noOfTravelDays}
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
              <label
                className="mt-2 inline-block text-sm"
                htmlFor="paymentType"
              >
                Payment Type
              </label>
              <Select
                value={paymentType}
                onValueChange={(value) => {
                  setPaymentType(value);
                  formik.setFieldValue("estimatedKMs", null);
                  formik.setFieldValue("costPerKm", null);
                  formik.setFieldValue("estimatedCost", 0);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Payment Type" />
                </SelectTrigger>
                <SelectContent>
                  {Object.keys(paymentMethods).map((key) => (
                    <SelectItem key={key} value={paymentMethods[key]!}>
                      {paymentMethods[key]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {(paymentType === paymentMethods.costPerKMs ||
                data?.costPerKm ||
                data?.estimatedKMs) && (
                <>
                  <label
                    className="mt-2 inline-block text-sm"
                    htmlFor="estimatedKMs"
                  >
                    Estimated KMs
                  </label>
                  <Input
                    id="estimatedKMs"
                    placeholder="Estimated KMs"
                    type="number"
                    value={formik.values.estimatedKMs!}
                    onChange={formik.handleChange}
                    error={formik.errors.estimatedKMs}
                  />

                  <label
                    className="mt-2 inline-block text-sm"
                    htmlFor="costPerKm"
                  >
                    Cost Per KM
                  </label>
                  <Input
                    id="costPerKm"
                    placeholder="Cost Per KM"
                    type="number"
                    value={formik.values.costPerKm!}
                    onChange={formik.handleChange}
                    error={formik.errors.costPerKm}
                  />
                </>
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
                readOnly={paymentType === paymentMethods.costPerKMs}
                type="number"
                value={formik.values.estimatedCost}
                onChange={formik.handleChange}
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
                onChange={formik.handleChange}
                error={formik.errors.advancePayment}
              />
              <label
                className="mt-2 inline-block text-sm"
                htmlFor="remainingPayment"
              >
                Remaining Payment
              </label>
              <Input
                id="remainingPayment"
                placeholder="Remaining Payment"
                type="number"
                value={formik.values.remainingPayment}
                onChange={formik.handleChange}
                error={formik.errors.remainingPayment}
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
