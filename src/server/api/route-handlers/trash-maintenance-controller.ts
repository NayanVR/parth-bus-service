import logger from "@/lib/logger";
import { maintenanceTable } from "@/server/db/schema";
import { TRPCError } from "@trpc/server";
import { and, eq, gte, lte } from "drizzle-orm";
import { TRPCContext } from "../trpc-context";

export const getTrashMaintenancesInIntervalHandler = async ({ ctx, input }: { ctx: TRPCContext, input: { from: Date, to: Date } }) => {
    logger.info({ input }, "getTrashMaintenancesInIntervalHandler called");
    try {
        const res = await ctx.db
            .select()
            .from(maintenanceTable)
            .where(and(
                eq(maintenanceTable.isDeleted, true),
                gte(maintenanceTable.maintenanceDateFrom, input.from),
                lte(maintenanceTable.maintenanceDateTo, input.to)
            ));

        logger.info({ count: res.length }, "getTrashMaintenancesInIntervalHandler success");
        return {
            status: 'success',
            data: {
                maintenances: res.sort((a, b) => a.createdAt > b.createdAt ? 1 : -1),
            },
        };
    } catch (err: any) {
        logger.error({ err }, "getTrashMaintenancesInIntervalHandler failed");
        throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: err.message,
        });
    }
}

export const restoreMaintenanceHandler = async ({ ctx, input: id }: { ctx: TRPCContext, input: number }) => {
    logger.info({ id }, "restoreMaintenanceHandler called");
    try {
        const res = await ctx.db.update(maintenanceTable).set({ isDeleted: false }).where(eq(maintenanceTable.id, id)).returning();
        logger.info({ maintenanceId: res[0]?.id }, "restoreMaintenanceHandler success");
        return {
            status: 'success',
            data: {
                maintenance: res.at(0),
            },
        };
    } catch (err: any) {
        logger.error({ err }, "restoreMaintenanceHandler failed");
        throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: err.message,
        });
    }
}

export const permanentDeleteMaintenanceHandler = async ({ ctx, input: id }: { ctx: TRPCContext, input: number }) => {
    logger.info({ id }, "permanentDeleteMaintenanceHandler called");
    try {
        await ctx.db.delete(maintenanceTable).where(eq(maintenanceTable.id, id));
        logger.info({ id }, "permanentDeleteMaintenanceHandler success");
        return {
            status: 'success',
        };
    } catch (err: any) {
        logger.error({ err }, "permanentDeleteMaintenanceHandler failed");
        throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: err.message,
        });
    }
}