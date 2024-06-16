CREATE TABLE IF NOT EXISTS "client_info" (
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"id" serial PRIMARY KEY NOT NULL,
	"client_name" text NOT NULL,
	"client_address" text NOT NULL,
	"client_phone" bigint NOT NULL,
	"client_alt_phone" bigint
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "maintanance" (
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"id" serial PRIMARY KEY NOT NULL,
	"vehicle_id" serial NOT NULL,
	"maintanance_cost" real DEFAULT 0 NOT NULL,
	"maintanance_date" timestamp with time zone NOT NULL,
	"maintanance_to" timestamp with time zone NOT NULL,
	"odometer_km" real DEFAULT 0 NOT NULL
);
--> statement-breakpoint
ALTER TABLE "bookings" ADD COLUMN "client_id" serial NOT NULL;--> statement-breakpoint
ALTER TABLE "bookings" ADD COLUMN "travel_place_from" text NOT NULL;--> statement-breakpoint
ALTER TABLE "bookings" ADD COLUMN "travel_place_to" text NOT NULL;--> statement-breakpoint
ALTER TABLE "driver_duty_vouchers" ADD COLUMN "client_id" serial NOT NULL;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "maintanance" ADD CONSTRAINT "maintanance_vehicle_id_vehicles_id_fk" FOREIGN KEY ("vehicle_id") REFERENCES "public"."vehicles"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "bookings" ADD CONSTRAINT "bookings_client_id_client_info_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."client_info"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "driver_duty_vouchers" ADD CONSTRAINT "driver_duty_vouchers_client_id_client_info_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."client_info"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "bookings" DROP COLUMN IF EXISTS "client_name";--> statement-breakpoint
ALTER TABLE "bookings" DROP COLUMN IF EXISTS "client_address";--> statement-breakpoint
ALTER TABLE "bookings" DROP COLUMN IF EXISTS "client_phone";--> statement-breakpoint
ALTER TABLE "bookings" DROP COLUMN IF EXISTS "client_alt_phone";--> statement-breakpoint
ALTER TABLE "bookings" DROP COLUMN IF EXISTS "travel_place";--> statement-breakpoint
ALTER TABLE "bookings" DROP COLUMN IF EXISTS "no_of_travel_days";--> statement-breakpoint
ALTER TABLE "bookings" DROP COLUMN IF EXISTS "return_date";--> statement-breakpoint
ALTER TABLE "bookings" DROP COLUMN IF EXISTS "remaining_payment";--> statement-breakpoint
ALTER TABLE "driver_duty_vouchers" DROP COLUMN IF EXISTS "id";--> statement-breakpoint
ALTER TABLE "driver_duty_vouchers" DROP COLUMN IF EXISTS "client_name";--> statement-breakpoint
ALTER TABLE "driver_duty_vouchers" DROP COLUMN IF EXISTS "client_address";--> statement-breakpoint
ALTER TABLE "driver_duty_vouchers" DROP COLUMN IF EXISTS "client_phone";--> statement-breakpoint
ALTER TABLE "driver_duty_vouchers" DROP COLUMN IF EXISTS "client_alt_phone";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN IF EXISTS "id";