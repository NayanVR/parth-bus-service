import { BookingsSchemaInput, GetBookingsInIntervalSchemaInput, UpdateBookingSchemaInput } from "@/lib/types/bookings-schema";
import { TRPCContext } from "../trpc-context";
import { bookingsTable, clientInfoTable, driverDutyVouchersTable } from "@/server/db/schema";
import { TRPCError } from "@trpc/server";
import { and, desc, eq, gte, lte } from "drizzle-orm";

export const createVehicleBookingHandler = async ({ ctx, input }: { ctx: TRPCContext, input: BookingsSchemaInput }) => {
    try {
        const res = await ctx.db.transaction(async (tx) => {
            const clientInfo = await tx.insert(clientInfoTable).values(input).returning();

            const bookingInfo = await tx.insert(bookingsTable).values({
                ...input,
                clientId: clientInfo.at(0)!.id,
            }).returning();

            const voucherInfo = await tx.insert(driverDutyVouchersTable).values({
                clientId: clientInfo.at(0)!.id,
                bookingId: bookingInfo.at(0)!.id,
                driverName: "",
                vehicleId: input.vehicleId,
            }).returning();

            return { ...bookingInfo.at(0)!, ...clientInfo.at(0)!, id: bookingInfo.at(0)!.id, voucherId: voucherInfo.at(0)!.id };
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
};

export const getBookingsInIntervalHandler = async ({ ctx, input }: { ctx: TRPCContext, input: GetBookingsInIntervalSchemaInput }) => {
    try {
        const res = await ctx.db.
            select().
            from(bookingsTable)
            .where(and(
                eq(bookingsTable.isDeleted, false),
                gte(bookingsTable.bookingDate, input.from),
                lte(bookingsTable.bookingDate, input.to)
            ))
            .innerJoin(clientInfoTable, eq(bookingsTable.clientId, clientInfoTable.id))
            .innerJoin(driverDutyVouchersTable, eq(bookingsTable.clientId, driverDutyVouchersTable.clientId))
            .orderBy(desc(bookingsTable.bookingDate));
        return {
            status: 'success',
            data: {
                bookings: res.map(x => ({ ...x.bookings, ...x.client_info, ...x.driver_duty_vouchers, id: x.bookings.id, voucherId: x.driver_duty_vouchers.id })),
            },
        };
    }
    catch (err: any) {
        throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: err.message,
        });
    }
}

export const updateBookingHandler = async ({ ctx, input }: { ctx: TRPCContext, input: UpdateBookingSchemaInput }) => {
    try {
        const res = await ctx.db.transaction(async (tx) => {
            const clientInfo = await tx.update(clientInfoTable).set({
                clientName: input.clientName,
                clientAddress: input.clientAddress,
                clientPhone: input.clientPhone,
                clientAltPhone: input.clientAltPhone,
            }).where(eq(clientInfoTable.id, input.clientId)).returning();

            const bookingInfo = await tx.update(bookingsTable).set(input).where(eq(bookingsTable.id, input.id)).returning();

            const voucherInfo = await tx.update(driverDutyVouchersTable).set({
                vehicleId: input.vehicleId,
            }).where(eq(driverDutyVouchersTable.bookingId, input.id)).returning();

            return { ...bookingInfo.at(0)!, ...clientInfo.at(0)!, id: bookingInfo.at(0)!.id, voucherId: voucherInfo.at(0)!.id };
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

export const updatePaymentCollectedHandler = async ({ ctx, input }: { ctx: TRPCContext, input: { id: number, isPaymentCollected: boolean } }) => {
    try {
        const res = await ctx.db.update(bookingsTable).set({ isPaymentCollected: input.isPaymentCollected }).where(eq(bookingsTable.id, input.id)).returning();
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

export const deleteBookingHandler = async ({ ctx, input: id }: { ctx: TRPCContext, input: number }) => {
    try {
        const res = await ctx.db.transaction(async (tx) => {
            const booking = await tx.update(bookingsTable).set({ isDeleted: true }).where(eq(bookingsTable.id, id)).returning();
            await tx.update(driverDutyVouchersTable).set({ isDeleted: true }).where(eq(driverDutyVouchersTable.bookingId, id));
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