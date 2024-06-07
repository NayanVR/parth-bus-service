import { BookingsSchemaInput, GetBookingsInIntervalSchemaInput, UpdateBookingSchemaInput } from "@/lib/types/bookings-schema";
import { TRPCContext } from "../trpc-context";
import { bookingsTable } from "@/server/db/schema";
import { TRPCError } from "@trpc/server";
import { and, eq, gte, lte } from "drizzle-orm";

export const createVehicleBookingHandler = async ({ ctx, input }: { ctx: TRPCContext, input: BookingsSchemaInput }) => {
    try {
        const res = (await ctx.db.insert(bookingsTable).values(input).returning()).at(0);
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
                gte(bookingsTable.bookingDate, input.from),
                lte(bookingsTable.bookingDate, input.to)
            ));
        return {
            status: 'success',
            data: {
                bookings: res,
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
        const res = await ctx.db.update(bookingsTable).set(input).where(eq(bookingsTable.id, input.id)).returning();
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
        const res = await ctx.db.delete(bookingsTable).where(eq(bookingsTable.id, id)).returning();
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