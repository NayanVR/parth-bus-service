ALTER TABLE "bookings" DROP CONSTRAINT "bookings_vehicle_id_vehicles_id_fk";
--> statement-breakpoint
ALTER TABLE "driver_duty_vouchers" DROP CONSTRAINT "driver_duty_vouchers_vehicle_id_vehicles_id_fk";
--> statement-breakpoint
ALTER TABLE "maintanance" DROP CONSTRAINT "maintanance_vehicle_id_vehicles_id_fk";
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "bookings" ADD CONSTRAINT "bookings_vehicle_id_vehicles_id_fk" FOREIGN KEY ("vehicle_id") REFERENCES "public"."vehicles"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "driver_duty_vouchers" ADD CONSTRAINT "driver_duty_vouchers_vehicle_id_vehicles_id_fk" FOREIGN KEY ("vehicle_id") REFERENCES "public"."vehicles"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "maintanance" ADD CONSTRAINT "maintanance_vehicle_id_vehicles_id_fk" FOREIGN KEY ("vehicle_id") REFERENCES "public"."vehicles"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
