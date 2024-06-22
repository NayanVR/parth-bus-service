import { integer, pgEnum, pgTable, real, serial, text, timestamp, uuid, bigint, boolean } from 'drizzle-orm/pg-core';

const xMetadata = {
  createdAt: timestamp('created_at', { mode: 'date', withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { mode: 'date', withTimezone: true }).defaultNow().notNull().$onUpdate(() => new Date()),
};

const metadata = {
  ...xMetadata,
  id: serial('id').primaryKey(),
};

export const userRoleEnum = pgEnum('userRole', ['driver', 'admin']);

export const usersTable = pgTable('users', {
  ...metadata,
  email: text('email').notNull().unique(),
  password: text('password').notNull(),
  role: userRoleEnum('role').default('admin').notNull(),
});

export const bookingsTable = pgTable('bookings', {
  ...metadata,
  clientId: serial('client_id').notNull().references(() => clientInfoTable.id),
  vehicleId: serial('vehicle_id').notNull().references(() => vehiclesTable.id, { onDelete: "cascade" }),
  travelPlaceFrom: text('travel_place_from').notNull(),
  travelPlaceTo: text('travel_place_to').notNull(),
  travelDateFrom: timestamp('travel_date_from', { mode: 'date', withTimezone: true }).notNull(),
  travelDateTo: timestamp('travel_date_to', { mode: 'date', withTimezone: true }).notNull(),
  noOfPassengers: integer('no_of_passengers').notNull().default(0),
  bookingDate: timestamp('booking_date', { mode: 'date', withTimezone: true }).defaultNow().notNull(),
  estimatedCost: real('estimated_cost').notNull().default(0),
  advancePayment: real('advance_payment').notNull().default(0),
  remainingPayment: real('remaining_payment').notNull().default(0),
  isDeleted: boolean('is_deleted').default(false).notNull(),
});

export const driverDutyVouchersTable = pgTable('driver_duty_vouchers', {
  ...xMetadata,
  id: uuid('id').primaryKey().defaultRandom(),
  clientId: serial('client_id').notNull().references(() => clientInfoTable.id),
  bookingId: serial('booking_id').notNull().references(() => bookingsTable.id, { onDelete: "cascade" }),
  vehicleId: serial('vehicle_id').notNull().references(() => vehiclesTable.id, { onDelete: "cascade" }),
  driverName: text('driver_name').notNull(),
  driverExpense: real('driver_expense').notNull().default(0),
  odometerStart: real('odometer_start').notNull().default(0),
  odometerEnd: real('odometer_end').notNull().default(0),
  paymentCollected: real('payment_collected').notNull().default(0),
  remarks: text('remarks'),
  isDeleted: boolean('is_deleted').default(false).notNull(),
});

export const clientInfoTable = pgTable('client_info', {
  ...metadata,
  clientName: text('client_name').notNull(),
  clientAddress: text('client_address').notNull(),
  clientPhone: bigint('client_phone', { mode: "number" }).notNull(),
  clientAltPhone: bigint('client_alt_phone', { mode: "number" }),
});

export const maintenanceTable = pgTable('maintenance', {
  ...metadata,
  vehicleId: serial('vehicle_id').notNull().references(() => vehiclesTable.id, { onDelete: "cascade" }),
  maintenanceCost: real('maintenance_cost').notNull().default(0),
  maintenanceDateFrom: timestamp('maintenance_date_from', { mode: 'date', withTimezone: true }).notNull(),
  maintenanceDateTo: timestamp('maintenance_date_to', { mode: 'date', withTimezone: true }).notNull(),
  odometerKm: real('odometer_km').notNull().default(0),
  isDeleted: boolean('is_deleted').default(false).notNull(),
});

export const vehiclesTable = pgTable('vehicles', {
  ...metadata,
  plateNumber: text('plate_number').notNull().unique(),
  type: text('type').notNull(),
  isDeleted: boolean('is_deleted').default(false).notNull(),
});

export type InsertUser = typeof usersTable.$inferInsert;
export type SelectUser = typeof usersTable.$inferSelect;

export type SelectBooking = typeof bookingsTable.$inferSelect;
export type InsertBooking = typeof bookingsTable.$inferInsert;

export type SelectDriverDutyVoucher = typeof driverDutyVouchersTable.$inferSelect;
export type InsertDriverDutyVoucher = typeof driverDutyVouchersTable.$inferInsert;

export type SelectClientInfo = typeof clientInfoTable.$inferSelect;
export type InsertClientInfo = typeof clientInfoTable.$inferInsert;

export type SelectMaintenance = typeof maintenanceTable.$inferSelect;
export type InsertMaintenance = typeof maintenanceTable.$inferInsert;

export type SelectVehicle = typeof vehiclesTable.$inferSelect;
export type InsertVehicle = typeof vehiclesTable.$inferInsert;