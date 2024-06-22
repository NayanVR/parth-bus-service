import { vehiclesTable } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import { TRPCContext } from "../trpc-context";
import { TRPCError } from "@trpc/server";

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
        throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: err.message,
        });
    }
}