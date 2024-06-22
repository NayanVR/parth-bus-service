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
import { RouterOutputs, trpc } from "@/trpc/react";
import { InsertVehicle } from "@/server/db/schema";
import { createVehicleSchema } from "@/lib/types/vehicle-schema";

type Props = {
  isOpen: boolean;
  setIsOpen: (newValue: boolean) => void;
  isEdit: boolean;
  data?: RouterOutputs["vehicles"]["getAllVehicles"]["data"]["vehicles"][0];
};

export default function VehicleDialog({
  isOpen,
  setIsOpen,
  isEdit,
  data,
}: Props) {
  const trpcUtils = trpc.useUtils();
  const createVehicle = trpc.vehicles.createVehicle.useMutation({
    onSuccess: () => {
      trpcUtils.vehicles.getAllVehicles.refetch();
    },
  });
  const updateVehicle = trpc.vehicles.updateVehicle.useMutation({
    onSuccess: () => {
      trpcUtils.vehicles.getAllVehicles.refetch();
    },
  });

  const formik = useFormik({
    initialValues: {
      plateNumber: data?.plateNumber ?? "",
      type: data?.type ?? "",
    } satisfies InsertVehicle,
    validate: toFormikValidate(createVehicleSchema),
    onSubmit: async (values) => {
      if (isEdit) {
        const res = await updateVehicle.mutateAsync({
          id: data?.id ?? 0,
          ...values,
        });
        if (res.status === "success") {
          setIsOpen(false);
        }
      } else {
        const res = await createVehicle.mutateAsync(values);
        if (res.status === "success") {
          setIsOpen(false);
        }
      }
    },
  });

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-h-screen overflow-scroll py-8">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Edit voucher" : "Create voucher"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={formik.handleSubmit}>
          <div className="flex w-full flex-col gap-4">
            <div>
              <label
                className="mt-2 inline-block text-sm"
                htmlFor="plateNumber"
              >
                Plate Number
              </label>
              <Input
                id="plateNumber"
                placeholder="Plate Number"
                type="text"
                value={formik.values.plateNumber}
                onChange={formik.handleChange}
                error={formik.errors.plateNumber}
              />
            </div>
            <div>
              <label className="mt-2 inline-block text-sm" htmlFor="type">
                Vehicle Type
              </label>
              <Input
                id="type"
                placeholder="Vehicle Type"
                type="text"
                value={formik.values.type}
                onChange={formik.handleChange}
                error={formik.errors.type}
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
