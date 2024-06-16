ALTER TABLE "driver_duty_vouchers" ADD COLUMN "booking_id" serial NOT NULL;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "driver_duty_vouchers" ADD CONSTRAINT "driver_duty_vouchers_booking_id_bookings_id_fk" FOREIGN KEY ("booking_id") REFERENCES "public"."bookings"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
