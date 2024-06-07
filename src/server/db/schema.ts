import { sql } from 'drizzle-orm';
import { integer, pgEnum, pgTable, real, serial, text, timestamp } from 'drizzle-orm/pg-core';

const xMetadata = {
  id: serial('id').primaryKey(),
  createdAt: timestamp('created_at', { mode: 'date', withTimezone: true }).defaultNow().notNull(),
};

const metadata = {
  ...xMetadata,
  updatedAt: timestamp('updated_at', { mode: 'date', withTimezone: true }).defaultNow().notNull().$onUpdate(() => new Date()),
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
  clientName: text('client_name').notNull(),
  clientAddress: text('client_address').notNull(),
  clientPhone: text('client_phone').notNull(),
  clientAltPhone: text('client_alt_phone'),
  vehicleId: serial('vehicle_id').notNull().references(() => vehiclesTable.id),
  travelPlace: text('travel_place').notNull(),
  travelFrom: timestamp('travel_from', { mode: 'date', withTimezone: true }).notNull(),
  travelTo: timestamp('travel_to', { mode: 'date', withTimezone: true }).notNull(),
  noOfTravelDays: integer('no_of_travel_days').notNull().default(0),
  noOfPassengers: integer('no_of_passengers').notNull().default(0),
  bookingDate: timestamp('booking_date', { mode: 'date', withTimezone: true }).defaultNow().notNull(),
  returnDate: timestamp('return_date', { mode: 'date', withTimezone: true }),
  estimatedCost: real('estimated_cost').notNull().default(0),
  advancePayment: real('advance_payment').notNull().default(0),
  remainingPayment: real('remaining_payment').notNull().$default(() => sql`estimated_cost - advance_payment`),
});

export const driverDutyVouchersTable = pgTable('driver_duty_vouchers', {
  ...metadata,
  driverName: text('driver_name').notNull(),
  clientName: text('client_name').notNull(),
  clientAddress: text('client_address').notNull(),
  clientPhone: text('client_phone').notNull(),
  clientAltPhone: text('client_alt_phone'),
  vehicleId: serial('vehicle_id').notNull().references(() => vehiclesTable.id),
  driverExpense: real('driver_expense').notNull().default(0),
  odometerStart: real('odometer_start').notNull().default(0),
  odometerEnd: real('odometer_end').notNull().default(0),
  paymentCollected: real('payment_collected').notNull().default(0),
  remarks: text('remarks'),
});

export const vehiclesTable = pgTable('vehicles', {
  ...metadata,
  plateNumber: text('plate_number').notNull().unique(),
  type: text('type').notNull(),
});

export type InsertUser = typeof usersTable.$inferInsert;
export type SelectUser = typeof usersTable.$inferSelect;