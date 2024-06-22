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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RouterOutputs, trpc } from "@/trpc/react";
import {
  MaintenanceInput,
  maintenanceSchema,
} from "@/lib/types/maintenance-schema";
import { DatePicker } from "@/components/ui/date-picker";

type Props = {
  isOpen: boolean;
  setIsOpen: (newValue: boolean) => void;
  isEdit: boolean;
  data?: RouterOutputs["maintenance"]["getMaintenancesInInterval"]["data"]["maintenances"][0];
};

export default function MaintenanceDialog({
  isOpen,
  setIsOpen,
  isEdit,
  data,
}: Props) {
  const trpcUtils = trpc.useUtils();
  const { data: vehiclesData } = trpc.vehicles.getAllVehicles.useQuery();
  const createMaintenance = trpc.maintenance.createMaintenance.useMutation({
    onSuccess: () => {
      trpcUtils.maintenance.getMaintenancesInInterval.refetch();
    },
  });
  const updateMaintenance = trpc.maintenance.updateMaintenance.useMutation({
    onSuccess: () => {
      trpcUtils.maintenance.getMaintenancesInInterval.refetch();
    },
  });

  const formik = useFormik({
    initialValues: {
      vehicleId: data?.vehicleId ?? 0,
      maintenanceCost: data?.maintenanceCost!,
      maintenanceDateFrom: data?.maintenanceDateFrom ?? new Date(),
      maintenanceDateTo: data?.maintenanceDateTo ?? new Date(),
      odometerKm: data?.odometerKm!,
    } satisfies MaintenanceInput,
    validate: toFormikValidate(maintenanceSchema),
    onSubmit: async (values) => {
      if (isEdit) {
        const res = await updateMaintenance.mutateAsync({
          id: data?.id!,
          ...values,
        });
        if (res.status === "success") {
          setIsOpen(false);
        }
      } else {
        const res = await createMaintenance.mutateAsync(values);
        if (res.status === "success") {
          setIsOpen(false);
        }
      }
    },
  });

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-h-screen overflow-scroll py-8 md:max-w-[30%]">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Edit maintenance" : "Create maintenance"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={formik.handleSubmit}>
          <div className="w-full">
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
              htmlFor="maintenanceCost"
            >
              Maintenance Cost
            </label>
            <Input
              id="maintenanceCost"
              placeholder="Maintenance Cost"
              type="number"
              value={formik.values.maintenanceCost}
              onChange={formik.handleChange}
              error={formik.errors.maintenanceCost}
            />
            <label className="mt-2 inline-block text-sm" htmlFor="travelFrom">
              Travel Date From
            </label>
            <DatePicker
              date={formik.values.maintenanceDateFrom}
              setDate={(date) =>
                formik.setFieldValue("maintenanceDateFrom", date)
              }
              className="w-full"
            />
            {formik.errors.maintenanceDateFrom && (
              <p className="text-sm text-destructive">
                {String(formik.errors.maintenanceDateFrom)}
              </p>
            )}
            <label className="mt-2 inline-block text-sm" htmlFor="travelTo">
              Travel Date To
            </label>
            <DatePicker
              date={formik.values.maintenanceDateTo}
              setDate={(date) =>
                formik.setFieldValue("maintenanceDateTo", date)
              }
              className="w-full"
            />
            {formik.errors.maintenanceDateTo && (
              <p className="text-sm text-destructive">
                {String(formik.errors.maintenanceDateTo)}
              </p>
            )}
            <label className="mt-2 inline-block text-sm" htmlFor="odomoterKm">
              Odometer KM
            </label>
            <Input
              id="odometerKm"
              placeholder="Odometer KM"
              type="number"
              value={formik.values.odometerKm}
              onChange={formik.handleChange}
              error={formik.errors.odometerKm}
            />
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
