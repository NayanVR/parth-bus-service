ALTER TABLE "bookings" ALTER COLUMN "client_id" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "bookings" ALTER COLUMN "vehicle_id" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "driver_duty_vouchers" ALTER COLUMN "client_id" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "driver_duty_vouchers" ALTER COLUMN "booking_id" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "driver_duty_vouchers" ALTER COLUMN "vehicle_id" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "maintenance" ALTER COLUMN "vehicle_id" SET DATA TYPE integer;