import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_dhatus_padas" AS ENUM('P', 'A');
  CREATE TYPE "public"."enum_dhatus_overrides_scope" AS ENUM('tinanta', 'participle');
  CREATE TYPE "public"."enum_dhatus_overrides_lakara" AS ENUM('lat', 'lan', 'lrt', 'lot', 'vidhi', 'lit', 'lut', 'lun', 'ashir', 'lrn');
  CREATE TYPE "public"."enum_dhatus_overrides_pada" AS ENUM('P', 'A');
  CREATE TYPE "public"."enum_dhatus_overrides_label" AS ENUM('colloquial', 'classical', 'alternative', 'correction');
  CREATE TYPE "public"."enum_dhatus_preferred_pada" AS ENUM('P', 'A');
  CREATE TYPE "public"."enum_dhatus_status" AS ENUM('generated', 'checked', 'approved');
  CREATE TYPE "public"."enum__dhatus_v_version_padas" AS ENUM('P', 'A');
  CREATE TYPE "public"."enum__dhatus_v_version_overrides_scope" AS ENUM('tinanta', 'participle');
  CREATE TYPE "public"."enum__dhatus_v_version_overrides_lakara" AS ENUM('lat', 'lan', 'lrt', 'lot', 'vidhi', 'lit', 'lut', 'lun', 'ashir', 'lrn');
  CREATE TYPE "public"."enum__dhatus_v_version_overrides_pada" AS ENUM('P', 'A');
  CREATE TYPE "public"."enum__dhatus_v_version_overrides_label" AS ENUM('colloquial', 'classical', 'alternative', 'correction');
  CREATE TYPE "public"."enum__dhatus_v_version_preferred_pada" AS ENUM('P', 'A');
  CREATE TYPE "public"."enum__dhatus_v_version_status" AS ENUM('generated', 'checked', 'approved');
  CREATE TYPE "public"."enum_nouns_gender" AS ENUM('m', 'f', 'n');
  CREATE TYPE "public"."enum_nouns_kind" AS ENUM('noun', 'pronoun');
  CREATE TYPE "public"."enum_nouns_status" AS ENUM('generated', 'approved');
  CREATE TYPE "public"."enum_practice_decks_cards_person" AS ENUM('u', 'm', 'r', 'p');
  CREATE TYPE "public"."enum_practice_decks_cards_number" AS ENUM('0', '1', '2');
  CREATE TYPE "public"."enum_practice_decks_cards_gender" AS ENUM('m', 'f');
  CREATE TYPE "public"."enum_practice_decks_cards_lakara" AS ENUM('kta', 'lan', 'lat', 'lrt', 'lot', 'vidhi');
  CREATE TYPE "public"."enum_users_roles" AS ENUM('admin', 'editor', 'reviewer');
  CREATE TABLE "dhatus_padas" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_dhatus_padas",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "dhatus_overrides" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"scope" "enum_dhatus_overrides_scope" DEFAULT 'tinanta' NOT NULL,
  	"lakara" "enum_dhatus_overrides_lakara",
  	"pada" "enum_dhatus_overrides_pada",
  	"index" numeric,
  	"form" varchar,
  	"label" "enum_dhatus_overrides_label" NOT NULL,
  	"show_first" boolean DEFAULT true,
  	"note" varchar NOT NULL
  );
  
  CREATE TABLE "dhatus" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"root" varchar NOT NULL,
  	"display" varchar NOT NULL,
  	"meaning_en" varchar,
  	"slug" varchar NOT NULL,
  	"code" varchar NOT NULL,
  	"aupadeshika" varchar NOT NULL,
  	"gana" numeric NOT NULL,
  	"artha_sa" varchar,
  	"preferred_pada" "enum_dhatus_preferred_pada",
  	"featured" boolean DEFAULT false,
  	"irregular" boolean DEFAULT false,
  	"order" numeric,
  	"forms" jsonb,
  	"participle" jsonb,
  	"generated_with" varchar,
  	"gloss" varchar,
  	"status" "enum_dhatus_status" DEFAULT 'generated' NOT NULL,
  	"reviewed_by_id" integer,
  	"review_notes" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "dhatus_texts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "_dhatus_v_version_padas" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum__dhatus_v_version_padas",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "_dhatus_v_version_overrides" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"scope" "enum__dhatus_v_version_overrides_scope" DEFAULT 'tinanta' NOT NULL,
  	"lakara" "enum__dhatus_v_version_overrides_lakara",
  	"pada" "enum__dhatus_v_version_overrides_pada",
  	"index" numeric,
  	"form" varchar,
  	"label" "enum__dhatus_v_version_overrides_label" NOT NULL,
  	"show_first" boolean DEFAULT true,
  	"note" varchar NOT NULL,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_dhatus_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_root" varchar NOT NULL,
  	"version_display" varchar NOT NULL,
  	"version_meaning_en" varchar,
  	"version_slug" varchar NOT NULL,
  	"version_code" varchar NOT NULL,
  	"version_aupadeshika" varchar NOT NULL,
  	"version_gana" numeric NOT NULL,
  	"version_artha_sa" varchar,
  	"version_preferred_pada" "enum__dhatus_v_version_preferred_pada",
  	"version_featured" boolean DEFAULT false,
  	"version_irregular" boolean DEFAULT false,
  	"version_order" numeric,
  	"version_forms" jsonb,
  	"version_participle" jsonb,
  	"version_generated_with" varchar,
  	"version_gloss" varchar,
  	"version_status" "enum__dhatus_v_version_status" DEFAULT 'generated' NOT NULL,
  	"version_reviewed_by_id" integer,
  	"version_review_notes" varchar,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "_dhatus_v_texts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "nouns" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"display" varchar NOT NULL,
  	"stem_slp1" varchar NOT NULL,
  	"gender" "enum_nouns_gender" NOT NULL,
  	"kind" "enum_nouns_kind" DEFAULT 'noun',
  	"meaning_en" varchar,
  	"forms" jsonb,
  	"gloss" varchar,
  	"status" "enum_nouns_status" DEFAULT 'generated',
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "situations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"title_sa" varchar,
  	"order" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "phrases_words" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" varchar NOT NULL
  );
  
  CREATE TABLE "phrases" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"situation_id" integer NOT NULL,
  	"dhatu_id" integer NOT NULL,
  	"order" numeric,
  	"english_base" varchar NOT NULL,
  	"english_third" varchar NOT NULL,
  	"english_past" varchar NOT NULL,
  	"english_tail" varchar,
  	"note" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "practice_decks_cards" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"phrase_id" integer NOT NULL,
  	"person" "enum_practice_decks_cards_person" NOT NULL,
  	"number" "enum_practice_decks_cards_number" DEFAULT '0' NOT NULL,
  	"gender" "enum_practice_decks_cards_gender" DEFAULT 'm' NOT NULL,
  	"lakara" "enum_practice_decks_cards_lakara" NOT NULL
  );
  
  CREATE TABLE "practice_decks" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"is_default" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "examples" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"text" varchar NOT NULL,
  	"dhatu_id" integer NOT NULL,
  	"form" varchar,
  	"source" varchar,
  	"translation" varchar,
  	"url" varchar,
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
  	"dhatus_id" integer,
  	"nouns_id" integer,
  	"situations_id" integer,
  	"phrases_id" integer,
  	"practice_decks_id" integer,
  	"examples_id" integer,
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
  
  ALTER TABLE "dhatus_padas" ADD CONSTRAINT "dhatus_padas_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."dhatus"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "dhatus_overrides" ADD CONSTRAINT "dhatus_overrides_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."dhatus"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "dhatus" ADD CONSTRAINT "dhatus_reviewed_by_id_users_id_fk" FOREIGN KEY ("reviewed_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "dhatus_texts" ADD CONSTRAINT "dhatus_texts_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."dhatus"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_dhatus_v_version_padas" ADD CONSTRAINT "_dhatus_v_version_padas_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_dhatus_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_dhatus_v_version_overrides" ADD CONSTRAINT "_dhatus_v_version_overrides_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_dhatus_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_dhatus_v" ADD CONSTRAINT "_dhatus_v_parent_id_dhatus_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."dhatus"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_dhatus_v" ADD CONSTRAINT "_dhatus_v_version_reviewed_by_id_users_id_fk" FOREIGN KEY ("version_reviewed_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_dhatus_v_texts" ADD CONSTRAINT "_dhatus_v_texts_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_dhatus_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "phrases_words" ADD CONSTRAINT "phrases_words_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."phrases"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "phrases" ADD CONSTRAINT "phrases_situation_id_situations_id_fk" FOREIGN KEY ("situation_id") REFERENCES "public"."situations"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "phrases" ADD CONSTRAINT "phrases_dhatu_id_dhatus_id_fk" FOREIGN KEY ("dhatu_id") REFERENCES "public"."dhatus"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "practice_decks_cards" ADD CONSTRAINT "practice_decks_cards_phrase_id_phrases_id_fk" FOREIGN KEY ("phrase_id") REFERENCES "public"."phrases"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "practice_decks_cards" ADD CONSTRAINT "practice_decks_cards_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."practice_decks"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "examples" ADD CONSTRAINT "examples_dhatu_id_dhatus_id_fk" FOREIGN KEY ("dhatu_id") REFERENCES "public"."dhatus"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "users_roles" ADD CONSTRAINT "users_roles_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "users_sessions" ADD CONSTRAINT "users_sessions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_locked_documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_dhatus_fk" FOREIGN KEY ("dhatus_id") REFERENCES "public"."dhatus"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_nouns_fk" FOREIGN KEY ("nouns_id") REFERENCES "public"."nouns"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_situations_fk" FOREIGN KEY ("situations_id") REFERENCES "public"."situations"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_phrases_fk" FOREIGN KEY ("phrases_id") REFERENCES "public"."phrases"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_practice_decks_fk" FOREIGN KEY ("practice_decks_id") REFERENCES "public"."practice_decks"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_examples_fk" FOREIGN KEY ("examples_id") REFERENCES "public"."examples"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_preferences"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "dhatus_padas_order_idx" ON "dhatus_padas" USING btree ("order");
  CREATE INDEX "dhatus_padas_parent_idx" ON "dhatus_padas" USING btree ("parent_id");
  CREATE INDEX "dhatus_overrides_order_idx" ON "dhatus_overrides" USING btree ("_order");
  CREATE INDEX "dhatus_overrides_parent_id_idx" ON "dhatus_overrides" USING btree ("_parent_id");
  CREATE INDEX "dhatus_root_idx" ON "dhatus" USING btree ("root");
  CREATE UNIQUE INDEX "dhatus_slug_idx" ON "dhatus" USING btree ("slug");
  CREATE INDEX "dhatus_code_idx" ON "dhatus" USING btree ("code");
  CREATE INDEX "dhatus_reviewed_by_idx" ON "dhatus" USING btree ("reviewed_by_id");
  CREATE INDEX "dhatus_updated_at_idx" ON "dhatus" USING btree ("updated_at");
  CREATE INDEX "dhatus_created_at_idx" ON "dhatus" USING btree ("created_at");
  CREATE INDEX "dhatus_texts_order_parent" ON "dhatus_texts" USING btree ("order","parent_id");
  CREATE INDEX "_dhatus_v_version_padas_order_idx" ON "_dhatus_v_version_padas" USING btree ("order");
  CREATE INDEX "_dhatus_v_version_padas_parent_idx" ON "_dhatus_v_version_padas" USING btree ("parent_id");
  CREATE INDEX "_dhatus_v_version_overrides_order_idx" ON "_dhatus_v_version_overrides" USING btree ("_order");
  CREATE INDEX "_dhatus_v_version_overrides_parent_id_idx" ON "_dhatus_v_version_overrides" USING btree ("_parent_id");
  CREATE INDEX "_dhatus_v_parent_idx" ON "_dhatus_v" USING btree ("parent_id");
  CREATE INDEX "_dhatus_v_version_version_root_idx" ON "_dhatus_v" USING btree ("version_root");
  CREATE INDEX "_dhatus_v_version_version_slug_idx" ON "_dhatus_v" USING btree ("version_slug");
  CREATE INDEX "_dhatus_v_version_version_code_idx" ON "_dhatus_v" USING btree ("version_code");
  CREATE INDEX "_dhatus_v_version_version_reviewed_by_idx" ON "_dhatus_v" USING btree ("version_reviewed_by_id");
  CREATE INDEX "_dhatus_v_version_version_updated_at_idx" ON "_dhatus_v" USING btree ("version_updated_at");
  CREATE INDEX "_dhatus_v_version_version_created_at_idx" ON "_dhatus_v" USING btree ("version_created_at");
  CREATE INDEX "_dhatus_v_created_at_idx" ON "_dhatus_v" USING btree ("created_at");
  CREATE INDEX "_dhatus_v_updated_at_idx" ON "_dhatus_v" USING btree ("updated_at");
  CREATE INDEX "_dhatus_v_texts_order_parent" ON "_dhatus_v_texts" USING btree ("order","parent_id");
  CREATE INDEX "nouns_updated_at_idx" ON "nouns" USING btree ("updated_at");
  CREATE INDEX "nouns_created_at_idx" ON "nouns" USING btree ("created_at");
  CREATE INDEX "situations_updated_at_idx" ON "situations" USING btree ("updated_at");
  CREATE INDEX "situations_created_at_idx" ON "situations" USING btree ("created_at");
  CREATE INDEX "phrases_words_order_idx" ON "phrases_words" USING btree ("_order");
  CREATE INDEX "phrases_words_parent_id_idx" ON "phrases_words" USING btree ("_parent_id");
  CREATE INDEX "phrases_situation_idx" ON "phrases" USING btree ("situation_id");
  CREATE INDEX "phrases_dhatu_idx" ON "phrases" USING btree ("dhatu_id");
  CREATE INDEX "phrases_updated_at_idx" ON "phrases" USING btree ("updated_at");
  CREATE INDEX "phrases_created_at_idx" ON "phrases" USING btree ("created_at");
  CREATE INDEX "practice_decks_cards_order_idx" ON "practice_decks_cards" USING btree ("_order");
  CREATE INDEX "practice_decks_cards_parent_id_idx" ON "practice_decks_cards" USING btree ("_parent_id");
  CREATE INDEX "practice_decks_cards_phrase_idx" ON "practice_decks_cards" USING btree ("phrase_id");
  CREATE INDEX "practice_decks_updated_at_idx" ON "practice_decks" USING btree ("updated_at");
  CREATE INDEX "practice_decks_created_at_idx" ON "practice_decks" USING btree ("created_at");
  CREATE INDEX "examples_dhatu_idx" ON "examples" USING btree ("dhatu_id");
  CREATE INDEX "examples_updated_at_idx" ON "examples" USING btree ("updated_at");
  CREATE INDEX "examples_created_at_idx" ON "examples" USING btree ("created_at");
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
  CREATE INDEX "payload_locked_documents_rels_dhatus_id_idx" ON "payload_locked_documents_rels" USING btree ("dhatus_id");
  CREATE INDEX "payload_locked_documents_rels_nouns_id_idx" ON "payload_locked_documents_rels" USING btree ("nouns_id");
  CREATE INDEX "payload_locked_documents_rels_situations_id_idx" ON "payload_locked_documents_rels" USING btree ("situations_id");
  CREATE INDEX "payload_locked_documents_rels_phrases_id_idx" ON "payload_locked_documents_rels" USING btree ("phrases_id");
  CREATE INDEX "payload_locked_documents_rels_practice_decks_id_idx" ON "payload_locked_documents_rels" USING btree ("practice_decks_id");
  CREATE INDEX "payload_locked_documents_rels_examples_id_idx" ON "payload_locked_documents_rels" USING btree ("examples_id");
  CREATE INDEX "payload_locked_documents_rels_users_id_idx" ON "payload_locked_documents_rels" USING btree ("users_id");
  CREATE INDEX "payload_preferences_key_idx" ON "payload_preferences" USING btree ("key");
  CREATE INDEX "payload_preferences_updated_at_idx" ON "payload_preferences" USING btree ("updated_at");
  CREATE INDEX "payload_preferences_created_at_idx" ON "payload_preferences" USING btree ("created_at");
  CREATE INDEX "payload_preferences_rels_order_idx" ON "payload_preferences_rels" USING btree ("order");
  CREATE INDEX "payload_preferences_rels_parent_idx" ON "payload_preferences_rels" USING btree ("parent_id");
  CREATE INDEX "payload_preferences_rels_path_idx" ON "payload_preferences_rels" USING btree ("path");
  CREATE INDEX "payload_preferences_rels_users_id_idx" ON "payload_preferences_rels" USING btree ("users_id");
  CREATE INDEX "payload_migrations_updated_at_idx" ON "payload_migrations" USING btree ("updated_at");
  CREATE INDEX "payload_migrations_created_at_idx" ON "payload_migrations" USING btree ("created_at");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "dhatus_padas" CASCADE;
  DROP TABLE "dhatus_overrides" CASCADE;
  DROP TABLE "dhatus" CASCADE;
  DROP TABLE "dhatus_texts" CASCADE;
  DROP TABLE "_dhatus_v_version_padas" CASCADE;
  DROP TABLE "_dhatus_v_version_overrides" CASCADE;
  DROP TABLE "_dhatus_v" CASCADE;
  DROP TABLE "_dhatus_v_texts" CASCADE;
  DROP TABLE "nouns" CASCADE;
  DROP TABLE "situations" CASCADE;
  DROP TABLE "phrases_words" CASCADE;
  DROP TABLE "phrases" CASCADE;
  DROP TABLE "practice_decks_cards" CASCADE;
  DROP TABLE "practice_decks" CASCADE;
  DROP TABLE "examples" CASCADE;
  DROP TABLE "users_roles" CASCADE;
  DROP TABLE "users_sessions" CASCADE;
  DROP TABLE "users" CASCADE;
  DROP TABLE "payload_kv" CASCADE;
  DROP TABLE "payload_locked_documents" CASCADE;
  DROP TABLE "payload_locked_documents_rels" CASCADE;
  DROP TABLE "payload_preferences" CASCADE;
  DROP TABLE "payload_preferences_rels" CASCADE;
  DROP TABLE "payload_migrations" CASCADE;
  DROP TYPE "public"."enum_dhatus_padas";
  DROP TYPE "public"."enum_dhatus_overrides_scope";
  DROP TYPE "public"."enum_dhatus_overrides_lakara";
  DROP TYPE "public"."enum_dhatus_overrides_pada";
  DROP TYPE "public"."enum_dhatus_overrides_label";
  DROP TYPE "public"."enum_dhatus_preferred_pada";
  DROP TYPE "public"."enum_dhatus_status";
  DROP TYPE "public"."enum__dhatus_v_version_padas";
  DROP TYPE "public"."enum__dhatus_v_version_overrides_scope";
  DROP TYPE "public"."enum__dhatus_v_version_overrides_lakara";
  DROP TYPE "public"."enum__dhatus_v_version_overrides_pada";
  DROP TYPE "public"."enum__dhatus_v_version_overrides_label";
  DROP TYPE "public"."enum__dhatus_v_version_preferred_pada";
  DROP TYPE "public"."enum__dhatus_v_version_status";
  DROP TYPE "public"."enum_nouns_gender";
  DROP TYPE "public"."enum_nouns_kind";
  DROP TYPE "public"."enum_nouns_status";
  DROP TYPE "public"."enum_practice_decks_cards_person";
  DROP TYPE "public"."enum_practice_decks_cards_number";
  DROP TYPE "public"."enum_practice_decks_cards_gender";
  DROP TYPE "public"."enum_practice_decks_cards_lakara";
  DROP TYPE "public"."enum_users_roles";`)
}
