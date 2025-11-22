// getMaintenancesInInterval: protectedProcedure.input(getMaintenancesInIntervalSchema).query(getMaintenancesInIntervalHandler),
// createMaintenance: protectedProcedure.input(createMaintenanceSchema).mutation(createMaintenanceHandler),
// updateMaintenance: protectedProcedure.input(updateMaintenanceSchema).mutation(updateMaintenanceHandler),
// deleteMaintenance: protectedProcedure.input(z.number()).mutation(deleteMaintenanceHandler),

import logger from "@/lib/logger";
import { GetMaintenancesInIntervalInput, MaintenanceInput, UpdateMaintenanceInput } from "@/lib/types/maintenance-schema";
import { maintenanceTable } from "@/server/db/schema";
import { TRPCError } from "@trpc/server";
import { and, desc, eq, gte, lte } from "drizzle-orm";
import { TRPCContext } from "../trpc-context";

export const createMaintenanceHandler = async ({ ctx, input }: { ctx: TRPCContext, input: MaintenanceInput }) => {
    try {
        const res = (await ctx.db.insert(maintenanceTable).values(input).returning()).at(0);
        return {
            status: 'success',
            data: {
                maintenance: res,
            },
        };
    } catch (err: any) {
        logger.error({ err }, "createMaintenanceHandler failed");
        throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: err.message,
        });
    }
}

export const getMaintenancesInIntervalHandler = async ({ ctx, input }: { ctx: TRPCContext, input: GetMaintenancesInIntervalInput }) => {
    try {
        const res = await ctx.db
            .select()
            .from(maintenanceTable)
            .where(and(
                eq(maintenanceTable.isDeleted, false),
                gte(maintenanceTable.maintenanceDateFrom, input.from),
                lte(maintenanceTable.maintenanceDateTo, input.to)
            ))
            .orderBy(desc(maintenanceTable.createdAt));
        return {
            status: 'success',
            data: {
                maintenances: res,
            },
        };
    } catch (err: any) {
        logger.error({ err }, "getMaintenancesInIntervalHandler failed");
        throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: err.message
        })
    }
}

export const updateMaintenanceHandler = async ({ ctx, input }: { ctx: TRPCContext, input: UpdateMaintenanceInput }) => {
    try {
        const res = await ctx.db.update(maintenanceTable).set(input).where(eq(maintenanceTable.id, input.id)).returning();
        return {
            status: 'success',
            data: {
                maintenance: res,
            },
        };
    } catch (err: any) {
        logger.error({ err }, "updateMaintenanceHandler failed");
        throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: err.message,
        });
    }
}

export const deleteMaintenanceHandler = async ({ ctx, input: id }: { ctx: TRPCContext, input: number }) => {
    try {
        await ctx.db.update(maintenanceTable).set({ isDeleted: true }).where(eq(maintenanceTable.id, id));
        return {
            status: 'success',
        };
    } catch (err: any) {
        logger.error({ err }, "deleteMaintenanceHandler failed");
        throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: err.message,
        });
    }
}