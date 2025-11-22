import logger from "@/lib/logger";
import { vehiclesTable } from "@/server/db/schema";
import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";
import { TRPCContext } from "../trpc-context";

export async function getTrashVehiclesHandler({ ctx }: { ctx: TRPCContext }) {
    try {
        const res = await ctx.db.select().from(vehiclesTable).where(eq(vehiclesTable.isDeleted, true));
        return {
            status: 'success',
            data: {
                vehicles: res,
            },
        };
    } catch (err: any) {
        logger.error({ err }, "getTrashVehiclesHandler failed");
        throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: err.message,
        });
    }
}

export async function restoreVehicleHandler({ ctx, input: id }: { ctx: TRPCContext, input: number }) {
    try {
        const res = await ctx.db.update(vehiclesTable).set({ isDeleted: false }).where(eq(vehiclesTable.id, id)).returning();
        return {
            status: 'success',
            data: {
                vehicle: res.at(0),
            },
        };
    } catch (err: any) {
        logger.error({ err }, "restoreVehicleHandler failed");
        throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: err.message,
        });
    }
}

export async function permanentDeleteVehicleHandler({ ctx, input: id }: { ctx: TRPCContext, input: number }) {
    try {
        const res = await ctx.db.delete(vehiclesTable).where(eq(vehiclesTable.id, id)).returning();
        return {
            status: 'success',
            data: {
                vehicle: res,
            },
        };
    } catch (err: any) {
        logger.error({ err }, "permanentDeleteVehicleHandler failed");
        throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: err.message,
        });
    }
}