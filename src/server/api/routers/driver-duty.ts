import { getDriverDutyVouchersInIntervalSchema, updateDriverDutyVoucherSchema } from "@/lib/types/driver-duty-schema";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";
import { deleteDriverDutyVoucherHandler, getDriverDutyVoucherByIdHandler, getDriverDutyVouchersInIntervalHandler, updateDriverDutyVoucherHandler } from "../route-handlers/driver-duty-controller";
import { z } from "zod";

export const driverRouter = createTRPCRouter({
    getDriverDutyVoucherInInterval: protectedProcedure.input(getDriverDutyVouchersInIntervalSchema).query(getDriverDutyVouchersInIntervalHandler),
    // createDriverDutyVoucher: publicProcedure.input(driverDutyVoucherSchema).mutation(createDriverDutyVoucherHandler),
    getDriverDutyVoucherById: publicProcedure.input(z.string()).query(getDriverDutyVoucherByIdHandler),
    updateDriverDutyVoucher: publicProcedure.input(updateDriverDutyVoucherSchema).mutation(updateDriverDutyVoucherHandler),
    deleteDriverDutyVoucher: protectedProcedure.input(z.string()).mutation(deleteDriverDutyVoucherHandler),
});