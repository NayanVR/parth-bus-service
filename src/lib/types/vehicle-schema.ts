import { z } from "zod";

const _vehicleSchema = {
    plateNumber: z.string({ required_error: 'Plate number is required' })
        .min(1, 'Plate number is required'),
    type: z.string({ required_error: 'Vehicle type is required' })
        .min(1, 'Vehicle type is required'),
};

export const createVehicleSchema = z.object(_vehicleSchema);

export const updateVehicleSchema = z.object({
    id: z.number({ required_error: 'Vehicle id is required' }),
    ..._vehicleSchema,
});

export type CreateVehicleInput = z.infer<typeof createVehicleSchema>;
export type UpdateVehicleInput = z.infer<typeof updateVehicleSchema>;
