import { z } from "zod";

const _baseDriverDutyVoucherSchema = {
    driverName: z.string({ required_error: 'Driver name is required' })
        .min(1, 'Driver name is required'),
    clientName: z.string({ required_error: 'Client name is required' })
        .min(1, 'Client name is required'),
    clientAddress: z.string({ required_error: 'Client address is required' })
        .min(1, 'Client address is required'),
    clientPhone: z.string({ required_error: 'Client phone is required' })
        .min(1, 'Client phone is required'),
    clientAltPhone: z.string(),
    vehicleId: z.number({ required_error: 'Vehicle id is required' }),
    driverExpense: z.number({ required_error: 'Driver expense is required' }),
    odometerStart: z.number({ required_error: 'Odometer start is required' }),
    odometerEnd: z.number({ required_error: 'Odometer end is required' }),
    paymentCollected: z.number({ required_error: 'Payment collected is required' }),
    remarks: z.string(),
};

export const driverDutyVoucherSchema = z.object(_baseDriverDutyVoucherSchema)
    .refine((data) => data.odometerStart <= data.odometerEnd, {
        path: ['odometerStart'],
        message: 'Odometer start cannot be more than odometer end',
    });

export const updateDriverDutyVoucherSchema = z.object({
    ..._baseDriverDutyVoucherSchema,
    id: z.number({ required_error: 'Driver duty voucher id is required' }),
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

