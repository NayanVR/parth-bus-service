import { bookingsSchema, getBookingsInIntervalSchema, updateBookingSchema } from "@/lib/types/bookings-schema";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { createVehicleBookingHandler, deleteBookingHandler, getBookingsInIntervalHandler, updateBookingHandler, updatePaymentCollectedHandler } from "../route-handlers/bookings-controller";
import { z } from "zod";

export const bookingsRouter = createTRPCRouter({
    getBookingsInInterval: protectedProcedure.input(getBookingsInIntervalSchema).query(getBookingsInIntervalHandler),
    createVehicleBooking: protectedProcedure.input(bookingsSchema).mutation(createVehicleBookingHandler),
    updateVehicleBooking: protectedProcedure.input(updateBookingSchema).mutation(updateBookingHandler),
    updatePaymentCollected: protectedProcedure.input(z.object({ id: z.number(), isPaymentCollected: z.boolean() })).mutation(updatePaymentCollectedHandler),
    deleteBooking: protectedProcedure.input(z.number()).mutation(deleteBookingHandler),
});