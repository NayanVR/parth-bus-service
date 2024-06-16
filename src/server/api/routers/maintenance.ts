import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { getMaintenancesInIntervalSchema, maintenanceSchema, updateMaintenanceSchema } from "@/lib/types/maintenance-schema";
import { getMaintenancesInIntervalHandler, createMaintenanceHandler, updateMaintenanceHandler, deleteMaintenanceHandler } from "../route-handlers/maintenance-controller";

export const maintenanceRouter = createTRPCRouter({
    getMaintenancesInInterval: protectedProcedure.input(getMaintenancesInIntervalSchema).query(getMaintenancesInIntervalHandler),
    createMaintenance: protectedProcedure.input(maintenanceSchema).mutation(createMaintenanceHandler),
    updateMaintenance: protectedProcedure.input(updateMaintenanceSchema).mutation(updateMaintenanceHandler),
    deleteMaintenance: protectedProcedure.input(z.number()).mutation(deleteMaintenanceHandler),
});