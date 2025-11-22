import logger from "@/lib/logger";
import { bookingsTable, clientInfoTable, driverDutyVouchersTable } from "@/server/db/schema";
import { TRPCError } from "@trpc/server";
import { and, eq, gte, lte } from "drizzle-orm";
import { TRPCContext } from "../trpc-context";

export const getTrashBookingsInIntervalHandler = async ({ ctx, input }: { ctx: TRPCContext, input: { from: Date, to: Date } }) => {
    logger.info({ input }, "getTrashBookingsInIntervalHandler called");
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

        logger.info({ count: res.length }, "getTrashBookingsInIntervalHandler success");
        return {
            status: 'success',
            data: {
                bookings: res.map(x => ({ ...x.bookings, ...x.client_info, id: x.bookings.id, voucherId: x.driver_duty_vouchers.id })).sort((a, b) => a.bookingDate > b.bookingDate ? 1 : -1),
            },
        };
    } catch (err: any) {
        logger.error({ err }, "getTrashBookingsInIntervalHandler failed");
        throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: err.message,
        });
    }
}

export const restoreBookingHandler = async ({ ctx, input: id }: { ctx: TRPCContext, input: number }) => {
    logger.info({ id }, "restoreBookingHandler called");
    try {
        const res = await ctx.db.transaction(async (tx) => {
            const booking = await tx.update(bookingsTable).set({ isDeleted: false }).where(eq(bookingsTable.id, id)).returning();
            await tx.update(driverDutyVouchersTable).set({ isDeleted: false }).where(eq(driverDutyVouchersTable.clientId, booking.at(0)!.clientId));
            return booking.at(0);
        });
        logger.info({ bookingId: res?.id }, "restoreBookingHandler success");
        return {
            status: 'success',
            data: {
                booking: res,
            },
        };
    } catch (err: any) {
        logger.error({ err }, "restoreBookingHandler failed");
        throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: err.message,
        });
    }
}

export const permanentDeleteBookingHandler = async ({ ctx, input: id }: { ctx: TRPCContext, input: number }) => {
    logger.info({ id }, "permanentDeleteBookingHandler called");
    try {
        const res = await ctx.db.transaction(async (tx) => {
            logger.info("Deleting booking...");
            const booking = await tx.delete(bookingsTable).where(eq(bookingsTable.id, id)).returning();
            logger.info({ booking }, "Booking deleted result");

            if (!booking.length) {
                logger.warn({ id }, "Booking not found for deletion");
                throw new Error(`Booking with id ${id} not found`);
            }

            const clientId = booking[0]!.clientId;
            logger.info({ clientId }, "Deleting client info...");

            const client = await tx.delete(clientInfoTable).where(eq(clientInfoTable.id, clientId)).returning();
            logger.info({ client }, "Client info deleted result");

            logger.info({ clientId }, "Deleting vouchers...");
            const vouchers = await tx.delete(driverDutyVouchersTable).where(eq(driverDutyVouchersTable.clientId, clientId)).returning();
            logger.info({ vouchers }, "Vouchers deleted result");

            return booking[0];
        });
        return {
            status: 'success',
            data: {
                booking: res,
            },
        };
    } catch (err: any) {
        logger.error({ err }, "permanentDeleteBookingHandler failed");
        throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: err.message,
        });
    }
}