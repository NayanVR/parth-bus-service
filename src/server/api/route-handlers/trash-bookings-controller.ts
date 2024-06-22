import { bookingsTable, clientInfoTable, driverDutyVouchersTable } from "@/server/db/schema";
import { TRPCContext } from "../trpc-context";
import { eq, and, lte, gte } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

export const getTrashBookingsInIntervalHandler = async ({ ctx, input }: { ctx: TRPCContext, input: { from: Date, to: Date } }) => {
    try {
        const res = await ctx.db
            .select()
            .from(bookingsTable)
            .where(
                and(
                    eq(bookingsTable.isDeleted, true),
                    gte(bookingsTable.bookingDate, input.from),
                    lte(bookingsTable.bookingDate, input.to)
                )
            )
            .innerJoin(clientInfoTable, eq(bookingsTable.clientId, clientInfoTable.id))
            .innerJoin(driverDutyVouchersTable, eq(bookingsTable.clientId, driverDutyVouchersTable.clientId));
        return {
            status: 'success',
            data: {
                bookings: res.map(x => ({ ...x.bookings, ...x.client_info, id: x.bookings.id, voucherId: x.driver_duty_vouchers.id })).sort((a, b) => a.bookingDate > b.bookingDate ? 1 : -1),
            },
        };
    } catch (err: any) {
        throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: err.message,
        });
    }
}

export const restoreBookingHandler = async ({ ctx, input: id }: { ctx: TRPCContext, input: number }) => {
    try {
        const res = await ctx.db.transaction(async (tx) => {
            const booking = await tx.update(bookingsTable).set({ isDeleted: false }).where(eq(bookingsTable.id, id)).returning();
            await tx.update(driverDutyVouchersTable).set({ isDeleted: false }).where(eq(driverDutyVouchersTable.clientId, booking.at(0)!.clientId));
            return booking.at(0);
        });

        return {
            status: 'success',
            data: {
                booking: res,
            },
        };
    } catch (err: any) {
        throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: err.message,
        });
    }
}

export const permanentDeleteBookingHandler = async ({ ctx, input: id }: { ctx: TRPCContext, input: number }) => {
    try {
        const res = await ctx.db.transaction(async (tx) => {
            const booking = await tx.delete(bookingsTable).where(eq(bookingsTable.id, id)).returning();
            await tx.delete(clientInfoTable).where(eq(clientInfoTable.id, booking.at(0)!.clientId));
            await tx.delete(driverDutyVouchersTable).where(eq(driverDutyVouchersTable.clientId, booking.at(0)!.clientId));
            return booking.at(0);
        });
        return {
            status: 'success',
            data: {
                booking: res,
            },
        };
    } catch (err: any) {
        throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: err.message,
        });
    }
}