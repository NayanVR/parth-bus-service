import { z } from "zod";
import { getTrashBookingsInIntervalHandler, permanentDeleteBookingHandler, restoreBookingHandler } from "../route-handlers/trash-bookings-controller";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { getTrashMaintenancesInIntervalHandler, permanentDeleteMaintenanceHandler, restoreMaintenanceHandler } from "../route-handlers/trash-maintenance-controller";
import { getTrashVehiclesHandler, permanentDeleteVehicleHandler, restoreVehicleHandler } from "../route-handlers/trash-vehicle-controller";

const DateInterval = z.object({
    from: z.date(),
    to: z.date()
});

export const trashRouter = createTRPCRouter({
    getTrashBookingsInInterval: protectedProcedure.input(DateInterval).query(getTrashBookingsInIntervalHandler),
    restoreBooking: protectedProcedure.input(z.number()).mutation(restoreBookingHandler),
    permanentDeleteBooking: protectedProcedure.input(z.number()).mutation(permanentDeleteBookingHandler),
    getTrashMaintenancesInInterval: protectedProcedure.input(DateInterval).query(getTrashMaintenancesInIntervalHandler),
    restoreMaintenance: protectedProcedure.input(z.number()).mutation(restoreMaintenanceHandler),
    permanentDeleteMaintenance: protectedProcedure.input(z.number()).mutation(permanentDeleteMaintenanceHandler),
    getTrashVehicles: protectedProcedure.query(getTrashVehiclesHandler),
    restoreVehicle: protectedProcedure.input(z.number()).mutation(restoreVehicleHandler),
    permanentDeleteVehicle: protectedProcedure.input(z.number()).mutation(permanentDeleteVehicleHandler),
});