import { DriverDutyVoucherInput, GetDriverDutyVouchersInIntervalInput, UpdateDriverDutyVoucherInput } from "@/lib/types/driver-duty-schema";
import { TRPCContext } from "../trpc-context";
import { driverDutyVouchersTable } from "@/server/db/schema";
import { TRPCError } from "@trpc/server";
import { and, eq, gte, lte } from "drizzle-orm";

export const createDriverDutyVoucherHandler = async ({ ctx, input }: { ctx: TRPCContext, input: DriverDutyVoucherInput }) => {
    try {
        const res = (await ctx.db.insert(driverDutyVouchersTable).values(input).returning()).at(0);
        return {
            status: 'success',
            data: {
                driverDutyVoucher: res,
            },
        };
    } catch (err: any) {
        throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: err.message,
        });
    }
}

export const getDriverDutyVouchersInIntervalHandler = async ({ ctx, input }: { ctx: TRPCContext, input: GetDriverDutyVouchersInIntervalInput }) => {
    try {
        const res = await ctx.db
            .select()
            .from(driverDutyVouchersTable)
            .where(and(
                gte(driverDutyVouchersTable.createdAt, input.from),
                lte(driverDutyVouchersTable.createdAt, input.to)
            ));
        return {
            status: 'success',
            data: {
                driverDutyVouchers: res,
            },
        };
    } catch (err: any) {
        throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: err.message
        })
    }
}

export const updateDriverDutyVoucherHandler = async ({ ctx, input }: { ctx: TRPCContext, input: UpdateDriverDutyVoucherInput }) => {
    try {
        const res = await ctx.db.update(driverDutyVouchersTable).set(input).where(eq(driverDutyVouchersTable.id, input.id)).returning();
        return {
            status: 'success',
            data: {
                driverDutyVoucher: res,
            },
        };
    } catch (err: any) {
        throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: err.message,
        });
    }
}

export const deleteDriverDutyVoucherHandler = async ({ ctx, input: id }: { ctx: TRPCContext, input: number }) => {
    try {
        const res = await ctx.db.delete(driverDutyVouchersTable).where(eq(driverDutyVouchersTable.id, id)).returning();
        return {
            status: 'success',
            data: {
                driverDutyVoucher: res,
            }
        };
    } catch (err: any) {
        throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: err.message,
        });
    }
}