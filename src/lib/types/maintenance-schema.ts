//     vehicleId: serial('vehicle_id').notNull().references(() => vehiclesTable.id, { onDelete: "cascade" }),
//     maintenanceCost: real('maintenance_cost').notNull().default(0),
//     maintenanceDateFrom: timestamp('maintenance_date_from', { mode: 'date', withTimezone: true }).notNull(),
//     maintenanceDateTo: timestamp('maintenance_date_to', { mode: 'date', withTimezone: true }).notNull(),
//     odometerKm: real('odometer_km').notNull().default(0),

import { z } from "zod";

const _baseMaintenanceSchema = {
    vehicleId: z.number({ required_error: 'Vehicle id is required' }),
    maintenanceCost: z.number({ required_error: 'Maintenance cost is required' }).min(0, 'Maintenance cost cannot be negative'),
    maintenanceDateFrom: z.date({ required_error: 'Maintenance date from is required' }),
    maintenanceDateTo: z.date({ required_error: 'Maintenance date to is required' }),
    odometerKm: z.number({ required_error: 'Odometer km is required' }).min(0, 'Odometer km cannot be negative'),
};

export const maintenanceSchema = z.object(_baseMaintenanceSchema)
    .refine((data) => data.maintenanceDateFrom <= data.maintenanceDateTo, {
        path: ['maintenanceDateFrom'],
        message: 'Maintenance date from cannot be more than maintenance date to',
    });

export const updateMaintenanceSchema = z.object({
    ..._baseMaintenanceSchema,
    id: z.number({ required_error: 'Maintenance id is required' }),
});

export const getMaintenancesInIntervalSchema = z.object({
    from: z.date({ required_error: 'From date is required' }),
    to: z.date({ required_error: 'To date is required' }),
}).refine((data) => data.from <= data.to, {
    path: ['from'],
    message: 'From date cannot be more than to date',
});

export type MaintenanceInput = z.infer<typeof maintenanceSchema>;
export type UpdateMaintenanceInput = z.infer<typeof updateMaintenanceSchema>;
export type GetMaintenancesInIntervalInput = z.infer<typeof getMaintenancesInIntervalSchema>;