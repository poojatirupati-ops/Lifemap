import type { MigrateDownArgs, MigrateUpArgs } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(`
   CREATE SCHEMA IF NOT EXISTS "cms";
   CREATE TYPE "cms"."enum_videos_vimeo_status" AS ENUM('uploading', 'transcoding', 'ready', 'failed');
  CREATE TYPE "cms"."enum_videos_kind" AS ENUM('mortgage', 'pension', 'planner', 'protection', 'investment');
  CREATE TYPE "cms"."enum_videos_status" AS ENUM('draft', 'published');
  CREATE TYPE "cms"."enum__videos_v_version_vimeo_status" AS ENUM('uploading', 'transcoding', 'ready', 'failed');
  CREATE TYPE "cms"."enum__videos_v_version_kind" AS ENUM('mortgage', 'pension', 'planner', 'protection', 'investment');
  CREATE TYPE "cms"."enum__videos_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "cms"."enum_topics_expert" AS ENUM('mortgage', 'pension', 'planner', 'protection', 'investment');
  CREATE TYPE "cms"."enum_topics_status" AS ENUM('draft', 'published');
  CREATE TYPE "cms"."enum__topics_v_version_expert" AS ENUM('mortgage', 'pension', 'planner', 'protection', 'investment');
  CREATE TYPE "cms"."enum__topics_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "cms"."enum_explore_categories_status" AS ENUM('draft', 'published');
  CREATE TYPE "cms"."enum__explore_categories_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "cms"."enum_calculators_status" AS ENUM('draft', 'published');
  CREATE TYPE "cms"."enum__calculators_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "cms"."enum_live_sessions_expert" AS ENUM('mortgage', 'pension', 'planner', 'protection', 'investment');
  CREATE TYPE "cms"."enum_live_sessions_status" AS ENUM('draft', 'published');
  CREATE TYPE "cms"."enum__live_sessions_v_version_expert" AS ENUM('mortgage', 'pension', 'planner', 'protection', 'investment');
  CREATE TYPE "cms"."enum__live_sessions_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "cms"."enum_articles_kind" AS ENUM('article', 'faq', 'link');
  CREATE TYPE "cms"."enum_articles_status" AS ENUM('draft', 'published');
  CREATE TYPE "cms"."enum__articles_v_version_kind" AS ENUM('article', 'faq', 'link');
  CREATE TYPE "cms"."enum__articles_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "cms"."enum_journeys_status" AS ENUM('draft', 'published');
  CREATE TYPE "cms"."enum__journeys_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "cms"."enum_ask_answers_status" AS ENUM('draft', 'published');
  CREATE TYPE "cms"."enum__ask_answers_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "cms"."enum_personality_types_status" AS ENUM('draft', 'published');
  CREATE TYPE "cms"."enum__personality_types_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "cms"."enum_legal_pages_status" AS ENUM('draft', 'published');
  CREATE TYPE "cms"."enum__legal_pages_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "cms"."enum_payload_jobs_log_task_slug" AS ENUM('inline', 'vimeoPoll', 'schedulePublish');
  CREATE TYPE "cms"."enum_payload_jobs_log_state" AS ENUM('failed', 'succeeded');
  CREATE TYPE "cms"."enum_payload_jobs_task_slug" AS ENUM('inline', 'vimeoPoll', 'schedulePublish');
  CREATE TABLE "cms"."users_tenants" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"tenant_id" integer NOT NULL
  );
  
  CREATE TABLE "cms"."users_sessions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"created_at" timestamp(3) with time zone,
  	"expires_at" timestamp(3) with time zone NOT NULL
  );
  
  CREATE TABLE "cms"."users" (
  	"id" serial PRIMARY KEY NOT NULL,
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
  
  CREATE TABLE "cms"."media" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"tenant_id" integer,
  	"alt" varchar NOT NULL,
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
  	"focal_y" numeric
  );
  
  CREATE TABLE "cms"."tenants" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"slug" varchar NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "cms"."videos" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"tenant_id" integer,
  	"app_id" varchar,
  	"vimeo_status" "cms"."enum_videos_vimeo_status",
  	"title" varchar,
  	"kind" "cms"."enum_videos_kind",
  	"presenter" varchar,
  	"role" varchar,
  	"tool" varchar,
  	"art" varchar,
  	"vimeo_url" varchar,
  	"vimeo_id" varchar,
  	"thumbnail_url" varchar,
  	"duration" varchar,
  	"mins" numeric,
  	"caption" varchar,
  	"captions_id" integer,
  	"transcript" varchar,
  	"src" varchar,
  	"poster" varchar,
  	"topic_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "cms"."enum_videos_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "cms"."_videos_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_tenant_id" integer,
  	"version_app_id" varchar,
  	"version_vimeo_status" "cms"."enum__videos_v_version_vimeo_status",
  	"version_title" varchar,
  	"version_kind" "cms"."enum__videos_v_version_kind",
  	"version_presenter" varchar,
  	"version_role" varchar,
  	"version_tool" varchar,
  	"version_art" varchar,
  	"version_vimeo_url" varchar,
  	"version_vimeo_id" varchar,
  	"version_thumbnail_url" varchar,
  	"version_duration" varchar,
  	"version_mins" numeric,
  	"version_caption" varchar,
  	"version_captions_id" integer,
  	"version_transcript" varchar,
  	"version_src" varchar,
  	"version_poster" varchar,
  	"version_topic_id" integer,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "cms"."enum__videos_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE "cms"."topics" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"tenant_id" integer,
  	"name" varchar,
  	"emoji" varchar,
  	"blurb" varchar,
  	"expert" "cms"."enum_topics_expert",
  	"category_id" integer,
  	"art" varchar,
  	"photo_position" varchar,
  	"tagged_videos_only" boolean,
  	"order" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "cms"."enum_topics_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "cms"."topics_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"calculators_id" integer
  );
  
  CREATE TABLE "cms"."_topics_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_tenant_id" integer,
  	"version_name" varchar,
  	"version_emoji" varchar,
  	"version_blurb" varchar,
  	"version_expert" "cms"."enum__topics_v_version_expert",
  	"version_category_id" integer,
  	"version_art" varchar,
  	"version_photo_position" varchar,
  	"version_tagged_videos_only" boolean,
  	"version_order" numeric,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "cms"."enum__topics_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE "cms"."_topics_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"calculators_id" integer
  );
  
  CREATE TABLE "cms"."explore_categories" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"tenant_id" integer,
  	"app_id" varchar,
  	"name" varchar,
  	"emoji" varchar,
  	"color" varchar,
  	"blurb" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "cms"."enum_explore_categories_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "cms"."_explore_categories_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_tenant_id" integer,
  	"version_app_id" varchar,
  	"version_name" varchar,
  	"version_emoji" varchar,
  	"version_color" varchar,
  	"version_blurb" varchar,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "cms"."enum__explore_categories_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE "cms"."calculators" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"tenant_id" integer,
  	"app_id" varchar,
  	"name" varchar,
  	"question" varchar,
  	"emoji" varchar,
  	"category_id" integer,
  	"help" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "cms"."enum_calculators_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "cms"."_calculators_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_tenant_id" integer,
  	"version_app_id" varchar,
  	"version_name" varchar,
  	"version_question" varchar,
  	"version_emoji" varchar,
  	"version_category_id" integer,
  	"version_help" jsonb,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "cms"."enum__calculators_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE "cms"."live_sessions" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"tenant_id" integer,
  	"title" varchar,
  	"when" varchar,
  	"expert" "cms"."enum_live_sessions_expert",
  	"on_explore" boolean,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "cms"."enum_live_sessions_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "cms"."_live_sessions_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_tenant_id" integer,
  	"version_title" varchar,
  	"version_when" varchar,
  	"version_expert" "cms"."enum__live_sessions_v_version_expert",
  	"version_on_explore" boolean,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "cms"."enum__live_sessions_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE "cms"."articles" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"tenant_id" integer,
  	"title" varchar,
  	"kind" "cms"."enum_articles_kind",
  	"emoji" varchar,
  	"photo" varchar,
  	"url" varchar,
  	"body" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "cms"."enum_articles_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "cms"."_articles_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_tenant_id" integer,
  	"version_title" varchar,
  	"version_kind" "cms"."enum__articles_v_version_kind",
  	"version_emoji" varchar,
  	"version_photo" varchar,
  	"version_url" varchar,
  	"version_body" jsonb,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "cms"."enum__articles_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE "cms"."journeys_calculators" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"photo" varchar,
  	"tool_id" integer,
  	"emoji" varchar,
  	"name" varchar
  );
  
  CREATE TABLE "cms"."journeys_stories" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"short" varchar,
  	"title" varchar,
  	"duration" varchar,
  	"color" varchar,
  	"emoji" varchar,
  	"tool" varchar,
  	"photo" varchar,
  	"video_id" integer
  );
  
  CREATE TABLE "cms"."journeys" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"tenant_id" integer,
  	"name" varchar,
  	"topic_id" integer,
  	"order" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "cms"."enum_journeys_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "cms"."journeys_texts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "cms"."journeys_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"articles_id" integer,
  	"live_sessions_id" integer
  );
  
  CREATE TABLE "cms"."_journeys_v_version_calculators" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"photo" varchar,
  	"tool_id" integer,
  	"emoji" varchar,
  	"name" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "cms"."_journeys_v_version_stories" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"short" varchar,
  	"title" varchar,
  	"duration" varchar,
  	"color" varchar,
  	"emoji" varchar,
  	"tool" varchar,
  	"photo" varchar,
  	"video_id" integer,
  	"_uuid" varchar
  );
  
  CREATE TABLE "cms"."_journeys_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_tenant_id" integer,
  	"version_name" varchar,
  	"version_topic_id" integer,
  	"version_order" numeric,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "cms"."enum__journeys_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE "cms"."_journeys_v_texts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "cms"."_journeys_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"articles_id" integer,
  	"live_sessions_id" integer
  );
  
  CREATE TABLE "cms"."ask_answers" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"tenant_id" integer,
  	"key" varchar,
  	"question" varchar,
  	"answer" jsonb,
  	"order" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "cms"."enum_ask_answers_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "cms"."_ask_answers_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_tenant_id" integer,
  	"version_key" varchar,
  	"version_question" varchar,
  	"version_answer" jsonb,
  	"version_order" numeric,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "cms"."enum__ask_answers_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE "cms"."personality_types" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"tenant_id" integer,
  	"code" varchar,
  	"name" varchar,
  	"emoji" varchar,
  	"strapline" varchar,
  	"watch_out" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "cms"."enum_personality_types_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "cms"."personality_types_texts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "cms"."_personality_types_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_tenant_id" integer,
  	"version_code" varchar,
  	"version_name" varchar,
  	"version_emoji" varchar,
  	"version_strapline" varchar,
  	"version_watch_out" varchar,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "cms"."enum__personality_types_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE "cms"."_personality_types_v_texts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "cms"."legal_pages" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"tenant_id" integer,
  	"title" varchar,
  	"slug" varchar,
  	"version" varchar,
  	"body" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "cms"."enum_legal_pages_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "cms"."_legal_pages_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_tenant_id" integer,
  	"version_title" varchar,
  	"version_slug" varchar,
  	"version_version" varchar,
  	"version_body" jsonb,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "cms"."enum__legal_pages_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE "cms"."payload_kv" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar NOT NULL,
  	"data" jsonb NOT NULL
  );
  
  CREATE TABLE "cms"."payload_jobs_log" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"executed_at" timestamp(3) with time zone NOT NULL,
  	"completed_at" timestamp(3) with time zone NOT NULL,
  	"task_slug" "cms"."enum_payload_jobs_log_task_slug" NOT NULL,
  	"task_i_d" varchar NOT NULL,
  	"input" jsonb,
  	"output" jsonb,
  	"state" "cms"."enum_payload_jobs_log_state" NOT NULL,
  	"error" jsonb
  );
  
  CREATE TABLE "cms"."payload_jobs" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"input" jsonb,
  	"completed_at" timestamp(3) with time zone,
  	"total_tried" numeric DEFAULT 0,
  	"has_error" boolean DEFAULT false,
  	"error" jsonb,
  	"task_slug" "cms"."enum_payload_jobs_task_slug",
  	"queue" varchar DEFAULT 'default',
  	"wait_until" timestamp(3) with time zone,
  	"processing" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "cms"."payload_locked_documents" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"global_slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "cms"."payload_locked_documents_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer,
  	"media_id" integer,
  	"tenants_id" integer,
  	"videos_id" integer,
  	"topics_id" integer,
  	"explore_categories_id" integer,
  	"calculators_id" integer,
  	"live_sessions_id" integer,
  	"articles_id" integer,
  	"journeys_id" integer,
  	"ask_answers_id" integer,
  	"personality_types_id" integer,
  	"legal_pages_id" integer
  );
  
  CREATE TABLE "cms"."payload_preferences" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar,
  	"value" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "cms"."payload_preferences_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer
  );
  
  CREATE TABLE "cms"."payload_migrations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"batch" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "cms"."users_tenants" ADD CONSTRAINT "users_tenants_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "cms"."tenants"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "cms"."users_tenants" ADD CONSTRAINT "users_tenants_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "cms"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "cms"."users_sessions" ADD CONSTRAINT "users_sessions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "cms"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "cms"."media" ADD CONSTRAINT "media_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "cms"."tenants"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "cms"."videos" ADD CONSTRAINT "videos_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "cms"."tenants"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "cms"."videos" ADD CONSTRAINT "videos_captions_id_media_id_fk" FOREIGN KEY ("captions_id") REFERENCES "cms"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "cms"."videos" ADD CONSTRAINT "videos_topic_id_topics_id_fk" FOREIGN KEY ("topic_id") REFERENCES "cms"."topics"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "cms"."_videos_v" ADD CONSTRAINT "_videos_v_parent_id_videos_id_fk" FOREIGN KEY ("parent_id") REFERENCES "cms"."videos"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "cms"."_videos_v" ADD CONSTRAINT "_videos_v_version_tenant_id_tenants_id_fk" FOREIGN KEY ("version_tenant_id") REFERENCES "cms"."tenants"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "cms"."_videos_v" ADD CONSTRAINT "_videos_v_version_captions_id_media_id_fk" FOREIGN KEY ("version_captions_id") REFERENCES "cms"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "cms"."_videos_v" ADD CONSTRAINT "_videos_v_version_topic_id_topics_id_fk" FOREIGN KEY ("version_topic_id") REFERENCES "cms"."topics"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "cms"."topics" ADD CONSTRAINT "topics_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "cms"."tenants"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "cms"."topics" ADD CONSTRAINT "topics_category_id_explore_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "cms"."explore_categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "cms"."topics_rels" ADD CONSTRAINT "topics_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "cms"."topics"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "cms"."topics_rels" ADD CONSTRAINT "topics_rels_calculators_fk" FOREIGN KEY ("calculators_id") REFERENCES "cms"."calculators"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "cms"."_topics_v" ADD CONSTRAINT "_topics_v_parent_id_topics_id_fk" FOREIGN KEY ("parent_id") REFERENCES "cms"."topics"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "cms"."_topics_v" ADD CONSTRAINT "_topics_v_version_tenant_id_tenants_id_fk" FOREIGN KEY ("version_tenant_id") REFERENCES "cms"."tenants"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "cms"."_topics_v" ADD CONSTRAINT "_topics_v_version_category_id_explore_categories_id_fk" FOREIGN KEY ("version_category_id") REFERENCES "cms"."explore_categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "cms"."_topics_v_rels" ADD CONSTRAINT "_topics_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "cms"."_topics_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "cms"."_topics_v_rels" ADD CONSTRAINT "_topics_v_rels_calculators_fk" FOREIGN KEY ("calculators_id") REFERENCES "cms"."calculators"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "cms"."explore_categories" ADD CONSTRAINT "explore_categories_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "cms"."tenants"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "cms"."_explore_categories_v" ADD CONSTRAINT "_explore_categories_v_parent_id_explore_categories_id_fk" FOREIGN KEY ("parent_id") REFERENCES "cms"."explore_categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "cms"."_explore_categories_v" ADD CONSTRAINT "_explore_categories_v_version_tenant_id_tenants_id_fk" FOREIGN KEY ("version_tenant_id") REFERENCES "cms"."tenants"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "cms"."calculators" ADD CONSTRAINT "calculators_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "cms"."tenants"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "cms"."calculators" ADD CONSTRAINT "calculators_category_id_explore_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "cms"."explore_categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "cms"."_calculators_v" ADD CONSTRAINT "_calculators_v_parent_id_calculators_id_fk" FOREIGN KEY ("parent_id") REFERENCES "cms"."calculators"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "cms"."_calculators_v" ADD CONSTRAINT "_calculators_v_version_tenant_id_tenants_id_fk" FOREIGN KEY ("version_tenant_id") REFERENCES "cms"."tenants"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "cms"."_calculators_v" ADD CONSTRAINT "_calculators_v_version_category_id_explore_categories_id_fk" FOREIGN KEY ("version_category_id") REFERENCES "cms"."explore_categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "cms"."live_sessions" ADD CONSTRAINT "live_sessions_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "cms"."tenants"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "cms"."_live_sessions_v" ADD CONSTRAINT "_live_sessions_v_parent_id_live_sessions_id_fk" FOREIGN KEY ("parent_id") REFERENCES "cms"."live_sessions"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "cms"."_live_sessions_v" ADD CONSTRAINT "_live_sessions_v_version_tenant_id_tenants_id_fk" FOREIGN KEY ("version_tenant_id") REFERENCES "cms"."tenants"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "cms"."articles" ADD CONSTRAINT "articles_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "cms"."tenants"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "cms"."_articles_v" ADD CONSTRAINT "_articles_v_parent_id_articles_id_fk" FOREIGN KEY ("parent_id") REFERENCES "cms"."articles"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "cms"."_articles_v" ADD CONSTRAINT "_articles_v_version_tenant_id_tenants_id_fk" FOREIGN KEY ("version_tenant_id") REFERENCES "cms"."tenants"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "cms"."journeys_calculators" ADD CONSTRAINT "journeys_calculators_tool_id_calculators_id_fk" FOREIGN KEY ("tool_id") REFERENCES "cms"."calculators"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "cms"."journeys_calculators" ADD CONSTRAINT "journeys_calculators_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "cms"."journeys"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "cms"."journeys_stories" ADD CONSTRAINT "journeys_stories_video_id_videos_id_fk" FOREIGN KEY ("video_id") REFERENCES "cms"."videos"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "cms"."journeys_stories" ADD CONSTRAINT "journeys_stories_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "cms"."journeys"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "cms"."journeys" ADD CONSTRAINT "journeys_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "cms"."tenants"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "cms"."journeys" ADD CONSTRAINT "journeys_topic_id_topics_id_fk" FOREIGN KEY ("topic_id") REFERENCES "cms"."topics"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "cms"."journeys_texts" ADD CONSTRAINT "journeys_texts_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "cms"."journeys"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "cms"."journeys_rels" ADD CONSTRAINT "journeys_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "cms"."journeys"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "cms"."journeys_rels" ADD CONSTRAINT "journeys_rels_articles_fk" FOREIGN KEY ("articles_id") REFERENCES "cms"."articles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "cms"."journeys_rels" ADD CONSTRAINT "journeys_rels_live_sessions_fk" FOREIGN KEY ("live_sessions_id") REFERENCES "cms"."live_sessions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "cms"."_journeys_v_version_calculators" ADD CONSTRAINT "_journeys_v_version_calculators_tool_id_calculators_id_fk" FOREIGN KEY ("tool_id") REFERENCES "cms"."calculators"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "cms"."_journeys_v_version_calculators" ADD CONSTRAINT "_journeys_v_version_calculators_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "cms"."_journeys_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "cms"."_journeys_v_version_stories" ADD CONSTRAINT "_journeys_v_version_stories_video_id_videos_id_fk" FOREIGN KEY ("video_id") REFERENCES "cms"."videos"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "cms"."_journeys_v_version_stories" ADD CONSTRAINT "_journeys_v_version_stories_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "cms"."_journeys_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "cms"."_journeys_v" ADD CONSTRAINT "_journeys_v_parent_id_journeys_id_fk" FOREIGN KEY ("parent_id") REFERENCES "cms"."journeys"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "cms"."_journeys_v" ADD CONSTRAINT "_journeys_v_version_tenant_id_tenants_id_fk" FOREIGN KEY ("version_tenant_id") REFERENCES "cms"."tenants"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "cms"."_journeys_v" ADD CONSTRAINT "_journeys_v_version_topic_id_topics_id_fk" FOREIGN KEY ("version_topic_id") REFERENCES "cms"."topics"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "cms"."_journeys_v_texts" ADD CONSTRAINT "_journeys_v_texts_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "cms"."_journeys_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "cms"."_journeys_v_rels" ADD CONSTRAINT "_journeys_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "cms"."_journeys_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "cms"."_journeys_v_rels" ADD CONSTRAINT "_journeys_v_rels_articles_fk" FOREIGN KEY ("articles_id") REFERENCES "cms"."articles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "cms"."_journeys_v_rels" ADD CONSTRAINT "_journeys_v_rels_live_sessions_fk" FOREIGN KEY ("live_sessions_id") REFERENCES "cms"."live_sessions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "cms"."ask_answers" ADD CONSTRAINT "ask_answers_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "cms"."tenants"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "cms"."_ask_answers_v" ADD CONSTRAINT "_ask_answers_v_parent_id_ask_answers_id_fk" FOREIGN KEY ("parent_id") REFERENCES "cms"."ask_answers"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "cms"."_ask_answers_v" ADD CONSTRAINT "_ask_answers_v_version_tenant_id_tenants_id_fk" FOREIGN KEY ("version_tenant_id") REFERENCES "cms"."tenants"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "cms"."personality_types" ADD CONSTRAINT "personality_types_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "cms"."tenants"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "cms"."personality_types_texts" ADD CONSTRAINT "personality_types_texts_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "cms"."personality_types"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "cms"."_personality_types_v" ADD CONSTRAINT "_personality_types_v_parent_id_personality_types_id_fk" FOREIGN KEY ("parent_id") REFERENCES "cms"."personality_types"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "cms"."_personality_types_v" ADD CONSTRAINT "_personality_types_v_version_tenant_id_tenants_id_fk" FOREIGN KEY ("version_tenant_id") REFERENCES "cms"."tenants"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "cms"."_personality_types_v_texts" ADD CONSTRAINT "_personality_types_v_texts_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "cms"."_personality_types_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "cms"."legal_pages" ADD CONSTRAINT "legal_pages_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "cms"."tenants"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "cms"."_legal_pages_v" ADD CONSTRAINT "_legal_pages_v_parent_id_legal_pages_id_fk" FOREIGN KEY ("parent_id") REFERENCES "cms"."legal_pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "cms"."_legal_pages_v" ADD CONSTRAINT "_legal_pages_v_version_tenant_id_tenants_id_fk" FOREIGN KEY ("version_tenant_id") REFERENCES "cms"."tenants"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "cms"."payload_jobs_log" ADD CONSTRAINT "payload_jobs_log_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "cms"."payload_jobs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "cms"."payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "cms"."payload_locked_documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "cms"."payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "cms"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "cms"."payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "cms"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "cms"."payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_tenants_fk" FOREIGN KEY ("tenants_id") REFERENCES "cms"."tenants"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "cms"."payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_videos_fk" FOREIGN KEY ("videos_id") REFERENCES "cms"."videos"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "cms"."payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_topics_fk" FOREIGN KEY ("topics_id") REFERENCES "cms"."topics"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "cms"."payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_explore_categories_fk" FOREIGN KEY ("explore_categories_id") REFERENCES "cms"."explore_categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "cms"."payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_calculators_fk" FOREIGN KEY ("calculators_id") REFERENCES "cms"."calculators"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "cms"."payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_live_sessions_fk" FOREIGN KEY ("live_sessions_id") REFERENCES "cms"."live_sessions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "cms"."payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_articles_fk" FOREIGN KEY ("articles_id") REFERENCES "cms"."articles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "cms"."payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_journeys_fk" FOREIGN KEY ("journeys_id") REFERENCES "cms"."journeys"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "cms"."payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_ask_answers_fk" FOREIGN KEY ("ask_answers_id") REFERENCES "cms"."ask_answers"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "cms"."payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_personality_types_fk" FOREIGN KEY ("personality_types_id") REFERENCES "cms"."personality_types"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "cms"."payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_legal_pages_fk" FOREIGN KEY ("legal_pages_id") REFERENCES "cms"."legal_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "cms"."payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "cms"."payload_preferences"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "cms"."payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "cms"."users"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "users_tenants_order_idx" ON "cms"."users_tenants" USING btree ("_order");
  CREATE INDEX "users_tenants_parent_id_idx" ON "cms"."users_tenants" USING btree ("_parent_id");
  CREATE INDEX "users_tenants_tenant_idx" ON "cms"."users_tenants" USING btree ("tenant_id");
  CREATE INDEX "users_sessions_order_idx" ON "cms"."users_sessions" USING btree ("_order");
  CREATE INDEX "users_sessions_parent_id_idx" ON "cms"."users_sessions" USING btree ("_parent_id");
  CREATE INDEX "users_updated_at_idx" ON "cms"."users" USING btree ("updated_at");
  CREATE INDEX "users_created_at_idx" ON "cms"."users" USING btree ("created_at");
  CREATE UNIQUE INDEX "users_email_idx" ON "cms"."users" USING btree ("email");
  CREATE INDEX "media_tenant_idx" ON "cms"."media" USING btree ("tenant_id");
  CREATE INDEX "media_updated_at_idx" ON "cms"."media" USING btree ("updated_at");
  CREATE INDEX "media_created_at_idx" ON "cms"."media" USING btree ("created_at");
  CREATE UNIQUE INDEX "media_filename_idx" ON "cms"."media" USING btree ("filename");
  CREATE UNIQUE INDEX "tenants_slug_idx" ON "cms"."tenants" USING btree ("slug");
  CREATE INDEX "tenants_updated_at_idx" ON "cms"."tenants" USING btree ("updated_at");
  CREATE INDEX "tenants_created_at_idx" ON "cms"."tenants" USING btree ("created_at");
  CREATE INDEX "videos_tenant_idx" ON "cms"."videos" USING btree ("tenant_id");
  CREATE UNIQUE INDEX "videos_app_id_idx" ON "cms"."videos" USING btree ("app_id");
  CREATE INDEX "videos_captions_idx" ON "cms"."videos" USING btree ("captions_id");
  CREATE INDEX "videos_topic_idx" ON "cms"."videos" USING btree ("topic_id");
  CREATE INDEX "videos_updated_at_idx" ON "cms"."videos" USING btree ("updated_at");
  CREATE INDEX "videos_created_at_idx" ON "cms"."videos" USING btree ("created_at");
  CREATE INDEX "videos__status_idx" ON "cms"."videos" USING btree ("_status");
  CREATE INDEX "_videos_v_parent_idx" ON "cms"."_videos_v" USING btree ("parent_id");
  CREATE INDEX "_videos_v_version_version_tenant_idx" ON "cms"."_videos_v" USING btree ("version_tenant_id");
  CREATE INDEX "_videos_v_version_version_app_id_idx" ON "cms"."_videos_v" USING btree ("version_app_id");
  CREATE INDEX "_videos_v_version_version_captions_idx" ON "cms"."_videos_v" USING btree ("version_captions_id");
  CREATE INDEX "_videos_v_version_version_topic_idx" ON "cms"."_videos_v" USING btree ("version_topic_id");
  CREATE INDEX "_videos_v_version_version_updated_at_idx" ON "cms"."_videos_v" USING btree ("version_updated_at");
  CREATE INDEX "_videos_v_version_version_created_at_idx" ON "cms"."_videos_v" USING btree ("version_created_at");
  CREATE INDEX "_videos_v_version_version__status_idx" ON "cms"."_videos_v" USING btree ("version__status");
  CREATE INDEX "_videos_v_created_at_idx" ON "cms"."_videos_v" USING btree ("created_at");
  CREATE INDEX "_videos_v_updated_at_idx" ON "cms"."_videos_v" USING btree ("updated_at");
  CREATE INDEX "_videos_v_latest_idx" ON "cms"."_videos_v" USING btree ("latest");
  CREATE INDEX "topics_tenant_idx" ON "cms"."topics" USING btree ("tenant_id");
  CREATE UNIQUE INDEX "topics_name_idx" ON "cms"."topics" USING btree ("name");
  CREATE INDEX "topics_category_idx" ON "cms"."topics" USING btree ("category_id");
  CREATE INDEX "topics_updated_at_idx" ON "cms"."topics" USING btree ("updated_at");
  CREATE INDEX "topics_created_at_idx" ON "cms"."topics" USING btree ("created_at");
  CREATE INDEX "topics__status_idx" ON "cms"."topics" USING btree ("_status");
  CREATE INDEX "topics_rels_order_idx" ON "cms"."topics_rels" USING btree ("order");
  CREATE INDEX "topics_rels_parent_idx" ON "cms"."topics_rels" USING btree ("parent_id");
  CREATE INDEX "topics_rels_path_idx" ON "cms"."topics_rels" USING btree ("path");
  CREATE INDEX "topics_rels_calculators_id_idx" ON "cms"."topics_rels" USING btree ("calculators_id");
  CREATE INDEX "_topics_v_parent_idx" ON "cms"."_topics_v" USING btree ("parent_id");
  CREATE INDEX "_topics_v_version_version_tenant_idx" ON "cms"."_topics_v" USING btree ("version_tenant_id");
  CREATE INDEX "_topics_v_version_version_name_idx" ON "cms"."_topics_v" USING btree ("version_name");
  CREATE INDEX "_topics_v_version_version_category_idx" ON "cms"."_topics_v" USING btree ("version_category_id");
  CREATE INDEX "_topics_v_version_version_updated_at_idx" ON "cms"."_topics_v" USING btree ("version_updated_at");
  CREATE INDEX "_topics_v_version_version_created_at_idx" ON "cms"."_topics_v" USING btree ("version_created_at");
  CREATE INDEX "_topics_v_version_version__status_idx" ON "cms"."_topics_v" USING btree ("version__status");
  CREATE INDEX "_topics_v_created_at_idx" ON "cms"."_topics_v" USING btree ("created_at");
  CREATE INDEX "_topics_v_updated_at_idx" ON "cms"."_topics_v" USING btree ("updated_at");
  CREATE INDEX "_topics_v_latest_idx" ON "cms"."_topics_v" USING btree ("latest");
  CREATE INDEX "_topics_v_rels_order_idx" ON "cms"."_topics_v_rels" USING btree ("order");
  CREATE INDEX "_topics_v_rels_parent_idx" ON "cms"."_topics_v_rels" USING btree ("parent_id");
  CREATE INDEX "_topics_v_rels_path_idx" ON "cms"."_topics_v_rels" USING btree ("path");
  CREATE INDEX "_topics_v_rels_calculators_id_idx" ON "cms"."_topics_v_rels" USING btree ("calculators_id");
  CREATE INDEX "explore_categories_tenant_idx" ON "cms"."explore_categories" USING btree ("tenant_id");
  CREATE UNIQUE INDEX "explore_categories_app_id_idx" ON "cms"."explore_categories" USING btree ("app_id");
  CREATE INDEX "explore_categories_updated_at_idx" ON "cms"."explore_categories" USING btree ("updated_at");
  CREATE INDEX "explore_categories_created_at_idx" ON "cms"."explore_categories" USING btree ("created_at");
  CREATE INDEX "explore_categories__status_idx" ON "cms"."explore_categories" USING btree ("_status");
  CREATE INDEX "_explore_categories_v_parent_idx" ON "cms"."_explore_categories_v" USING btree ("parent_id");
  CREATE INDEX "_explore_categories_v_version_version_tenant_idx" ON "cms"."_explore_categories_v" USING btree ("version_tenant_id");
  CREATE INDEX "_explore_categories_v_version_version_app_id_idx" ON "cms"."_explore_categories_v" USING btree ("version_app_id");
  CREATE INDEX "_explore_categories_v_version_version_updated_at_idx" ON "cms"."_explore_categories_v" USING btree ("version_updated_at");
  CREATE INDEX "_explore_categories_v_version_version_created_at_idx" ON "cms"."_explore_categories_v" USING btree ("version_created_at");
  CREATE INDEX "_explore_categories_v_version_version__status_idx" ON "cms"."_explore_categories_v" USING btree ("version__status");
  CREATE INDEX "_explore_categories_v_created_at_idx" ON "cms"."_explore_categories_v" USING btree ("created_at");
  CREATE INDEX "_explore_categories_v_updated_at_idx" ON "cms"."_explore_categories_v" USING btree ("updated_at");
  CREATE INDEX "_explore_categories_v_latest_idx" ON "cms"."_explore_categories_v" USING btree ("latest");
  CREATE INDEX "calculators_tenant_idx" ON "cms"."calculators" USING btree ("tenant_id");
  CREATE UNIQUE INDEX "calculators_app_id_idx" ON "cms"."calculators" USING btree ("app_id");
  CREATE INDEX "calculators_category_idx" ON "cms"."calculators" USING btree ("category_id");
  CREATE INDEX "calculators_updated_at_idx" ON "cms"."calculators" USING btree ("updated_at");
  CREATE INDEX "calculators_created_at_idx" ON "cms"."calculators" USING btree ("created_at");
  CREATE INDEX "calculators__status_idx" ON "cms"."calculators" USING btree ("_status");
  CREATE INDEX "_calculators_v_parent_idx" ON "cms"."_calculators_v" USING btree ("parent_id");
  CREATE INDEX "_calculators_v_version_version_tenant_idx" ON "cms"."_calculators_v" USING btree ("version_tenant_id");
  CREATE INDEX "_calculators_v_version_version_app_id_idx" ON "cms"."_calculators_v" USING btree ("version_app_id");
  CREATE INDEX "_calculators_v_version_version_category_idx" ON "cms"."_calculators_v" USING btree ("version_category_id");
  CREATE INDEX "_calculators_v_version_version_updated_at_idx" ON "cms"."_calculators_v" USING btree ("version_updated_at");
  CREATE INDEX "_calculators_v_version_version_created_at_idx" ON "cms"."_calculators_v" USING btree ("version_created_at");
  CREATE INDEX "_calculators_v_version_version__status_idx" ON "cms"."_calculators_v" USING btree ("version__status");
  CREATE INDEX "_calculators_v_created_at_idx" ON "cms"."_calculators_v" USING btree ("created_at");
  CREATE INDEX "_calculators_v_updated_at_idx" ON "cms"."_calculators_v" USING btree ("updated_at");
  CREATE INDEX "_calculators_v_latest_idx" ON "cms"."_calculators_v" USING btree ("latest");
  CREATE INDEX "live_sessions_tenant_idx" ON "cms"."live_sessions" USING btree ("tenant_id");
  CREATE INDEX "live_sessions_updated_at_idx" ON "cms"."live_sessions" USING btree ("updated_at");
  CREATE INDEX "live_sessions_created_at_idx" ON "cms"."live_sessions" USING btree ("created_at");
  CREATE INDEX "live_sessions__status_idx" ON "cms"."live_sessions" USING btree ("_status");
  CREATE INDEX "_live_sessions_v_parent_idx" ON "cms"."_live_sessions_v" USING btree ("parent_id");
  CREATE INDEX "_live_sessions_v_version_version_tenant_idx" ON "cms"."_live_sessions_v" USING btree ("version_tenant_id");
  CREATE INDEX "_live_sessions_v_version_version_updated_at_idx" ON "cms"."_live_sessions_v" USING btree ("version_updated_at");
  CREATE INDEX "_live_sessions_v_version_version_created_at_idx" ON "cms"."_live_sessions_v" USING btree ("version_created_at");
  CREATE INDEX "_live_sessions_v_version_version__status_idx" ON "cms"."_live_sessions_v" USING btree ("version__status");
  CREATE INDEX "_live_sessions_v_created_at_idx" ON "cms"."_live_sessions_v" USING btree ("created_at");
  CREATE INDEX "_live_sessions_v_updated_at_idx" ON "cms"."_live_sessions_v" USING btree ("updated_at");
  CREATE INDEX "_live_sessions_v_latest_idx" ON "cms"."_live_sessions_v" USING btree ("latest");
  CREATE INDEX "articles_tenant_idx" ON "cms"."articles" USING btree ("tenant_id");
  CREATE INDEX "articles_updated_at_idx" ON "cms"."articles" USING btree ("updated_at");
  CREATE INDEX "articles_created_at_idx" ON "cms"."articles" USING btree ("created_at");
  CREATE INDEX "articles__status_idx" ON "cms"."articles" USING btree ("_status");
  CREATE INDEX "_articles_v_parent_idx" ON "cms"."_articles_v" USING btree ("parent_id");
  CREATE INDEX "_articles_v_version_version_tenant_idx" ON "cms"."_articles_v" USING btree ("version_tenant_id");
  CREATE INDEX "_articles_v_version_version_updated_at_idx" ON "cms"."_articles_v" USING btree ("version_updated_at");
  CREATE INDEX "_articles_v_version_version_created_at_idx" ON "cms"."_articles_v" USING btree ("version_created_at");
  CREATE INDEX "_articles_v_version_version__status_idx" ON "cms"."_articles_v" USING btree ("version__status");
  CREATE INDEX "_articles_v_created_at_idx" ON "cms"."_articles_v" USING btree ("created_at");
  CREATE INDEX "_articles_v_updated_at_idx" ON "cms"."_articles_v" USING btree ("updated_at");
  CREATE INDEX "_articles_v_latest_idx" ON "cms"."_articles_v" USING btree ("latest");
  CREATE INDEX "journeys_calculators_order_idx" ON "cms"."journeys_calculators" USING btree ("_order");
  CREATE INDEX "journeys_calculators_parent_id_idx" ON "cms"."journeys_calculators" USING btree ("_parent_id");
  CREATE INDEX "journeys_calculators_tool_idx" ON "cms"."journeys_calculators" USING btree ("tool_id");
  CREATE INDEX "journeys_stories_order_idx" ON "cms"."journeys_stories" USING btree ("_order");
  CREATE INDEX "journeys_stories_parent_id_idx" ON "cms"."journeys_stories" USING btree ("_parent_id");
  CREATE INDEX "journeys_stories_video_idx" ON "cms"."journeys_stories" USING btree ("video_id");
  CREATE INDEX "journeys_tenant_idx" ON "cms"."journeys" USING btree ("tenant_id");
  CREATE INDEX "journeys_topic_idx" ON "cms"."journeys" USING btree ("topic_id");
  CREATE INDEX "journeys_updated_at_idx" ON "cms"."journeys" USING btree ("updated_at");
  CREATE INDEX "journeys_created_at_idx" ON "cms"."journeys" USING btree ("created_at");
  CREATE INDEX "journeys__status_idx" ON "cms"."journeys" USING btree ("_status");
  CREATE INDEX "journeys_texts_order_parent" ON "cms"."journeys_texts" USING btree ("order","parent_id");
  CREATE INDEX "journeys_rels_order_idx" ON "cms"."journeys_rels" USING btree ("order");
  CREATE INDEX "journeys_rels_parent_idx" ON "cms"."journeys_rels" USING btree ("parent_id");
  CREATE INDEX "journeys_rels_path_idx" ON "cms"."journeys_rels" USING btree ("path");
  CREATE INDEX "journeys_rels_articles_id_idx" ON "cms"."journeys_rels" USING btree ("articles_id");
  CREATE INDEX "journeys_rels_live_sessions_id_idx" ON "cms"."journeys_rels" USING btree ("live_sessions_id");
  CREATE INDEX "_journeys_v_version_calculators_order_idx" ON "cms"."_journeys_v_version_calculators" USING btree ("_order");
  CREATE INDEX "_journeys_v_version_calculators_parent_id_idx" ON "cms"."_journeys_v_version_calculators" USING btree ("_parent_id");
  CREATE INDEX "_journeys_v_version_calculators_tool_idx" ON "cms"."_journeys_v_version_calculators" USING btree ("tool_id");
  CREATE INDEX "_journeys_v_version_stories_order_idx" ON "cms"."_journeys_v_version_stories" USING btree ("_order");
  CREATE INDEX "_journeys_v_version_stories_parent_id_idx" ON "cms"."_journeys_v_version_stories" USING btree ("_parent_id");
  CREATE INDEX "_journeys_v_version_stories_video_idx" ON "cms"."_journeys_v_version_stories" USING btree ("video_id");
  CREATE INDEX "_journeys_v_parent_idx" ON "cms"."_journeys_v" USING btree ("parent_id");
  CREATE INDEX "_journeys_v_version_version_tenant_idx" ON "cms"."_journeys_v" USING btree ("version_tenant_id");
  CREATE INDEX "_journeys_v_version_version_topic_idx" ON "cms"."_journeys_v" USING btree ("version_topic_id");
  CREATE INDEX "_journeys_v_version_version_updated_at_idx" ON "cms"."_journeys_v" USING btree ("version_updated_at");
  CREATE INDEX "_journeys_v_version_version_created_at_idx" ON "cms"."_journeys_v" USING btree ("version_created_at");
  CREATE INDEX "_journeys_v_version_version__status_idx" ON "cms"."_journeys_v" USING btree ("version__status");
  CREATE INDEX "_journeys_v_created_at_idx" ON "cms"."_journeys_v" USING btree ("created_at");
  CREATE INDEX "_journeys_v_updated_at_idx" ON "cms"."_journeys_v" USING btree ("updated_at");
  CREATE INDEX "_journeys_v_latest_idx" ON "cms"."_journeys_v" USING btree ("latest");
  CREATE INDEX "_journeys_v_texts_order_parent" ON "cms"."_journeys_v_texts" USING btree ("order","parent_id");
  CREATE INDEX "_journeys_v_rels_order_idx" ON "cms"."_journeys_v_rels" USING btree ("order");
  CREATE INDEX "_journeys_v_rels_parent_idx" ON "cms"."_journeys_v_rels" USING btree ("parent_id");
  CREATE INDEX "_journeys_v_rels_path_idx" ON "cms"."_journeys_v_rels" USING btree ("path");
  CREATE INDEX "_journeys_v_rels_articles_id_idx" ON "cms"."_journeys_v_rels" USING btree ("articles_id");
  CREATE INDEX "_journeys_v_rels_live_sessions_id_idx" ON "cms"."_journeys_v_rels" USING btree ("live_sessions_id");
  CREATE INDEX "ask_answers_tenant_idx" ON "cms"."ask_answers" USING btree ("tenant_id");
  CREATE UNIQUE INDEX "ask_answers_key_idx" ON "cms"."ask_answers" USING btree ("key");
  CREATE INDEX "ask_answers_updated_at_idx" ON "cms"."ask_answers" USING btree ("updated_at");
  CREATE INDEX "ask_answers_created_at_idx" ON "cms"."ask_answers" USING btree ("created_at");
  CREATE INDEX "ask_answers__status_idx" ON "cms"."ask_answers" USING btree ("_status");
  CREATE INDEX "_ask_answers_v_parent_idx" ON "cms"."_ask_answers_v" USING btree ("parent_id");
  CREATE INDEX "_ask_answers_v_version_version_tenant_idx" ON "cms"."_ask_answers_v" USING btree ("version_tenant_id");
  CREATE INDEX "_ask_answers_v_version_version_key_idx" ON "cms"."_ask_answers_v" USING btree ("version_key");
  CREATE INDEX "_ask_answers_v_version_version_updated_at_idx" ON "cms"."_ask_answers_v" USING btree ("version_updated_at");
  CREATE INDEX "_ask_answers_v_version_version_created_at_idx" ON "cms"."_ask_answers_v" USING btree ("version_created_at");
  CREATE INDEX "_ask_answers_v_version_version__status_idx" ON "cms"."_ask_answers_v" USING btree ("version__status");
  CREATE INDEX "_ask_answers_v_created_at_idx" ON "cms"."_ask_answers_v" USING btree ("created_at");
  CREATE INDEX "_ask_answers_v_updated_at_idx" ON "cms"."_ask_answers_v" USING btree ("updated_at");
  CREATE INDEX "_ask_answers_v_latest_idx" ON "cms"."_ask_answers_v" USING btree ("latest");
  CREATE INDEX "personality_types_tenant_idx" ON "cms"."personality_types" USING btree ("tenant_id");
  CREATE UNIQUE INDEX "personality_types_code_idx" ON "cms"."personality_types" USING btree ("code");
  CREATE INDEX "personality_types_updated_at_idx" ON "cms"."personality_types" USING btree ("updated_at");
  CREATE INDEX "personality_types_created_at_idx" ON "cms"."personality_types" USING btree ("created_at");
  CREATE INDEX "personality_types__status_idx" ON "cms"."personality_types" USING btree ("_status");
  CREATE INDEX "personality_types_texts_order_parent" ON "cms"."personality_types_texts" USING btree ("order","parent_id");
  CREATE INDEX "_personality_types_v_parent_idx" ON "cms"."_personality_types_v" USING btree ("parent_id");
  CREATE INDEX "_personality_types_v_version_version_tenant_idx" ON "cms"."_personality_types_v" USING btree ("version_tenant_id");
  CREATE INDEX "_personality_types_v_version_version_code_idx" ON "cms"."_personality_types_v" USING btree ("version_code");
  CREATE INDEX "_personality_types_v_version_version_updated_at_idx" ON "cms"."_personality_types_v" USING btree ("version_updated_at");
  CREATE INDEX "_personality_types_v_version_version_created_at_idx" ON "cms"."_personality_types_v" USING btree ("version_created_at");
  CREATE INDEX "_personality_types_v_version_version__status_idx" ON "cms"."_personality_types_v" USING btree ("version__status");
  CREATE INDEX "_personality_types_v_created_at_idx" ON "cms"."_personality_types_v" USING btree ("created_at");
  CREATE INDEX "_personality_types_v_updated_at_idx" ON "cms"."_personality_types_v" USING btree ("updated_at");
  CREATE INDEX "_personality_types_v_latest_idx" ON "cms"."_personality_types_v" USING btree ("latest");
  CREATE INDEX "_personality_types_v_texts_order_parent" ON "cms"."_personality_types_v_texts" USING btree ("order","parent_id");
  CREATE INDEX "legal_pages_tenant_idx" ON "cms"."legal_pages" USING btree ("tenant_id");
  CREATE INDEX "legal_pages_slug_idx" ON "cms"."legal_pages" USING btree ("slug");
  CREATE INDEX "legal_pages_updated_at_idx" ON "cms"."legal_pages" USING btree ("updated_at");
  CREATE INDEX "legal_pages_created_at_idx" ON "cms"."legal_pages" USING btree ("created_at");
  CREATE INDEX "legal_pages__status_idx" ON "cms"."legal_pages" USING btree ("_status");
  CREATE INDEX "_legal_pages_v_parent_idx" ON "cms"."_legal_pages_v" USING btree ("parent_id");
  CREATE INDEX "_legal_pages_v_version_version_tenant_idx" ON "cms"."_legal_pages_v" USING btree ("version_tenant_id");
  CREATE INDEX "_legal_pages_v_version_version_slug_idx" ON "cms"."_legal_pages_v" USING btree ("version_slug");
  CREATE INDEX "_legal_pages_v_version_version_updated_at_idx" ON "cms"."_legal_pages_v" USING btree ("version_updated_at");
  CREATE INDEX "_legal_pages_v_version_version_created_at_idx" ON "cms"."_legal_pages_v" USING btree ("version_created_at");
  CREATE INDEX "_legal_pages_v_version_version__status_idx" ON "cms"."_legal_pages_v" USING btree ("version__status");
  CREATE INDEX "_legal_pages_v_created_at_idx" ON "cms"."_legal_pages_v" USING btree ("created_at");
  CREATE INDEX "_legal_pages_v_updated_at_idx" ON "cms"."_legal_pages_v" USING btree ("updated_at");
  CREATE INDEX "_legal_pages_v_latest_idx" ON "cms"."_legal_pages_v" USING btree ("latest");
  CREATE UNIQUE INDEX "payload_kv_key_idx" ON "cms"."payload_kv" USING btree ("key");
  CREATE INDEX "payload_jobs_log_order_idx" ON "cms"."payload_jobs_log" USING btree ("_order");
  CREATE INDEX "payload_jobs_log_parent_id_idx" ON "cms"."payload_jobs_log" USING btree ("_parent_id");
  CREATE INDEX "payload_jobs_completed_at_idx" ON "cms"."payload_jobs" USING btree ("completed_at");
  CREATE INDEX "payload_jobs_total_tried_idx" ON "cms"."payload_jobs" USING btree ("total_tried");
  CREATE INDEX "payload_jobs_has_error_idx" ON "cms"."payload_jobs" USING btree ("has_error");
  CREATE INDEX "payload_jobs_task_slug_idx" ON "cms"."payload_jobs" USING btree ("task_slug");
  CREATE INDEX "payload_jobs_queue_idx" ON "cms"."payload_jobs" USING btree ("queue");
  CREATE INDEX "payload_jobs_wait_until_idx" ON "cms"."payload_jobs" USING btree ("wait_until");
  CREATE INDEX "payload_jobs_processing_idx" ON "cms"."payload_jobs" USING btree ("processing");
  CREATE INDEX "payload_jobs_updated_at_idx" ON "cms"."payload_jobs" USING btree ("updated_at");
  CREATE INDEX "payload_jobs_created_at_idx" ON "cms"."payload_jobs" USING btree ("created_at");
  CREATE INDEX "payload_locked_documents_global_slug_idx" ON "cms"."payload_locked_documents" USING btree ("global_slug");
  CREATE INDEX "payload_locked_documents_updated_at_idx" ON "cms"."payload_locked_documents" USING btree ("updated_at");
  CREATE INDEX "payload_locked_documents_created_at_idx" ON "cms"."payload_locked_documents" USING btree ("created_at");
  CREATE INDEX "payload_locked_documents_rels_order_idx" ON "cms"."payload_locked_documents_rels" USING btree ("order");
  CREATE INDEX "payload_locked_documents_rels_parent_idx" ON "cms"."payload_locked_documents_rels" USING btree ("parent_id");
  CREATE INDEX "payload_locked_documents_rels_path_idx" ON "cms"."payload_locked_documents_rels" USING btree ("path");
  CREATE INDEX "payload_locked_documents_rels_users_id_idx" ON "cms"."payload_locked_documents_rels" USING btree ("users_id");
  CREATE INDEX "payload_locked_documents_rels_media_id_idx" ON "cms"."payload_locked_documents_rels" USING btree ("media_id");
  CREATE INDEX "payload_locked_documents_rels_tenants_id_idx" ON "cms"."payload_locked_documents_rels" USING btree ("tenants_id");
  CREATE INDEX "payload_locked_documents_rels_videos_id_idx" ON "cms"."payload_locked_documents_rels" USING btree ("videos_id");
  CREATE INDEX "payload_locked_documents_rels_topics_id_idx" ON "cms"."payload_locked_documents_rels" USING btree ("topics_id");
  CREATE INDEX "payload_locked_documents_rels_explore_categories_id_idx" ON "cms"."payload_locked_documents_rels" USING btree ("explore_categories_id");
  CREATE INDEX "payload_locked_documents_rels_calculators_id_idx" ON "cms"."payload_locked_documents_rels" USING btree ("calculators_id");
  CREATE INDEX "payload_locked_documents_rels_live_sessions_id_idx" ON "cms"."payload_locked_documents_rels" USING btree ("live_sessions_id");
  CREATE INDEX "payload_locked_documents_rels_articles_id_idx" ON "cms"."payload_locked_documents_rels" USING btree ("articles_id");
  CREATE INDEX "payload_locked_documents_rels_journeys_id_idx" ON "cms"."payload_locked_documents_rels" USING btree ("journeys_id");
  CREATE INDEX "payload_locked_documents_rels_ask_answers_id_idx" ON "cms"."payload_locked_documents_rels" USING btree ("ask_answers_id");
  CREATE INDEX "payload_locked_documents_rels_personality_types_id_idx" ON "cms"."payload_locked_documents_rels" USING btree ("personality_types_id");
  CREATE INDEX "payload_locked_documents_rels_legal_pages_id_idx" ON "cms"."payload_locked_documents_rels" USING btree ("legal_pages_id");
  CREATE INDEX "payload_preferences_key_idx" ON "cms"."payload_preferences" USING btree ("key");
  CREATE INDEX "payload_preferences_updated_at_idx" ON "cms"."payload_preferences" USING btree ("updated_at");
  CREATE INDEX "payload_preferences_created_at_idx" ON "cms"."payload_preferences" USING btree ("created_at");
  CREATE INDEX "payload_preferences_rels_order_idx" ON "cms"."payload_preferences_rels" USING btree ("order");
  CREATE INDEX "payload_preferences_rels_parent_idx" ON "cms"."payload_preferences_rels" USING btree ("parent_id");
  CREATE INDEX "payload_preferences_rels_path_idx" ON "cms"."payload_preferences_rels" USING btree ("path");
  CREATE INDEX "payload_preferences_rels_users_id_idx" ON "cms"."payload_preferences_rels" USING btree ("users_id");
  CREATE INDEX "payload_migrations_updated_at_idx" ON "cms"."payload_migrations" USING btree ("updated_at");
  CREATE INDEX "payload_migrations_created_at_idx" ON "cms"."payload_migrations" USING btree ("created_at");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(`
   DROP TABLE "cms"."users_tenants" CASCADE;
  DROP TABLE "cms"."users_sessions" CASCADE;
  DROP TABLE "cms"."users" CASCADE;
  DROP TABLE "cms"."media" CASCADE;
  DROP TABLE "cms"."tenants" CASCADE;
  DROP TABLE "cms"."videos" CASCADE;
  DROP TABLE "cms"."_videos_v" CASCADE;
  DROP TABLE "cms"."topics" CASCADE;
  DROP TABLE "cms"."topics_rels" CASCADE;
  DROP TABLE "cms"."_topics_v" CASCADE;
  DROP TABLE "cms"."_topics_v_rels" CASCADE;
  DROP TABLE "cms"."explore_categories" CASCADE;
  DROP TABLE "cms"."_explore_categories_v" CASCADE;
  DROP TABLE "cms"."calculators" CASCADE;
  DROP TABLE "cms"."_calculators_v" CASCADE;
  DROP TABLE "cms"."live_sessions" CASCADE;
  DROP TABLE "cms"."_live_sessions_v" CASCADE;
  DROP TABLE "cms"."articles" CASCADE;
  DROP TABLE "cms"."_articles_v" CASCADE;
  DROP TABLE "cms"."journeys_calculators" CASCADE;
  DROP TABLE "cms"."journeys_stories" CASCADE;
  DROP TABLE "cms"."journeys" CASCADE;
  DROP TABLE "cms"."journeys_texts" CASCADE;
  DROP TABLE "cms"."journeys_rels" CASCADE;
  DROP TABLE "cms"."_journeys_v_version_calculators" CASCADE;
  DROP TABLE "cms"."_journeys_v_version_stories" CASCADE;
  DROP TABLE "cms"."_journeys_v" CASCADE;
  DROP TABLE "cms"."_journeys_v_texts" CASCADE;
  DROP TABLE "cms"."_journeys_v_rels" CASCADE;
  DROP TABLE "cms"."ask_answers" CASCADE;
  DROP TABLE "cms"."_ask_answers_v" CASCADE;
  DROP TABLE "cms"."personality_types" CASCADE;
  DROP TABLE "cms"."personality_types_texts" CASCADE;
  DROP TABLE "cms"."_personality_types_v" CASCADE;
  DROP TABLE "cms"."_personality_types_v_texts" CASCADE;
  DROP TABLE "cms"."legal_pages" CASCADE;
  DROP TABLE "cms"."_legal_pages_v" CASCADE;
  DROP TABLE "cms"."payload_kv" CASCADE;
  DROP TABLE "cms"."payload_jobs_log" CASCADE;
  DROP TABLE "cms"."payload_jobs" CASCADE;
  DROP TABLE "cms"."payload_locked_documents" CASCADE;
  DROP TABLE "cms"."payload_locked_documents_rels" CASCADE;
  DROP TABLE "cms"."payload_preferences" CASCADE;
  DROP TABLE "cms"."payload_preferences_rels" CASCADE;
  DROP TABLE "cms"."payload_migrations" CASCADE;
  DROP TYPE "cms"."enum_videos_vimeo_status";
  DROP TYPE "cms"."enum_videos_kind";
  DROP TYPE "cms"."enum_videos_status";
  DROP TYPE "cms"."enum__videos_v_version_vimeo_status";
  DROP TYPE "cms"."enum__videos_v_version_kind";
  DROP TYPE "cms"."enum__videos_v_version_status";
  DROP TYPE "cms"."enum_topics_expert";
  DROP TYPE "cms"."enum_topics_status";
  DROP TYPE "cms"."enum__topics_v_version_expert";
  DROP TYPE "cms"."enum__topics_v_version_status";
  DROP TYPE "cms"."enum_explore_categories_status";
  DROP TYPE "cms"."enum__explore_categories_v_version_status";
  DROP TYPE "cms"."enum_calculators_status";
  DROP TYPE "cms"."enum__calculators_v_version_status";
  DROP TYPE "cms"."enum_live_sessions_expert";
  DROP TYPE "cms"."enum_live_sessions_status";
  DROP TYPE "cms"."enum__live_sessions_v_version_expert";
  DROP TYPE "cms"."enum__live_sessions_v_version_status";
  DROP TYPE "cms"."enum_articles_kind";
  DROP TYPE "cms"."enum_articles_status";
  DROP TYPE "cms"."enum__articles_v_version_kind";
  DROP TYPE "cms"."enum__articles_v_version_status";
  DROP TYPE "cms"."enum_journeys_status";
  DROP TYPE "cms"."enum__journeys_v_version_status";
  DROP TYPE "cms"."enum_ask_answers_status";
  DROP TYPE "cms"."enum__ask_answers_v_version_status";
  DROP TYPE "cms"."enum_personality_types_status";
  DROP TYPE "cms"."enum__personality_types_v_version_status";
  DROP TYPE "cms"."enum_legal_pages_status";
  DROP TYPE "cms"."enum__legal_pages_v_version_status";
  DROP TYPE "cms"."enum_payload_jobs_log_task_slug";
  DROP TYPE "cms"."enum_payload_jobs_log_state";
  DROP TYPE "cms"."enum_payload_jobs_task_slug";`)
}
