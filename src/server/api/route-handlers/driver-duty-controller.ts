import { GetDriverDutyVouchersInIntervalInput, UpdateDriverDutyVoucherInput } from "@/lib/types/driver-duty-schema";
import { TRPCContext } from "../trpc-context";
import { bookingsTable, clientInfoTable, driverDutyVouchersTable } from "@/server/db/schema";
import { TRPCError } from "@trpc/server";
import { and, eq, gte, lte, sql } from "drizzle-orm";

export const getDriverDutyVoucherByIdHandler = async ({ ctx, input: id }: { ctx: TRPCContext, input: string }) => {
    try {
        const res = (await ctx.db.select().from(driverDutyVouchersTable).where(eq(driverDutyVouchersTable.id, id)).innerJoin(clientInfoTable, eq(driverDutyVouchersTable.clientId, clientInfoTable.id))).at(0);

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

        const remainingPayment = (await ctx.db.select().from(bookingsTable).where(eq(bookingsTable.clientId, res.client_info.id))).at(0)!.remainingPayment;

        return {
            status: 'success',
            data: {
                driverDutyVoucher: { ...res.driver_duty_vouchers, ...res.client_info, id: res.driver_duty_vouchers.id, remainingPayment },
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
            ))
            .innerJoin(clientInfoTable, eq(driverDutyVouchersTable.clientId, clientInfoTable.id));
        return {
            status: 'success',
            data: {
                driverDutyVouchers: res.map(x => ({ ...x.driver_duty_vouchers, ...x.client_info, id: x.driver_duty_vouchers.id })).sort((a, b) => a.createdAt > b.createdAt ? 1 : -1),
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
                remarks: input.remarks,
            }).where(eq(driverDutyVouchersTable.id, input.id)).returning();

            await tx.update(bookingsTable).set({
                vehicleId: input.vehicleId,
                remainingPayment: sql`${bookingsTable.remainingPayment} - ${input.paymentCollected}`
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
        throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: err.message,
        });
    }
}

export const deleteDriverDutyVoucherHandler = async ({ ctx, input: id }: { ctx: TRPCContext, input: string }) => {
    try {
        const res = await ctx.db.transaction(async (tx) => {
            const driverDutyVoucher = await tx.delete(driverDutyVouchersTable).where(eq(driverDutyVouchersTable.id, id)).returning();
            await tx.delete(clientInfoTable).where(eq(clientInfoTable.id, driverDutyVoucher.at(0)!.clientId));
            await tx.delete(bookingsTable).where(eq(bookingsTable.clientId, driverDutyVoucher.at(0)!.clientId));
            return driverDutyVoucher.at(0);
        })

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