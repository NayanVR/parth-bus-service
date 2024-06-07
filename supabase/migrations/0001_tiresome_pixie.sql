CREATE TABLE IF NOT EXISTS "bookings" (
	"id" serial PRIMARY KEY NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"client_name" text NOT NULL,
	"client_address" text NOT NULL,
	"client_phone" text NOT NULL,
	"client_alt_phone" text,
	"vehicle_id" serial NOT NULL,
	"travel_place" text NOT NULL,
	"travel_from" timestamp with time zone NOT NULL,
	"travel_to" timestamp with time zone NOT NULL,
	"no_of_travel_days" integer DEFAULT 0 NOT NULL,
	"no_of_passengers" integer DEFAULT 0 NOT NULL,
	"booking_date" timestamp with time zone DEFAULT now() NOT NULL,
	"return_date" timestamp with time zone,
	"estimated_cost" real DEFAULT 0 NOT NULL,
	"advance_payment" real DEFAULT 0 NOT NULL,
	"remaining_payment" real NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "driver_duty_vouchers" (
	"id" serial PRIMARY KEY NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"driver_name" text NOT NULL,
	"client_name" text NOT NULL,
	"client_address" text NOT NULL,
	"client_phone" text NOT NULL,
	"client_alt_phone" text,
	"vehicle_id" serial NOT NULL,
	"driver_expense" real DEFAULT 0 NOT NULL,
	"odometer_start" real DEFAULT 0 NOT NULL,
	"odometer_end" real DEFAULT 0 NOT NULL,
	"payment_collected" real DEFAULT 0 NOT NULL,
	"remarks" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "vehicles" (
	"id" serial PRIMARY KEY NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"plate_number" text NOT NULL,
	"type" text NOT NULL,
	CONSTRAINT "vehicles_plate_number_unique" UNIQUE("plate_number")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "bookings" ADD CONSTRAINT "bookings_vehicle_id_vehicles_id_fk" FOREIGN KEY ("vehicle_id") REFERENCES "public"."vehicles"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "driver_duty_vouchers" ADD CONSTRAINT "driver_duty_vouchers_vehicle_id_vehicles_id_fk" FOREIGN KEY ("vehicle_id") REFERENCES "public"."vehicles"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
