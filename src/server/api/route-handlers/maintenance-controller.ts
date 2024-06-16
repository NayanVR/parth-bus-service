// getMaintenancesInInterval: protectedProcedure.input(getMaintenancesInIntervalSchema).query(getMaintenancesInIntervalHandler),
// createMaintenance: protectedProcedure.input(createMaintenanceSchema).mutation(createMaintenanceHandler),
// updateMaintenance: protectedProcedure.input(updateMaintenanceSchema).mutation(updateMaintenanceHandler),
// deleteMaintenance: protectedProcedure.input(z.number()).mutation(deleteMaintenanceHandler),

import { GetMaintenancesInIntervalInput, MaintenanceInput, UpdateMaintenanceInput } from "@/lib/types/maintenance-schema";
import { TRPCContext } from "../trpc-context";
import { maintenanceTable } from "@/server/db/schema";
import { TRPCError } from "@trpc/server";
import { and, eq, gte, lte } from "drizzle-orm";

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
                gte(maintenanceTable.maintenanceDateFrom, input.from),
                lte(maintenanceTable.maintenanceDateTo, input.to)
            ));
        return {
            status: 'success',
            data: {
                maintenances: res,
            },
        };
    } catch (err: any) {
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
        throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: err.message,
        });
    }
}

export const deleteMaintenanceHandler = async ({ ctx, input: id }: { ctx: TRPCContext, input: number }) => {
    try {
        await ctx.db.delete(maintenanceTable).where(eq(maintenanceTable.id, id));
        return {
            status: 'success',
        };
    } catch (err: any) {
        throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: err.message,
        });
    }
}