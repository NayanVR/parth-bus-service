DO $$ BEGIN
 CREATE TYPE "public"."userRole" AS ENUM('driver', 'admin');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"email" text NOT NULL,
	"password" text NOT NULL,
	"role" "userRole" DEFAULT 'admin' NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
