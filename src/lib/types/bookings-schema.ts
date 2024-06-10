import { z } from "zod";

const _baseBookingSchema = {
    clientName: z.string({ required_error: 'Client name is required' })
        .min(1, 'Client name is required'),
    clientAddress: z.string({ required_error: 'Client address is required' })
        .min(1, 'Client address is required'),
    clientPhone: z.string({ required_error: 'Client phone is required' })
        .min(1, 'Client phone is required'),
    clientAltPhone: z.string(),
    vehicleId: z.number({ required_error: 'Vehicle is required' }).gt(0, 'Vehicle is required'),
    travelPlace: z.string({ required_error: 'Travel place is required' })
        .min(1, 'Travel place is required'),
    travelFrom: z.date({ required_error: 'Travel from is required' }),
    travelTo: z.date({ required_error: 'Travel to is required' }),
    noOfTravelDays: z.number({ required_error: 'Number of travel days is required' }),
    noOfPassengers: z.number({ required_error: 'Number of passengers is required' }).gte(0, 'Number of passengers is required'),
    bookingDate: z.date({ required_error: 'Booking date is required' }),
    returnDate: z.date({ required_error: 'Return date is required' }),
    estimatedCost: z.number({ required_error: 'Estimated cost is required' }),
    advancePayment: z.number({ required_error: 'Advance payment is required' }),
    remainingPayment: z.number({ required_error: 'Remaining payment is required' }),
};

export const bookingsSchema = z.object(_baseBookingSchema)
    .refine((data) => data.advancePayment <= data.estimatedCost, {
        path: ['advancePayment'],
        message: 'Advance payment cannot be more than estimated cost',
    })
    .refine((data) => data.travelFrom <= data.travelTo, {
        path: ['travelFrom'],
        message: 'Travel from date cannot be more than travel to date',
    })
    .refine((data) => data.bookingDate <= data.returnDate, {
        path: ['bookingDate'],
        message: 'Booking date cannot be more than return date',
    });

export const updateBookingSchema = z.object({
    id: z.number({ required_error: 'Booking id is required' }),
    ..._baseBookingSchema,
})
    .refine((data) => data.advancePayment <= data.estimatedCost, {
        path: ['advancePayment'],
        message: 'Advance payment cannot be more than estimated cost',
    })
    .refine((data) => data.travelFrom <= data.travelTo, {
        path: ['travelFrom'],
        message: 'Travel from date cannot be more than travel to date',
    })
    .refine((data) => data.bookingDate <= data.returnDate, {
        path: ['bookingDate'],
        message: 'Booking date cannot be more than return date',
    });

export const getBookingsInIntervalSchema = z.object({
    from: z.date({ required_error: 'From date is required' }),
    to: z.date({ required_error: 'To date is required' }),
}).refine((data) => data.from <= data.to, {
    path: ['from'],
    message: 'From date cannot be more than to date',
});

export type BookingsSchemaInput = z.infer<typeof bookingsSchema>;
export type UpdateBookingSchemaInput = z.infer<typeof updateBookingSchema>;
export type GetBookingsInIntervalSchemaInput = z.infer<typeof getBookingsInIntervalSchema>;