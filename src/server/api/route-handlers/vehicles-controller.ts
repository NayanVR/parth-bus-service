import { bookingsTable, maintenanceTable, vehiclesTable } from "@/server/db/schema";
import { TRPCContext } from "../trpc-context";
import { TRPCError } from "@trpc/server";
import { CreateVehicleInput, UpdateVehicleInput, VehicleOccupiedDatesInput } from "@/lib/types/vehicle-schema";
import { eq, and, gte, lte, desc } from "drizzle-orm";
import { optimizeDateRanges } from "@/lib/utils";

export async function getVehicleOccupiedDatesHandler({ ctx, input }: { ctx: TRPCContext, input: VehicleOccupiedDatesInput }) {
    try {
        const res = await ctx.db.transaction(async (tx) => {
            const bookingsRes = await tx.select({
                from: bookingsTable.travelDateFrom,
                to: bookingsTable.travelDateTo,
            }).from(bookingsTable)
                .where(
                    and(
                        eq(bookingsTable.isDeleted, false),
                        eq(bookingsTable.vehicleId, input.vehicleId),
                        gte(bookingsTable.travelDateFrom, input.from),
                        lte(bookingsTable.travelDateTo, input.to)
                    )
                );

            const maintenancesRes = await tx.select({
                from: maintenanceTable.maintenanceDateFrom,
                to: maintenanceTable.maintenanceDateTo,
            }).from(maintenanceTable)
                .where(
                    and(
                        eq(maintenanceTable.isDeleted, false),
                        eq(maintenanceTable.vehicleId, input.vehicleId),
                        gte(maintenanceTable.maintenanceDateFrom, input.from),
                        lte(maintenanceTable.maintenanceDateTo, input.to)
                    )
                );

            return [...bookingsRes, ...maintenancesRes];
        });

        const optimizedDates = optimizeDateRanges(res);

        return {
            status: 'success',
            data: {
                occupiedDates: optimizedDates,
            },
        };
    } catch (err: any) {
        throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: err.message,
        });
    }
}

export async function getAllVehiclesHandler({ ctx }: { ctx: TRPCContext }) {
    try {
        const res = await ctx.db.select().from(vehiclesTable).where(eq(vehiclesTable.isDeleted, false)).orderBy(desc(vehiclesTable.createdAt));
        return {
            status: 'success',
            data: {
                vehicles: res,
            },
        };
    } catch (err: any) {
        throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: err.message,
        });
    }
}

export async function createVehicleHandler({ ctx, input }: { ctx: TRPCContext, input: CreateVehicleInput }) {
    try {
        const res = (await ctx.db.insert(vehiclesTable).values(input).returning()).at(0);
        return {
            status: 'success',
            data: {
                vehicle: res,
            },
        };
    } catch (err: any) {
        throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: err.message,
        });
    }
}

export async function updateVehicleHandler({ ctx, input }: { ctx: TRPCContext, input: UpdateVehicleInput }) {
    try {
        const res = await ctx.db.update(vehiclesTable).set(input).where(eq(vehiclesTable.id, input.id)).returning();
        return {
            status: 'success',
            data: {
                vehicle: res,
            },
        };
    } catch (err: any) {
        throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: err.message,
        });
    }
}

export async function deleteVehicleHandler({ ctx, input: id }: { ctx: TRPCContext, input: number }) {
    try {
        const res = await ctx.db.update(vehiclesTable).set({ isDeleted: true }).where(eq(vehiclesTable.id, id)).returning();
        return {
            status: 'success',
            data: {
                vehicle: res,
            },
        };
    } catch (err: any) {
        throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: err.message,
        });
    }
}