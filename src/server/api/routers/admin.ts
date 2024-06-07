import { bookingsSchema, getBookingsInIntervalSchema, updateBookingSchema } from "@/lib/types/bookings-schema";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { createVehicleBookingHandler, deleteBookingHandler, getBookingsInIntervalHandler, updateBookingHandler } from "../route-handlers/bookings-controller";
import { z } from "zod";

export const adminRouter = createTRPCRouter({
    createVehicleBooking: protectedProcedure.input(bookingsSchema).mutation(createVehicleBookingHandler),
    updateVehicleBooking: protectedProcedure.input(updateBookingSchema).mutation(updateBookingHandler),
    getBookingsInInterval: protectedProcedure.input(getBookingsInIntervalSchema).mutation(getBookingsInIntervalHandler),
    deleteBooking: protectedProcedure.input(z.number()).mutation(deleteBookingHandler),
});