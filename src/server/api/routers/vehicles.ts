import { z } from "zod";
import { createVehicleHandler, deleteVehicleHandler, getAllVehiclesHandler, updateVehicleHandler } from "../route-handlers/vehicles-controller";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";
import { createVehicleSchema, updateVehicleSchema } from "@/lib/types/vehicle-schema";

export const vehiclesRouter = createTRPCRouter({
    getAllVehicles: publicProcedure.query(getAllVehiclesHandler),
    createVehicle: protectedProcedure.input(createVehicleSchema).mutation(createVehicleHandler),
    updateVehicle: protectedProcedure.input(updateVehicleSchema).mutation(updateVehicleHandler),
    deleteVehicle: protectedProcedure.input(z.number()).mutation(deleteVehicleHandler),
});