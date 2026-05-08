CREATE TABLE "ai_readiness_attempts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"admin_email" text NOT NULL,
	"attempted_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "ai_readiness_attempts_admin_attempted_at_idx" ON "ai_readiness_attempts" USING btree ("admin_email","attempted_at" DESC NULLS LAST);
