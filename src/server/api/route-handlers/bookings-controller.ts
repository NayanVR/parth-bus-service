import logger from "@/lib/logger";
import { BookingsSchemaInput, GetBookingsInIntervalSchemaInput, UpdateBookingSchemaInput } from "@/lib/types/bookings-schema";
import { bookingsTable, clientInfoTable, driverDutyVouchersTable } from "@/server/db/schema";
import { TRPCError } from "@trpc/server";
import { and, desc, eq, gte, lte } from "drizzle-orm";
import { TRPCContext } from "../trpc-context";

export const createVehicleBookingHandler = async ({ ctx, input }: { ctx: TRPCContext, input: BookingsSchemaInput }) => {
    logger.info({ input }, "createVehicleBookingHandler called");
    try {
        const res = await ctx.db.transaction(async (tx) => {
            logger.info("Starting transaction for booking creation");
            const clientInfo = await tx.insert(clientInfoTable).values(input).returning();
            logger.info({ clientId: clientInfo[0]?.id }, "Client info inserted");

            const bookingInfo = await tx.insert(bookingsTable).values({
                ...input,
                clientId: clientInfo.at(0)!.id,
            }).returning();
            logger.info({ bookingId: bookingInfo[0]?.id }, "Booking info inserted");

            const voucherInfo = await tx.insert(driverDutyVouchersTable).values({
                clientId: clientInfo.at(0)!.id,
                bookingId: bookingInfo.at(0)!.id,
                driverName: "",
                vehicleId: input.vehicleId,
            }).returning();
            logger.info({ voucherId: voucherInfo[0]?.id }, "Voucher info inserted");

            // Verify insertion
            const verifyBooking = await tx.select().from(bookingsTable).where(eq(bookingsTable.id, bookingInfo.at(0)!.id));
            if (verifyBooking.length > 0) {
                logger.info({ bookingId: verifyBooking[0]?.id }, "Verification: Booking found in transaction");
            } else {
                logger.error({ bookingId: bookingInfo.at(0)!.id }, "Verification: Booking NOT found in transaction!");
            }

            return { ...bookingInfo.at(0)!, ...clientInfo.at(0)!, id: bookingInfo.at(0)!.id, voucherId: voucherInfo.at(0)!.id };
        });

        logger.info("Transaction successful, returning result");
        return {
            status: 'success',
            data: {
                booking: res,
            },
        };
    } catch (err: any) {
        logger.error({ err }, "Database transaction failed");

        throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: `Database operation failed: ${err.message}`,
            cause: err,
        });
    }
};

export const getBookingsInIntervalHandler = async ({ ctx, input }: { ctx: TRPCContext, input: GetBookingsInIntervalSchemaInput }) => {
    logger.info({ input }, "getBookingsInIntervalHandler called");
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

        logger.info({ count: res.length }, "getBookingsInIntervalHandler success");
        return {
            status: 'success',
            data: {
                bookings: res.map(x => ({ ...x.bookings, ...x.client_info, ...x.driver_duty_vouchers, id: x.bookings.id, voucherId: x.driver_duty_vouchers.id })),
            },
        };
    }
    catch (err: any) {
        logger.error({ err }, "Database transaction failed");

        throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: `Database operation failed: ${err.message}`,
            cause: err,
        });
    }
}

export const updateBookingHandler = async ({ ctx, input }: { ctx: TRPCContext, input: UpdateBookingSchemaInput }) => {
    logger.info({ input }, "updateBookingHandler called");
    try {
        const res = await ctx.db.transaction(async (tx) => {
            logger.info("Updating client info...");
            const clientInfo = await tx.update(clientInfoTable).set({
                clientName: input.clientName,
                clientAddress: input.clientAddress,
                clientPhone: input.clientPhone,
                clientAltPhone: input.clientAltPhone,
            }).where(eq(clientInfoTable.id, input.clientId)).returning();

            logger.info("Updating booking info...");
            const bookingInfo = await tx.update(bookingsTable).set(input).where(eq(bookingsTable.id, input.id)).returning();

            logger.info("Updating voucher info...");
            const voucherInfo = await tx.update(driverDutyVouchersTable).set({
                vehicleId: input.vehicleId,
            }).where(eq(driverDutyVouchersTable.bookingId, input.id)).returning();

            return { ...bookingInfo.at(0)!, ...clientInfo.at(0)!, id: bookingInfo.at(0)!.id, voucherId: voucherInfo.at(0)!.id };
        });

        logger.info({ bookingId: res.id }, "updateBookingHandler success");
        return {
            status: 'success',
            data: {
                booking: res,
            },
        };
    } catch (err: any) {
        logger.error({ err }, "Database transaction failed");

        throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: `Database operation failed: ${err.message}`,
            cause: err,
        });
    }
}

export const updatePaymentCollectedHandler = async ({ ctx, input }: { ctx: TRPCContext, input: { id: number, isPaymentCollected: boolean } }) => {
    logger.info({ input }, "updatePaymentCollectedHandler called");
    try {
        const res = await ctx.db.update(bookingsTable).set({ isPaymentCollected: input.isPaymentCollected }).where(eq(bookingsTable.id, input.id)).returning();
        logger.info({ bookingId: input.id, isPaymentCollected: input.isPaymentCollected }, "updatePaymentCollectedHandler success");
        return {
            status: 'success',
            data: {
                booking: res,
            },
        };
    } catch (err: any) {
        logger.error({ err }, "Database transaction failed");

        throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: `Database operation failed: ${err.message}`,
            cause: err,
        });
    }
}

export const deleteBookingHandler = async ({ ctx, input: id }: { ctx: TRPCContext, input: number }) => {
    logger.info({ id }, "deleteBookingHandler called");
    try {
        const res = await ctx.db.transaction(async (tx) => {
            logger.info("Soft deleting booking...");
            const booking = await tx.update(bookingsTable).set({ isDeleted: true }).where(eq(bookingsTable.id, id)).returning();
            logger.info("Soft deleting voucher...");
            await tx.update(driverDutyVouchersTable).set({ isDeleted: true }).where(eq(driverDutyVouchersTable.bookingId, id));
            return booking.at(0);
        });
        logger.info({ bookingId: id }, "deleteBookingHandler success");
        return {
            status: 'success',
            data: {
                booking: res,
            },
        };
    } catch (err: any) {
        logger.error({ err }, "Database transaction failed");

        throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: `Database operation failed: ${err.message}`,
            cause: err,
        });
    }
}