import { driverDutyVoucherSchema, getDriverDutyVouchersInIntervalSchema, updateDriverDutyVoucherSchema } from "@/lib/types/driver-duty-schema";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";
import { createDriverDutyVoucherHandler, deleteDriverDutyVoucherHandler, getDriverDutyVouchersInIntervalHandler, updateDriverDutyVoucherHandler } from "../route-handlers/driver-duty-controller";
import { z } from "zod";

export const driverRouter = createTRPCRouter({
    getDriverDutyVoucherInInterval: protectedProcedure.input(getDriverDutyVouchersInIntervalSchema).query(getDriverDutyVouchersInIntervalHandler),
    createDriverDutyVoucher: publicProcedure.input(driverDutyVoucherSchema).mutation(createDriverDutyVoucherHandler),
    updateDriverDutyVoucher: protectedProcedure.input(updateDriverDutyVoucherSchema).mutation(updateDriverDutyVoucherHandler),
    deleteDriverDutyVoucher: protectedProcedure.input(z.number()).mutation(deleteDriverDutyVoucherHandler),
});