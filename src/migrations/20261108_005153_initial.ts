import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."_locales" AS ENUM('en');
  CREATE TYPE "public"."enum_projects_work_discipline" AS ENUM('electronics', 'firmware', 'mechanical', 'prototyping');
  CREATE TYPE "public"."enum_projects_disciplines" AS ENUM('electronics', 'firmware', 'mechanical', 'prototyping');
  CREATE TYPE "public"."enum_projects_dev_status" AS ENUM('concept', 'design', 'prototype', 'fabricated', 'testing', 'production', 'internal');
  CREATE TYPE "public"."enum_projects_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__projects_v_version_work_discipline" AS ENUM('electronics', 'firmware', 'mechanical', 'prototyping');
  CREATE TYPE "public"."enum__projects_v_version_disciplines" AS ENUM('electronics', 'firmware', 'mechanical', 'prototyping');
  CREATE TYPE "public"."enum__projects_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__projects_v_published_locale" AS ENUM('en');
  CREATE TYPE "public"."enum_services_capabilities_delivery" AS ENUM('in-house', 'partner');
  CREATE TYPE "public"."enum_pages_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__pages_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__pages_v_published_locale" AS ENUM('en');
  CREATE TYPE "public"."enum_media_kind" AS ENUM('render', 'photo', 'cad', 'drawing', 'diagram');
  CREATE TYPE "public"."enum_inquiries_scope" AS ENUM('electronics', 'firmware', 'mechanical', 'prototyping', 'complete', 'unsure');
  CREATE TYPE "public"."enum_inquiries_stage" AS ENUM('idea', 'requirements', 'prototype', 'redesign');
  CREATE TYPE "public"."enum_inquiries_timeline" AS ENUM('asap', '3m', '6m', 'flexible');
  CREATE TYPE "public"."enum_inquiries_budget" AS ENUM('undecided', 'lt5k', '5-15k', '15-50k', 'gt50k');
  CREATE TYPE "public"."enum_inquiries_state" AS ENUM('new', 'review', 'replied', 'won', 'closed', 'spam');
  CREATE TYPE "public"."enum_inquiries_notification" AS ENUM('pending', 'sent', 'failed', 'not-configured');
  CREATE TYPE "public"."enum_users_roles" AS ENUM('admin', 'editor');
  CREATE TABLE "projects_gallery" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_id" integer
  );
  
  CREATE TABLE "projects_gallery_locales" (
  	"caption" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "projects_work" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"discipline" "enum_projects_work_discipline"
  );
  
  CREATE TABLE "projects_work_locales" (
  	"item" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "projects_components" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"part" varchar
  );
  
  CREATE TABLE "projects_components_locales" (
  	"role" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "projects_facts" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "projects_facts_locales" (
  	"label" varchar,
  	"value" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "projects_disciplines" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_projects_disciplines",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "projects" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"hero_image_id" integer,
  	"seo_image_id" integer,
  	"seo_noindex" boolean DEFAULT false,
  	"slug" varchar,
  	"reference" varchar,
  	"status" "enum_projects_dev_status" DEFAULT 'design',
  	"year" numeric,
  	"client" varchar,
  	"featured" boolean DEFAULT false,
  	"order" numeric DEFAULT 10,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_projects_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "projects_locales" (
  	"title" varchar,
  	"subtitle" varchar,
  	"summary" varchar,
  	"challenge" jsonb,
  	"notes" jsonb,
  	"seo_title" varchar,
  	"seo_description" varchar,
  	"status_note" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_projects_v_version_gallery" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"image_id" integer,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_projects_v_version_gallery_locales" (
  	"caption" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_projects_v_version_work" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"discipline" "enum__projects_v_version_work_discipline",
  	"_uuid" varchar
  );
  
  CREATE TABLE "_projects_v_version_work_locales" (
  	"item" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_projects_v_version_components" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"part" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_projects_v_version_components_locales" (
  	"role" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_projects_v_version_facts" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_projects_v_version_facts_locales" (
  	"label" varchar,
  	"value" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_projects_v_version_disciplines" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum__projects_v_version_disciplines",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "_projects_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_hero_image_id" integer,
  	"version_seo_image_id" integer,
  	"version_seo_noindex" boolean DEFAULT false,
  	"version_slug" varchar,
  	"version_reference" varchar,
  	"version_status" "enum_projects_dev_status" DEFAULT 'design',
  	"version_year" numeric,
  	"version_client" varchar,
  	"version_featured" boolean DEFAULT false,
  	"version_order" numeric DEFAULT 10,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__projects_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "enum__projects_v_published_locale",
  	"latest" boolean
  );
  
  CREATE TABLE "_projects_v_locales" (
  	"version_title" varchar,
  	"version_subtitle" varchar,
  	"version_summary" varchar,
  	"version_challenge" jsonb,
  	"version_notes" jsonb,
  	"version_seo_title" varchar,
  	"version_seo_description" varchar,
  	"version_status_note" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "services_capabilities" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"delivery" "enum_services_capabilities_delivery"
  );
  
  CREATE TABLE "services_capabilities_locales" (
  	"label" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "services_deliverables" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "services_deliverables_locales" (
  	"label" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "services" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"code" varchar NOT NULL,
  	"order" numeric DEFAULT 10 NOT NULL,
  	"slug" varchar NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "services_locales" (
  	"title" varchar NOT NULL,
  	"headline" varchar,
  	"summary" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "pages" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"effective_date" timestamp(3) with time zone,
  	"slug" varchar,
  	"seo_image_id" integer,
  	"seo_noindex" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_pages_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "pages_locales" (
  	"title" varchar,
  	"eyebrow" varchar,
  	"intro" varchar,
  	"content" jsonb,
  	"seo_title" varchar,
  	"seo_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_pages_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_effective_date" timestamp(3) with time zone,
  	"version_slug" varchar,
  	"version_seo_image_id" integer,
  	"version_seo_noindex" boolean DEFAULT false,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__pages_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "enum__pages_v_published_locale",
  	"latest" boolean
  );
  
  CREATE TABLE "_pages_v_locales" (
  	"version_title" varchar,
  	"version_eyebrow" varchar,
  	"version_intro" varchar,
  	"version_content" jsonb,
  	"version_seo_title" varchar,
  	"version_seo_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "media" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"kind" "enum_media_kind" DEFAULT 'render' NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"url" varchar,
  	"thumbnail_u_r_l" varchar,
  	"filename" varchar,
  	"mime_type" varchar,
  	"filesize" numeric,
  	"width" numeric,
  	"height" numeric,
  	"focal_x" numeric,
  	"focal_y" numeric,
  	"sizes_thumb_url" varchar,
  	"sizes_thumb_width" numeric,
  	"sizes_thumb_height" numeric,
  	"sizes_thumb_mime_type" varchar,
  	"sizes_thumb_filesize" numeric,
  	"sizes_thumb_filename" varchar,
  	"sizes_card_url" varchar,
  	"sizes_card_width" numeric,
  	"sizes_card_height" numeric,
  	"sizes_card_mime_type" varchar,
  	"sizes_card_filesize" numeric,
  	"sizes_card_filename" varchar,
  	"sizes_plate_url" varchar,
  	"sizes_plate_width" numeric,
  	"sizes_plate_height" numeric,
  	"sizes_plate_mime_type" varchar,
  	"sizes_plate_filesize" numeric,
  	"sizes_plate_filename" varchar,
  	"sizes_wide_url" varchar,
  	"sizes_wide_width" numeric,
  	"sizes_wide_height" numeric,
  	"sizes_wide_mime_type" varchar,
  	"sizes_wide_filesize" numeric,
  	"sizes_wide_filename" varchar
  );
  
  CREATE TABLE "media_locales" (
  	"alt" varchar NOT NULL,
  	"caption" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "inquiries_scope" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_inquiries_scope",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "inquiries" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"email" varchar NOT NULL,
  	"company" varchar,
  	"stage" "enum_inquiries_stage",
  	"timeline" "enum_inquiries_timeline",
  	"budget" "enum_inquiries_budget",
  	"message" varchar NOT NULL,
  	"state" "enum_inquiries_state" DEFAULT 'new',
  	"internal_notes" varchar,
  	"notification" "enum_inquiries_notification" DEFAULT 'pending',
  	"notification_error" varchar,
  	"meta_privacy_acknowledged" boolean,
  	"meta_source_path" varchar,
  	"meta_user_agent" varchar,
  	"meta_ip_hash" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "users_roles" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_users_roles",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "users_sessions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"created_at" timestamp(3) with time zone,
  	"expires_at" timestamp(3) with time zone NOT NULL
  );
  
  CREATE TABLE "users" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"email" varchar NOT NULL,
  	"reset_password_token" varchar,
  	"reset_password_expiration" timestamp(3) with time zone,
  	"salt" varchar,
  	"hash" varchar,
  	"reset_password_requested_at" timestamp(3) with time zone,
  	"login_attempts" numeric DEFAULT 0,
  	"lock_until" timestamp(3) with time zone
  );
  
  CREATE TABLE "payload_kv" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar NOT NULL,
  	"data" jsonb NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"global_slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"projects_id" integer,
  	"services_id" integer,
  	"pages_id" integer,
  	"media_id" integer,
  	"inquiries_id" integer,
  	"users_id" integer
  );
  
  CREATE TABLE "payload_preferences" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar,
  	"value" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_preferences_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer
  );
  
  CREATE TABLE "payload_migrations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"batch" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "home_hero_lines" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"line" varchar NOT NULL
  );
  
  CREATE TABLE "home_process_steps" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"body" varchar NOT NULL,
  	"output" varchar
  );
  
  CREATE TABLE "home_why_points" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"body" varchar NOT NULL
  );
  
  CREATE TABLE "home" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "home_locales" (
  	"hero_eyebrow" varchar,
  	"hero_lede" varchar,
  	"disciplines_title" varchar,
  	"disciplines_intro" varchar,
  	"process_title" varchar,
  	"process_intro" varchar,
  	"assembly_title" varchar,
  	"assembly_body" varchar,
  	"assembly_disclaimer" varchar,
  	"why_title" varchar,
  	"contact_title" varchar,
  	"contact_intro" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "site_settings_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"url" varchar NOT NULL
  );
  
  CREATE TABLE "site_settings" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"contact_email" varchar NOT NULL,
  	"phone" varchar,
  	"notify_emails" varchar,
  	"operator_name" varchar NOT NULL,
  	"operator_address" varchar NOT NULL,
  	"company_id" varchar,
  	"tax_id" varchar,
  	"vat_id" varchar,
  	"registry" varchar,
  	"site_title" varchar DEFAULT 'NoClue Industries' NOT NULL,
  	"title_template" varchar DEFAULT '%s — NoClue Industries',
  	"og_image_id" integer,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "site_settings_locales" (
  	"response_time" varchar,
  	"description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  ALTER TABLE "projects_gallery" ADD CONSTRAINT "projects_gallery_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "projects_gallery" ADD CONSTRAINT "projects_gallery_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "projects_gallery_locales" ADD CONSTRAINT "projects_gallery_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."projects_gallery"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "projects_work" ADD CONSTRAINT "projects_work_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "projects_work_locales" ADD CONSTRAINT "projects_work_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."projects_work"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "projects_components" ADD CONSTRAINT "projects_components_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "projects_components_locales" ADD CONSTRAINT "projects_components_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."projects_components"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "projects_facts" ADD CONSTRAINT "projects_facts_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "projects_facts_locales" ADD CONSTRAINT "projects_facts_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."projects_facts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "projects_disciplines" ADD CONSTRAINT "projects_disciplines_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "projects" ADD CONSTRAINT "projects_hero_image_id_media_id_fk" FOREIGN KEY ("hero_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "projects" ADD CONSTRAINT "projects_seo_image_id_media_id_fk" FOREIGN KEY ("seo_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "projects_locales" ADD CONSTRAINT "projects_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_projects_v_version_gallery" ADD CONSTRAINT "_projects_v_version_gallery_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_projects_v_version_gallery" ADD CONSTRAINT "_projects_v_version_gallery_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_projects_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_projects_v_version_gallery_locales" ADD CONSTRAINT "_projects_v_version_gallery_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_projects_v_version_gallery"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_projects_v_version_work" ADD CONSTRAINT "_projects_v_version_work_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_projects_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_projects_v_version_work_locales" ADD CONSTRAINT "_projects_v_version_work_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_projects_v_version_work"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_projects_v_version_components" ADD CONSTRAINT "_projects_v_version_components_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_projects_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_projects_v_version_components_locales" ADD CONSTRAINT "_projects_v_version_components_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_projects_v_version_components"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_projects_v_version_facts" ADD CONSTRAINT "_projects_v_version_facts_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_projects_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_projects_v_version_facts_locales" ADD CONSTRAINT "_projects_v_version_facts_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_projects_v_version_facts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_projects_v_version_disciplines" ADD CONSTRAINT "_projects_v_version_disciplines_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_projects_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_projects_v" ADD CONSTRAINT "_projects_v_parent_id_projects_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."projects"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_projects_v" ADD CONSTRAINT "_projects_v_version_hero_image_id_media_id_fk" FOREIGN KEY ("version_hero_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_projects_v" ADD CONSTRAINT "_projects_v_version_seo_image_id_media_id_fk" FOREIGN KEY ("version_seo_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_projects_v_locales" ADD CONSTRAINT "_projects_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_projects_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services_capabilities" ADD CONSTRAINT "services_capabilities_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services_capabilities_locales" ADD CONSTRAINT "services_capabilities_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services_capabilities"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services_deliverables" ADD CONSTRAINT "services_deliverables_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services_deliverables_locales" ADD CONSTRAINT "services_deliverables_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services_deliverables"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services_locales" ADD CONSTRAINT "services_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages" ADD CONSTRAINT "pages_seo_image_id_media_id_fk" FOREIGN KEY ("seo_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_locales" ADD CONSTRAINT "pages_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v" ADD CONSTRAINT "_pages_v_parent_id_pages_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v" ADD CONSTRAINT "_pages_v_version_seo_image_id_media_id_fk" FOREIGN KEY ("version_seo_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_locales" ADD CONSTRAINT "_pages_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "media_locales" ADD CONSTRAINT "media_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "inquiries_scope" ADD CONSTRAINT "inquiries_scope_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."inquiries"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "users_roles" ADD CONSTRAINT "users_roles_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "users_sessions" ADD CONSTRAINT "users_sessions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_locked_documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_projects_fk" FOREIGN KEY ("projects_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_services_fk" FOREIGN KEY ("services_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_inquiries_fk" FOREIGN KEY ("inquiries_id") REFERENCES "public"."inquiries"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_preferences"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_hero_lines" ADD CONSTRAINT "home_hero_lines_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_process_steps" ADD CONSTRAINT "home_process_steps_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_why_points" ADD CONSTRAINT "home_why_points_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_locales" ADD CONSTRAINT "home_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings_links" ADD CONSTRAINT "site_settings_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings" ADD CONSTRAINT "site_settings_og_image_id_media_id_fk" FOREIGN KEY ("og_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "site_settings_locales" ADD CONSTRAINT "site_settings_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "projects_gallery_order_idx" ON "projects_gallery" USING btree ("_order");
  CREATE INDEX "projects_gallery_parent_id_idx" ON "projects_gallery" USING btree ("_parent_id");
  CREATE INDEX "projects_gallery_image_idx" ON "projects_gallery" USING btree ("image_id");
  CREATE UNIQUE INDEX "projects_gallery_locales_locale_parent_id_unique" ON "projects_gallery_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "projects_gallery_locales_parent_id_idx" ON "projects_gallery_locales" USING btree ("_parent_id");
  CREATE INDEX "projects_work_order_idx" ON "projects_work" USING btree ("_order");
  CREATE INDEX "projects_work_parent_id_idx" ON "projects_work" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "projects_work_locales_locale_parent_id_unique" ON "projects_work_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "projects_work_locales_parent_id_idx" ON "projects_work_locales" USING btree ("_parent_id");
  CREATE INDEX "projects_components_order_idx" ON "projects_components" USING btree ("_order");
  CREATE INDEX "projects_components_parent_id_idx" ON "projects_components" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "projects_components_locales_locale_parent_id_unique" ON "projects_components_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "projects_components_locales_parent_id_idx" ON "projects_components_locales" USING btree ("_parent_id");
  CREATE INDEX "projects_facts_order_idx" ON "projects_facts" USING btree ("_order");
  CREATE INDEX "projects_facts_parent_id_idx" ON "projects_facts" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "projects_facts_locales_locale_parent_id_unique" ON "projects_facts_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "projects_facts_locales_parent_id_idx" ON "projects_facts_locales" USING btree ("_parent_id");
  CREATE INDEX "projects_disciplines_order_idx" ON "projects_disciplines" USING btree ("order");
  CREATE INDEX "projects_disciplines_parent_idx" ON "projects_disciplines" USING btree ("parent_id");
  CREATE INDEX "projects_hero_image_idx" ON "projects" USING btree ("hero_image_id");
  CREATE INDEX "projects_seo_seo_image_idx" ON "projects" USING btree ("seo_image_id");
  CREATE UNIQUE INDEX "projects_slug_idx" ON "projects" USING btree ("slug");
  CREATE UNIQUE INDEX "projects_reference_idx" ON "projects" USING btree ("reference");
  CREATE INDEX "projects_updated_at_idx" ON "projects" USING btree ("updated_at");
  CREATE INDEX "projects_created_at_idx" ON "projects" USING btree ("created_at");
  CREATE INDEX "projects__status_idx" ON "projects" USING btree ("_status");
  CREATE UNIQUE INDEX "projects_locales_locale_parent_id_unique" ON "projects_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "projects_locales_parent_id_idx" ON "projects_locales" USING btree ("_parent_id");
  CREATE INDEX "_projects_v_version_gallery_order_idx" ON "_projects_v_version_gallery" USING btree ("_order");
  CREATE INDEX "_projects_v_version_gallery_parent_id_idx" ON "_projects_v_version_gallery" USING btree ("_parent_id");
  CREATE INDEX "_projects_v_version_gallery_image_idx" ON "_projects_v_version_gallery" USING btree ("image_id");
  CREATE UNIQUE INDEX "_projects_v_version_gallery_locales_locale_parent_id_unique" ON "_projects_v_version_gallery_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_projects_v_version_gallery_locales_parent_id_idx" ON "_projects_v_version_gallery_locales" USING btree ("_parent_id");
  CREATE INDEX "_projects_v_version_work_order_idx" ON "_projects_v_version_work" USING btree ("_order");
  CREATE INDEX "_projects_v_version_work_parent_id_idx" ON "_projects_v_version_work" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "_projects_v_version_work_locales_locale_parent_id_unique" ON "_projects_v_version_work_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_projects_v_version_work_locales_parent_id_idx" ON "_projects_v_version_work_locales" USING btree ("_parent_id");
  CREATE INDEX "_projects_v_version_components_order_idx" ON "_projects_v_version_components" USING btree ("_order");
  CREATE INDEX "_projects_v_version_components_parent_id_idx" ON "_projects_v_version_components" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "_projects_v_version_components_locales_locale_parent_id_uniq" ON "_projects_v_version_components_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_projects_v_version_components_locales_parent_id_idx" ON "_projects_v_version_components_locales" USING btree ("_parent_id");
  CREATE INDEX "_projects_v_version_facts_order_idx" ON "_projects_v_version_facts" USING btree ("_order");
  CREATE INDEX "_projects_v_version_facts_parent_id_idx" ON "_projects_v_version_facts" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "_projects_v_version_facts_locales_locale_parent_id_unique" ON "_projects_v_version_facts_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_projects_v_version_facts_locales_parent_id_idx" ON "_projects_v_version_facts_locales" USING btree ("_parent_id");
  CREATE INDEX "_projects_v_version_disciplines_order_idx" ON "_projects_v_version_disciplines" USING btree ("order");
  CREATE INDEX "_projects_v_version_disciplines_parent_idx" ON "_projects_v_version_disciplines" USING btree ("parent_id");
  CREATE INDEX "_projects_v_parent_idx" ON "_projects_v" USING btree ("parent_id");
  CREATE INDEX "_projects_v_version_version_hero_image_idx" ON "_projects_v" USING btree ("version_hero_image_id");
  CREATE INDEX "_projects_v_version_seo_version_seo_image_idx" ON "_projects_v" USING btree ("version_seo_image_id");
  CREATE INDEX "_projects_v_version_version_slug_idx" ON "_projects_v" USING btree ("version_slug");
  CREATE INDEX "_projects_v_version_version_reference_idx" ON "_projects_v" USING btree ("version_reference");
  CREATE INDEX "_projects_v_version_version_updated_at_idx" ON "_projects_v" USING btree ("version_updated_at");
  CREATE INDEX "_projects_v_version_version_created_at_idx" ON "_projects_v" USING btree ("version_created_at");
  CREATE INDEX "_projects_v_version_version__status_idx" ON "_projects_v" USING btree ("version__status");
  CREATE INDEX "_projects_v_created_at_idx" ON "_projects_v" USING btree ("created_at");
  CREATE INDEX "_projects_v_updated_at_idx" ON "_projects_v" USING btree ("updated_at");
  CREATE INDEX "_projects_v_snapshot_idx" ON "_projects_v" USING btree ("snapshot");
  CREATE INDEX "_projects_v_published_locale_idx" ON "_projects_v" USING btree ("published_locale");
  CREATE INDEX "_projects_v_latest_idx" ON "_projects_v" USING btree ("latest");
  CREATE UNIQUE INDEX "_projects_v_locales_locale_parent_id_unique" ON "_projects_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_projects_v_locales_parent_id_idx" ON "_projects_v_locales" USING btree ("_parent_id");
  CREATE INDEX "services_capabilities_order_idx" ON "services_capabilities" USING btree ("_order");
  CREATE INDEX "services_capabilities_parent_id_idx" ON "services_capabilities" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "services_capabilities_locales_locale_parent_id_unique" ON "services_capabilities_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "services_capabilities_locales_parent_id_idx" ON "services_capabilities_locales" USING btree ("_parent_id");
  CREATE INDEX "services_deliverables_order_idx" ON "services_deliverables" USING btree ("_order");
  CREATE INDEX "services_deliverables_parent_id_idx" ON "services_deliverables" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "services_deliverables_locales_locale_parent_id_unique" ON "services_deliverables_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "services_deliverables_locales_parent_id_idx" ON "services_deliverables_locales" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "services_slug_idx" ON "services" USING btree ("slug");
  CREATE INDEX "services_updated_at_idx" ON "services" USING btree ("updated_at");
  CREATE INDEX "services_created_at_idx" ON "services" USING btree ("created_at");
  CREATE UNIQUE INDEX "services_locales_locale_parent_id_unique" ON "services_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "services_locales_parent_id_idx" ON "services_locales" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "pages_slug_idx" ON "pages" USING btree ("slug");
  CREATE INDEX "pages_seo_seo_image_idx" ON "pages" USING btree ("seo_image_id");
  CREATE INDEX "pages_updated_at_idx" ON "pages" USING btree ("updated_at");
  CREATE INDEX "pages_created_at_idx" ON "pages" USING btree ("created_at");
  CREATE INDEX "pages__status_idx" ON "pages" USING btree ("_status");
  CREATE UNIQUE INDEX "pages_locales_locale_parent_id_unique" ON "pages_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "pages_locales_parent_id_idx" ON "pages_locales" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_parent_idx" ON "_pages_v" USING btree ("parent_id");
  CREATE INDEX "_pages_v_version_version_slug_idx" ON "_pages_v" USING btree ("version_slug");
  CREATE INDEX "_pages_v_version_seo_version_seo_image_idx" ON "_pages_v" USING btree ("version_seo_image_id");
  CREATE INDEX "_pages_v_version_version_updated_at_idx" ON "_pages_v" USING btree ("version_updated_at");
  CREATE INDEX "_pages_v_version_version_created_at_idx" ON "_pages_v" USING btree ("version_created_at");
  CREATE INDEX "_pages_v_version_version__status_idx" ON "_pages_v" USING btree ("version__status");
  CREATE INDEX "_pages_v_created_at_idx" ON "_pages_v" USING btree ("created_at");
  CREATE INDEX "_pages_v_updated_at_idx" ON "_pages_v" USING btree ("updated_at");
  CREATE INDEX "_pages_v_snapshot_idx" ON "_pages_v" USING btree ("snapshot");
  CREATE INDEX "_pages_v_published_locale_idx" ON "_pages_v" USING btree ("published_locale");
  CREATE INDEX "_pages_v_latest_idx" ON "_pages_v" USING btree ("latest");
  CREATE UNIQUE INDEX "_pages_v_locales_locale_parent_id_unique" ON "_pages_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_pages_v_locales_parent_id_idx" ON "_pages_v_locales" USING btree ("_parent_id");
  CREATE INDEX "media_updated_at_idx" ON "media" USING btree ("updated_at");
  CREATE INDEX "media_created_at_idx" ON "media" USING btree ("created_at");
  CREATE UNIQUE INDEX "media_filename_idx" ON "media" USING btree ("filename");
  CREATE INDEX "media_sizes_thumb_sizes_thumb_filename_idx" ON "media" USING btree ("sizes_thumb_filename");
  CREATE INDEX "media_sizes_card_sizes_card_filename_idx" ON "media" USING btree ("sizes_card_filename");
  CREATE INDEX "media_sizes_plate_sizes_plate_filename_idx" ON "media" USING btree ("sizes_plate_filename");
  CREATE INDEX "media_sizes_wide_sizes_wide_filename_idx" ON "media" USING btree ("sizes_wide_filename");
  CREATE UNIQUE INDEX "media_locales_locale_parent_id_unique" ON "media_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "media_locales_parent_id_idx" ON "media_locales" USING btree ("_parent_id");
  CREATE INDEX "inquiries_scope_order_idx" ON "inquiries_scope" USING btree ("order");
  CREATE INDEX "inquiries_scope_parent_idx" ON "inquiries_scope" USING btree ("parent_id");
  CREATE INDEX "inquiries_updated_at_idx" ON "inquiries" USING btree ("updated_at");
  CREATE INDEX "inquiries_created_at_idx" ON "inquiries" USING btree ("created_at");
  CREATE INDEX "users_roles_order_idx" ON "users_roles" USING btree ("order");
  CREATE INDEX "users_roles_parent_idx" ON "users_roles" USING btree ("parent_id");
  CREATE INDEX "users_sessions_order_idx" ON "users_sessions" USING btree ("_order");
  CREATE INDEX "users_sessions_parent_id_idx" ON "users_sessions" USING btree ("_parent_id");
  CREATE INDEX "users_updated_at_idx" ON "users" USING btree ("updated_at");
  CREATE INDEX "users_created_at_idx" ON "users" USING btree ("created_at");
  CREATE UNIQUE INDEX "users_email_idx" ON "users" USING btree ("email");
  CREATE UNIQUE INDEX "payload_kv_key_idx" ON "payload_kv" USING btree ("key");
  CREATE INDEX "payload_locked_documents_global_slug_idx" ON "payload_locked_documents" USING btree ("global_slug");
  CREATE INDEX "payload_locked_documents_updated_at_idx" ON "payload_locked_documents" USING btree ("updated_at");
  CREATE INDEX "payload_locked_documents_created_at_idx" ON "payload_locked_documents" USING btree ("created_at");
  CREATE INDEX "payload_locked_documents_rels_order_idx" ON "payload_locked_documents_rels" USING btree ("order");
  CREATE INDEX "payload_locked_documents_rels_parent_idx" ON "payload_locked_documents_rels" USING btree ("parent_id");
  CREATE INDEX "payload_locked_documents_rels_path_idx" ON "payload_locked_documents_rels" USING btree ("path");
  CREATE INDEX "payload_locked_documents_rels_projects_id_idx" ON "payload_locked_documents_rels" USING btree ("projects_id");
  CREATE INDEX "payload_locked_documents_rels_services_id_idx" ON "payload_locked_documents_rels" USING btree ("services_id");
  CREATE INDEX "payload_locked_documents_rels_pages_id_idx" ON "payload_locked_documents_rels" USING btree ("pages_id");
  CREATE INDEX "payload_locked_documents_rels_media_id_idx" ON "payload_locked_documents_rels" USING btree ("media_id");
  CREATE INDEX "payload_locked_documents_rels_inquiries_id_idx" ON "payload_locked_documents_rels" USING btree ("inquiries_id");
  CREATE INDEX "payload_locked_documents_rels_users_id_idx" ON "payload_locked_documents_rels" USING btree ("users_id");
  CREATE INDEX "payload_preferences_key_idx" ON "payload_preferences" USING btree ("key");
  CREATE INDEX "payload_preferences_updated_at_idx" ON "payload_preferences" USING btree ("updated_at");
  CREATE INDEX "payload_preferences_created_at_idx" ON "payload_preferences" USING btree ("created_at");
  CREATE INDEX "payload_preferences_rels_order_idx" ON "payload_preferences_rels" USING btree ("order");
  CREATE INDEX "payload_preferences_rels_parent_idx" ON "payload_preferences_rels" USING btree ("parent_id");
  CREATE INDEX "payload_preferences_rels_path_idx" ON "payload_preferences_rels" USING btree ("path");
  CREATE INDEX "payload_preferences_rels_users_id_idx" ON "payload_preferences_rels" USING btree ("users_id");
  CREATE INDEX "payload_migrations_updated_at_idx" ON "payload_migrations" USING btree ("updated_at");
  CREATE INDEX "payload_migrations_created_at_idx" ON "payload_migrations" USING btree ("created_at");
  CREATE INDEX "home_hero_lines_order_idx" ON "home_hero_lines" USING btree ("_order");
  CREATE INDEX "home_hero_lines_parent_id_idx" ON "home_hero_lines" USING btree ("_parent_id");
  CREATE INDEX "home_hero_lines_locale_idx" ON "home_hero_lines" USING btree ("_locale");
  CREATE INDEX "home_process_steps_order_idx" ON "home_process_steps" USING btree ("_order");
  CREATE INDEX "home_process_steps_parent_id_idx" ON "home_process_steps" USING btree ("_parent_id");
  CREATE INDEX "home_process_steps_locale_idx" ON "home_process_steps" USING btree ("_locale");
  CREATE INDEX "home_why_points_order_idx" ON "home_why_points" USING btree ("_order");
  CREATE INDEX "home_why_points_parent_id_idx" ON "home_why_points" USING btree ("_parent_id");
  CREATE INDEX "home_why_points_locale_idx" ON "home_why_points" USING btree ("_locale");
  CREATE UNIQUE INDEX "home_locales_locale_parent_id_unique" ON "home_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "home_locales_parent_id_idx" ON "home_locales" USING btree ("_parent_id");
  CREATE INDEX "site_settings_links_order_idx" ON "site_settings_links" USING btree ("_order");
  CREATE INDEX "site_settings_links_parent_id_idx" ON "site_settings_links" USING btree ("_parent_id");
  CREATE INDEX "site_settings_og_image_idx" ON "site_settings" USING btree ("og_image_id");
  CREATE UNIQUE INDEX "site_settings_locales_locale_parent_id_unique" ON "site_settings_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "site_settings_locales_parent_id_idx" ON "site_settings_locales" USING btree ("_parent_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "projects_gallery" CASCADE;
  DROP TABLE "projects_gallery_locales" CASCADE;
  DROP TABLE "projects_work" CASCADE;
  DROP TABLE "projects_work_locales" CASCADE;
  DROP TABLE "projects_components" CASCADE;
  DROP TABLE "projects_components_locales" CASCADE;
  DROP TABLE "projects_facts" CASCADE;
  DROP TABLE "projects_facts_locales" CASCADE;
  DROP TABLE "projects_disciplines" CASCADE;
  DROP TABLE "projects" CASCADE;
  DROP TABLE "projects_locales" CASCADE;
  DROP TABLE "_projects_v_version_gallery" CASCADE;
  DROP TABLE "_projects_v_version_gallery_locales" CASCADE;
  DROP TABLE "_projects_v_version_work" CASCADE;
  DROP TABLE "_projects_v_version_work_locales" CASCADE;
  DROP TABLE "_projects_v_version_components" CASCADE;
  DROP TABLE "_projects_v_version_components_locales" CASCADE;
  DROP TABLE "_projects_v_version_facts" CASCADE;
  DROP TABLE "_projects_v_version_facts_locales" CASCADE;
  DROP TABLE "_projects_v_version_disciplines" CASCADE;
  DROP TABLE "_projects_v" CASCADE;
  DROP TABLE "_projects_v_locales" CASCADE;
  DROP TABLE "services_capabilities" CASCADE;
  DROP TABLE "services_capabilities_locales" CASCADE;
  DROP TABLE "services_deliverables" CASCADE;
  DROP TABLE "services_deliverables_locales" CASCADE;
  DROP TABLE "services" CASCADE;
  DROP TABLE "services_locales" CASCADE;
  DROP TABLE "pages" CASCADE;
  DROP TABLE "pages_locales" CASCADE;
  DROP TABLE "_pages_v" CASCADE;
  DROP TABLE "_pages_v_locales" CASCADE;
  DROP TABLE "media" CASCADE;
  DROP TABLE "media_locales" CASCADE;
  DROP TABLE "inquiries_scope" CASCADE;
  DROP TABLE "inquiries" CASCADE;
  DROP TABLE "users_roles" CASCADE;
  DROP TABLE "users_sessions" CASCADE;
  DROP TABLE "users" CASCADE;
  DROP TABLE "payload_kv" CASCADE;
  DROP TABLE "payload_locked_documents" CASCADE;
  DROP TABLE "payload_locked_documents_rels" CASCADE;
  DROP TABLE "payload_preferences" CASCADE;
  DROP TABLE "payload_preferences_rels" CASCADE;
  DROP TABLE "payload_migrations" CASCADE;
  DROP TABLE "home_hero_lines" CASCADE;
  DROP TABLE "home_process_steps" CASCADE;
  DROP TABLE "home_why_points" CASCADE;
  DROP TABLE "home" CASCADE;
  DROP TABLE "home_locales" CASCADE;
  DROP TABLE "site_settings_links" CASCADE;
  DROP TABLE "site_settings" CASCADE;
  DROP TABLE "site_settings_locales" CASCADE;
  DROP TYPE "public"."_locales";
  DROP TYPE "public"."enum_projects_work_discipline";
  DROP TYPE "public"."enum_projects_disciplines";
  DROP TYPE "public"."enum_projects_dev_status";
  DROP TYPE "public"."enum_projects_status";
  DROP TYPE "public"."enum__projects_v_version_work_discipline";
  DROP TYPE "public"."enum__projects_v_version_disciplines";
  DROP TYPE "public"."enum__projects_v_version_status";
  DROP TYPE "public"."enum__projects_v_published_locale";
  DROP TYPE "public"."enum_services_capabilities_delivery";
  DROP TYPE "public"."enum_pages_status";
  DROP TYPE "public"."enum__pages_v_version_status";
  DROP TYPE "public"."enum__pages_v_published_locale";
  DROP TYPE "public"."enum_media_kind";
  DROP TYPE "public"."enum_inquiries_scope";
  DROP TYPE "public"."enum_inquiries_stage";
  DROP TYPE "public"."enum_inquiries_timeline";
  DROP TYPE "public"."enum_inquiries_budget";
  DROP TYPE "public"."enum_inquiries_state";
  DROP TYPE "public"."enum_inquiries_notification";
  DROP TYPE "public"."enum_users_roles";`)
}
