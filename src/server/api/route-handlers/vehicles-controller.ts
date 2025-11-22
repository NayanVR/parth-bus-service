import logger from "@/lib/logger";
import { CreateVehicleInput, UpdateVehicleInput, VehicleOccupiedDatesInput } from "@/lib/types/vehicle-schema";
import { optimizeDateRanges } from "@/lib/utils";
import { bookingsTable, maintenanceTable, vehiclesTable } from "@/server/db/schema";
import { TRPCError } from "@trpc/server";
import { and, desc, eq, gte, lte } from "drizzle-orm";
import { TRPCContext } from "../trpc-context";

export async function getVehicleOccupiedDatesHandler({ ctx, input }: { ctx: TRPCContext, input: VehicleOccupiedDatesInput }) {
    logger.info({ input }, "getVehicleOccupiedDatesHandler called");
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

        logger.info({ count: optimizedDates.length }, "getVehicleOccupiedDatesHandler success");
        return {
            status: 'success',
            data: {
                occupiedDates: optimizedDates,
            },
        };
    } catch (err: any) {
        logger.error({ err }, "getVehicleOccupiedDatesHandler failed");
        throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: err.message,
        });
    }
}

export async function getAllVehiclesHandler({ ctx }: { ctx: TRPCContext }) {
    logger.info("getAllVehiclesHandler called");
    try {
        const res = await ctx.db.select().from(vehiclesTable).where(eq(vehiclesTable.isDeleted, false)).orderBy(desc(vehiclesTable.createdAt));
        logger.info({ count: res.length }, "getAllVehiclesHandler success");
        return {
            status: 'success',
            data: {
                vehicles: res,
            },
        };
    } catch (err: any) {
        logger.error({ err }, "getAllVehiclesHandler failed");
        throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: err.message,
        });
    }
}

export async function createVehicleHandler({ ctx, input }: { ctx: TRPCContext, input: CreateVehicleInput }) {
    logger.info({ input }, "createVehicleHandler called");
    try {
        const res = (await ctx.db.insert(vehiclesTable).values(input).returning()).at(0);
        logger.info({ vehicleId: res?.id }, "createVehicleHandler success");
        return {
            status: 'success',
            data: {
                vehicle: res,
            },
        };
    } catch (err: any) {
        logger.error({ err }, "createVehicleHandler failed");
        throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: err.message,
        });
    }
}

export async function updateVehicleHandler({ ctx, input }: { ctx: TRPCContext, input: UpdateVehicleInput }) {
    logger.info({ input }, "updateVehicleHandler called");
    try {
        const res = await ctx.db.update(vehiclesTable).set(input).where(eq(vehiclesTable.id, input.id)).returning();
        logger.info({ vehicleId: res[0]?.id }, "updateVehicleHandler success");
        return {
            status: 'success',
            data: {
                vehicle: res,
            },
        };
    } catch (err: any) {
        logger.error({ err }, "updateVehicleHandler failed");
        throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: err.message,
        });
    }
}

export async function deleteVehicleHandler({ ctx, input: id }: { ctx: TRPCContext, input: number }) {
    logger.info({ id }, "deleteVehicleHandler called");
    try {
        const res = await ctx.db.update(vehiclesTable).set({ isDeleted: true }).where(eq(vehiclesTable.id, id)).returning();
        logger.info({ vehicleId: id }, "deleteVehicleHandler success");
        return {
            status: 'success',
            data: {
                vehicle: res,
            },
        };
    } catch (err: any) {
        logger.error({ err }, "deleteVehicleHandler failed");
        throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: err.message,
        });
    }
}