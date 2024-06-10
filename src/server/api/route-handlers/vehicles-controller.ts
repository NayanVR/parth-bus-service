import { vehiclesTable } from "@/server/db/schema";
import { TRPCContext } from "../trpc-context";
import { TRPCError } from "@trpc/server";
import { CreateVehicleInput, UpdateVehicleInput } from "@/lib/types/vehicle-schema";
import { eq } from "drizzle-orm";

export async function getAllVehiclesHandler({ ctx }: { ctx: TRPCContext }) {
    try {
        const res = await ctx.db.select().from(vehiclesTable);
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