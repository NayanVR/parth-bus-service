ALTER TABLE "bookings" ADD COLUMN "estimated_kms" integer;--> statement-breakpoint
ALTER TABLE "bookings" ADD COLUMN "cost_per_km" real;--> statement-breakpoint
ALTER TABLE "driver_duty_vouchers" ADD COLUMN "toll_taxes" real DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "driver_duty_vouchers" ADD COLUMN "additional_expenses" real DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "maintenance" ADD COLUMN "remarks" text;