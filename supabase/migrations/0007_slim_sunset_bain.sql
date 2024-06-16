ALTER TABLE "maintanance" RENAME TO "maintenance";--> statement-breakpoint
ALTER TABLE "bookings" RENAME COLUMN "travel_from" TO "travel_date_from";--> statement-breakpoint
ALTER TABLE "bookings" RENAME COLUMN "travel_to" TO "travel_date_to";--> statement-breakpoint
ALTER TABLE "maintenance" RENAME COLUMN "maintanance_cost" TO "maintenance_cost";--> statement-breakpoint
ALTER TABLE "maintenance" RENAME COLUMN "maintanance_date" TO "maintenance_date_from";--> statement-breakpoint
ALTER TABLE "maintenance" RENAME COLUMN "maintanance_to" TO "maintenance_date_to";--> statement-breakpoint
ALTER TABLE "maintenance" DROP CONSTRAINT "maintanance_vehicle_id_vehicles_id_fk";
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "maintenance" ADD CONSTRAINT "maintenance_vehicle_id_vehicles_id_fk" FOREIGN KEY ("vehicle_id") REFERENCES "public"."vehicles"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
