import logger from "@/lib/logger";
import { GetDriverDutyVouchersInIntervalInput, UpdateDriverDutyVoucherInput } from "@/lib/types/driver-duty-schema";
import { bookingsTable, clientInfoTable, driverDutyVouchersTable } from "@/server/db/schema";
import { TRPCError } from "@trpc/server";
import { and, desc, eq, gte, lte } from "drizzle-orm";
import { TRPCContext } from "../trpc-context";

export const getDriverDutyVoucherByIdHandler = async ({ ctx, input: id }: { ctx: TRPCContext, input: string }) => {
    try {
        const res = (await ctx.db.select().from(driverDutyVouchersTable)
            .where(and(eq(driverDutyVouchersTable.isDeleted, false), eq(driverDutyVouchersTable.id, id)))
            .innerJoin(clientInfoTable, eq(driverDutyVouchersTable.clientId, clientInfoTable.id))).at(0);

        if (!res) {
            throw new TRPCError({
                code: 'NOT_FOUND',
                message: 'Driver Duty Voucher not found',
            });
        }

        if (res.driver_duty_vouchers.driverName !== "") {
            throw new TRPCError({
                code: 'BAD_REQUEST',
                message: 'Driver Duty Voucher already filled',
            });
        }

        const bookingInfo = (await ctx.db.select({
            estimatedKMs: bookingsTable.estimatedKMs,
            costPerKm: bookingsTable.costPerKm,
            estimatedCost: bookingsTable.estimatedCost,
            advancePayment: bookingsTable.advancePayment,
            remainingPayment: bookingsTable.remainingPayment
        }).from(bookingsTable).where(eq(bookingsTable.clientId, res.client_info.id))).at(0)!;

        return {
            status: 'success',
            data: {
                driverDutyVoucher: { ...res.driver_duty_vouchers, ...res.client_info, id: res.driver_duty_vouchers.id, ...bookingInfo },
            },
        };
    } catch (err: any) {
        logger.error({ err }, "getDriverDutyVoucherByIdHandler failed");
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
                eq(driverDutyVouchersTable.isDeleted, false),
                gte(driverDutyVouchersTable.createdAt, input.from),
                lte(driverDutyVouchersTable.createdAt, input.to)
            ))
            .innerJoin(clientInfoTable, eq(driverDutyVouchersTable.clientId, clientInfoTable.id))
            .innerJoin(bookingsTable, eq(driverDutyVouchersTable.clientId, bookingsTable.clientId))
            .orderBy(desc(driverDutyVouchersTable.createdAt));
        return {
            status: 'success',
            data: {
                driverDutyVouchers: res.map(x => ({ ...x.driver_duty_vouchers, ...x.client_info, ...x.bookings, id: x.driver_duty_vouchers.id })),
            },
        };
    } catch (err: any) {
        logger.error({ err }, "getDriverDutyVouchersInIntervalHandler failed");
        throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: err.message
        })
    }
}

export const updateDriverDutyVoucherHandler = async ({ ctx, input }: { ctx: TRPCContext, input: UpdateDriverDutyVoucherInput }) => {
    try {
        // if (ctx.user) {
        const res = await ctx.db.transaction(async (tx) => {
            const clientInfo = await tx.update(clientInfoTable).set({
                clientName: input.clientName,
                clientAddress: input.clientAddress,
                clientPhone: input.clientPhone,
                clientAltPhone: input.clientAltPhone,
            }).where(eq(clientInfoTable.id, input.clientId)).returning();

            const driverDutyVoucher = await tx.update(driverDutyVouchersTable).set({
                driverName: input.driverName,
                vehicleId: input.vehicleId,
                driverExpense: input.driverExpense,
                odometerStart: input.odometerStart,
                odometerEnd: input.odometerEnd,
                paymentCollected: input.paymentCollected,
                tollTaxes: input.tollTaxes,
                additionalExpenses: input.additionalExpenses,
                remarks: input.remarks,
            }).where(eq(driverDutyVouchersTable.id, input.id)).returning();

            await tx.update(bookingsTable).set({
                vehicleId: input.vehicleId,
                remainingPayment: input.remainingPayment!,
                estimatedKMs: input.estimatedKMs!,
                estimatedCost: input.estimatedCost!,
            }).where(eq(bookingsTable.clientId, input.clientId));

            return { ...driverDutyVoucher.at(0)!, ...clientInfo.at(0)!, id: driverDutyVoucher.at(0)!.id };
        });
        return {
            status: 'success',
            data: {
                driverDutyVoucher: res,
            },
        };
        // } else {
        //     const res = (await ctx.db.update(driverDutyVouchersTable).set(input).where(eq(driverDutyVouchersTable.id, input.id)).returning()).at(0);
        //     return {
        //         status: 'success',
        //         data: {
        //             driverDutyVoucher: res,
        //         },
        //     };
        // }
    } catch (err: any) {
        logger.error({ err }, "updateDriverDutyVoucherHandler failed");
        throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: err.message,
        });
    }
}

export const deleteDriverDutyVoucherHandler = async ({ ctx, input: id }: { ctx: TRPCContext, input: string }) => {
    try {
        const res = await ctx.db.transaction(async (tx) => {
            const driverDutyVoucher = await tx.update(driverDutyVouchersTable).set({ isDeleted: true }).where(eq(driverDutyVouchersTable.id, id)).returning();
            await tx.update(bookingsTable).set({ isDeleted: true }).where(eq(bookingsTable.clientId, driverDutyVoucher.at(0)!.clientId));
            return driverDutyVoucher.at(0);
        });

        return {
            status: 'success',
            data: {
                driverDutyVoucher: res,
            }
        };
    } catch (err: any) {
        logger.error({ err }, "deleteDriverDutyVoucherHandler failed");
        throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: err.message,
        });
    }
}

// export const createDriverDutyVoucherHandler = async ({ ctx, input }: { ctx: TRPCContext, input: DriverDutyVoucherInput }) => {
//     try {
//         const res = (await ctx.db.insert(driverDutyVouchersTable).values({
//             driverName: input.driverName,
//         }).returning()).at(0);
//         return {
//             status: 'success',
//             data: {
//                 driverDutyVoucher: res,
//             },
//         };
//     } catch (err: any) {
//         throw new TRPCError({
//             code: 'INTERNAL_SERVER_ERROR',
//             message: err.message,
//         });
//     }
// }