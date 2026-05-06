CREATE TABLE "images" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"blob_url" text NOT NULL,
	"width" integer NOT NULL,
	"height" integer NOT NULL,
	"alt" text DEFAULT '' NOT NULL,
	"focal_x" real DEFAULT 0.5 NOT NULL,
	"focal_y" real DEFAULT 0.5 NOT NULL,
	"filename" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "login_attempts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"ip" text NOT NULL,
	"attempted_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "posts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"excerpt" text,
	"status" text DEFAULT 'draft' NOT NULL,
	"content_json" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"content_schema_version" smallint DEFAULT 1 NOT NULL,
	"cover_image_id" uuid,
	"og_image_id" uuid,
	"tags" text[] DEFAULT '{}'::text[] NOT NULL,
	"author_name" text NOT NULL,
	"author_url" text,
	"meta_title" text,
	"meta_description" text,
	"canonical_url" text,
	"geo_variants" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"ai_readiness_score" smallint,
	"ai_readiness_band" text,
	"ai_readiness_report" jsonb,
	"ai_readiness_content_hash" text,
	"ai_readiness_checked_at" timestamp with time zone,
	"published_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "posts_status_check" CHECK ("posts"."status" IN ('draft','published'))
);
--> statement-breakpoint
ALTER TABLE "posts" ADD CONSTRAINT "posts_cover_image_id_images_id_fk" FOREIGN KEY ("cover_image_id") REFERENCES "public"."images"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "posts" ADD CONSTRAINT "posts_og_image_id_images_id_fk" FOREIGN KEY ("og_image_id") REFERENCES "public"."images"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "login_attempts_ip_attempted_at_idx" ON "login_attempts" USING btree ("ip","attempted_at" DESC NULLS LAST);--> statement-breakpoint
CREATE UNIQUE INDEX "posts_slug_unique_idx" ON "posts" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "posts_status_published_at_idx" ON "posts" USING btree ("status","published_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "posts_tags_gin_idx" ON "posts" USING gin ("tags");