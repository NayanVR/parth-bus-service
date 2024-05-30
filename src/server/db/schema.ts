import { pgEnum, pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';

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

export type InsertUser = typeof usersTable.$inferInsert;
export type SelectUser = typeof usersTable.$inferSelect;