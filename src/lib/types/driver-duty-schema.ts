import { z } from "zod";

const _baseDriverDutyVoucherSchema = {
    driverName: z.string({ required_error: 'Driver name is required' })
        .min(1, 'Driver name is required'),
    clientId: z.number({ required_error: 'Client id is required' }),
    clientName: z.string({ required_error: 'Client name is required' })
        .min(1, 'Client name is required'),
    clientAddress: z.string({ required_error: 'Client address is required' })
        .min(1, 'Client address is required'),
    clientPhone: z.number({ required_error: 'Client phone is required' }),
    clientAltPhone: z.number().optional().nullable(),
    vehicleId: z.number({ required_error: 'Vehicle id is required' }),
    driverExpense: z.number({ required_error: 'Driver expense is required' }),
    odometerStart: z.number({ required_error: 'Odometer start is required' }),
    odometerEnd: z.number({ required_error: 'Odometer end is required' }),
    paymentCollected: z.number({ required_error: 'Payment collected is required' }).min(0, 'Payment collected cannot be negative'),
    tollTaxes: z.number({ required_error: 'Toll taxes is required' }).min(0, 'Toll taxes cannot be negative'),
    additionalExpenses: z.number({ required_error: 'Additional expenses is required' }).min(0, 'Additional expenses cannot be negative'),
    estimatedKMs: z.number().optional().nullable(),
    costPerKm: z.number().optional().nullable(),
    estimatedCost: z.number().optional().nullable(),
    advancePayment: z.number().optional().nullable(),
    remainingPayment: z.number().optional().nullable(),
    remarks: z.string(),
};

export const driverDutyVoucherSchema = z.object(_baseDriverDutyVoucherSchema)
    .refine((data) => data.odometerStart <= data.odometerEnd, {
        path: ['odometerStart'],
        message: 'Odometer start cannot be more than odometer end',
    })
    .refine((data) => data.clientPhone.toString().length === 10, {
        path: ['clientPhone'],
        message: 'Client phone number should be 10 digits',
    })
    .refine((data) => {
        if (!data.clientAltPhone) return true
        return data.clientAltPhone.toString().length === 10
    }, {
        path: ['clientAltPhone'],
        message: 'Client alt phone number should be 10 digits',
    });

export const updateDriverDutyVoucherSchema = z.object({
    ..._baseDriverDutyVoucherSchema,
    id: z.string({ required_error: 'Driver duty voucher id is required' }),
})
    .refine((data) => data.odometerStart <= data.odometerEnd, {
        path: ['odometerStart'],
        message: 'Odometer start cannot be more than odometer end',
    })
    .refine((data) => data.clientPhone.toString().length === 10, {
        path: ['clientPhone'],
        message: 'Client phone number should be 10 digits',
    })
    .refine((data) => {
        if (!data.clientAltPhone) return true
        return data.clientAltPhone.toString().length === 10
    }, {
        path: ['clientAltPhone'],
        message: 'Client alt phone number should be 10 digits',
    });

export const getDriverDutyVouchersInIntervalSchema = z.object({
    from: z.date({ required_error: 'From date is required' }),
    to: z.date({ required_error: 'To date is required' }),
}).refine((data) => data.from <= data.to, {
    path: ['from'],
    message: 'From date cannot be more than to date',
});

export type DriverDutyVoucherInput = z.infer<typeof driverDutyVoucherSchema>;
export type UpdateDriverDutyVoucherInput = z.infer<typeof updateDriverDutyVoucherSchema>;
export type GetDriverDutyVouchersInIntervalInput = z.infer<typeof getDriverDutyVouchersInIntervalSchema>;

