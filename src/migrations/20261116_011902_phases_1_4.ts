import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_nouns_cat" AS ENUM('family', 'food', 'body', 'home', 'place', 'nature', 'time', 'people', 'study', 'travel', 'shop', 'life', 'pronoun');
  CREATE TYPE "public"."enum_avyayas_category" AS ENUM('question', 'place', 'time', 'join', 'manner', 'yesno');
  CREATE TYPE "public"."enum_greetings_kind" AS ENUM('greeting', 'name');
  CREATE TYPE "public"."enum_greetings_gender" AS ENUM('m', 'f');
  CREATE TYPE "public"."enum_audio_source" AS ENUM('recorded', 'machine');
  CREATE TABLE "avyayas" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"word" varchar NOT NULL,
  	"category" "enum_avyayas_category" NOT NULL,
  	"order" numeric,
  	"meaning_en" varchar NOT NULL,
  	"meaning_te" varchar,
  	"meaning_kn" varchar,
  	"meaning_ta" varchar,
  	"example" varchar,
  	"example_en" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "packs_words" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"sa" varchar NOT NULL,
  	"en" varchar NOT NULL,
  	"te" varchar,
  	"kn" varchar,
  	"ta" varchar,
  	"noun_id" integer
  );
  
  CREATE TABLE "packs" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"slug" varchar NOT NULL,
  	"title" varchar NOT NULL,
  	"title_sa" varchar,
  	"order" numeric,
  	"title_te" varchar,
  	"title_kn" varchar,
  	"title_ta" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "greetings" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"text" varchar NOT NULL,
  	"kind" "enum_greetings_kind" DEFAULT 'greeting' NOT NULL,
  	"gender" "enum_greetings_gender",
  	"reply" varchar,
  	"order" numeric,
  	"meaning_en" varchar NOT NULL,
  	"meaning_te" varchar,
  	"meaning_kn" varchar,
  	"meaning_ta" varchar,
  	"when_en" varchar,
  	"when_te" varchar,
  	"when_kn" varchar,
  	"when_ta" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "audio" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"text" varchar NOT NULL,
  	"url" varchar NOT NULL,
  	"speaker" varchar,
  	"source" "enum_audio_source" DEFAULT 'recorded',
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "phrases" ALTER COLUMN "situation_id" DROP NOT NULL;
  ALTER TABLE "dhatus" ADD COLUMN "krdanta" jsonb;
  ALTER TABLE "_dhatus_v" ADD COLUMN "version_krdanta" jsonb;
  ALTER TABLE "nouns" ADD COLUMN "order" numeric;
  ALTER TABLE "nouns" ADD COLUMN "slug" varchar;
  ALTER TABLE "nouns" ADD COLUMN "cat" "enum_nouns_cat";
  ALTER TABLE "nouns" ADD COLUMN "meaning_te" varchar;
  ALTER TABLE "nouns" ADD COLUMN "meaning_kn" varchar;
  ALTER TABLE "nouns" ADD COLUMN "meaning_ta" varchar;
  ALTER TABLE "phrases" ADD COLUMN "pack_id" integer;
  ALTER TABLE "phrases" ADD COLUMN "local" jsonb;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "avyayas_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "packs_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "greetings_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "audio_id" integer;
  ALTER TABLE "packs_words" ADD CONSTRAINT "packs_words_noun_id_nouns_id_fk" FOREIGN KEY ("noun_id") REFERENCES "public"."nouns"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "packs_words" ADD CONSTRAINT "packs_words_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."packs"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "avyayas_updated_at_idx" ON "avyayas" USING btree ("updated_at");
  CREATE INDEX "avyayas_created_at_idx" ON "avyayas" USING btree ("created_at");
  CREATE INDEX "packs_words_order_idx" ON "packs_words" USING btree ("_order");
  CREATE INDEX "packs_words_parent_id_idx" ON "packs_words" USING btree ("_parent_id");
  CREATE INDEX "packs_words_noun_idx" ON "packs_words" USING btree ("noun_id");
  CREATE UNIQUE INDEX "packs_slug_idx" ON "packs" USING btree ("slug");
  CREATE INDEX "packs_updated_at_idx" ON "packs" USING btree ("updated_at");
  CREATE INDEX "packs_created_at_idx" ON "packs" USING btree ("created_at");
  CREATE INDEX "greetings_updated_at_idx" ON "greetings" USING btree ("updated_at");
  CREATE INDEX "greetings_created_at_idx" ON "greetings" USING btree ("created_at");
  CREATE UNIQUE INDEX "audio_text_idx" ON "audio" USING btree ("text");
  CREATE INDEX "audio_updated_at_idx" ON "audio" USING btree ("updated_at");
  CREATE INDEX "audio_created_at_idx" ON "audio" USING btree ("created_at");
  ALTER TABLE "phrases" ADD CONSTRAINT "phrases_pack_id_packs_id_fk" FOREIGN KEY ("pack_id") REFERENCES "public"."packs"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_avyayas_fk" FOREIGN KEY ("avyayas_id") REFERENCES "public"."avyayas"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_packs_fk" FOREIGN KEY ("packs_id") REFERENCES "public"."packs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_greetings_fk" FOREIGN KEY ("greetings_id") REFERENCES "public"."greetings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_audio_fk" FOREIGN KEY ("audio_id") REFERENCES "public"."audio"("id") ON DELETE cascade ON UPDATE no action;
  CREATE UNIQUE INDEX "nouns_slug_idx" ON "nouns" USING btree ("slug");
  CREATE INDEX "phrases_pack_idx" ON "phrases" USING btree ("pack_id");
  CREATE INDEX "payload_locked_documents_rels_avyayas_id_idx" ON "payload_locked_documents_rels" USING btree ("avyayas_id");
  CREATE INDEX "payload_locked_documents_rels_packs_id_idx" ON "payload_locked_documents_rels" USING btree ("packs_id");
  CREATE INDEX "payload_locked_documents_rels_greetings_id_idx" ON "payload_locked_documents_rels" USING btree ("greetings_id");
  CREATE INDEX "payload_locked_documents_rels_audio_id_idx" ON "payload_locked_documents_rels" USING btree ("audio_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "avyayas" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "packs_words" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "packs" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "greetings" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "audio" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "avyayas" CASCADE;
  DROP TABLE "packs_words" CASCADE;
  DROP TABLE "packs" CASCADE;
  DROP TABLE "greetings" CASCADE;
  DROP TABLE "audio" CASCADE;
  ALTER TABLE "phrases" DROP CONSTRAINT "phrases_pack_id_packs_id_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_avyayas_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_packs_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_greetings_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_audio_fk";
  
  DROP INDEX "nouns_slug_idx";
  DROP INDEX "phrases_pack_idx";
  DROP INDEX "payload_locked_documents_rels_avyayas_id_idx";
  DROP INDEX "payload_locked_documents_rels_packs_id_idx";
  DROP INDEX "payload_locked_documents_rels_greetings_id_idx";
  DROP INDEX "payload_locked_documents_rels_audio_id_idx";
  ALTER TABLE "phrases" ALTER COLUMN "situation_id" SET NOT NULL;
  ALTER TABLE "dhatus" DROP COLUMN "krdanta";
  ALTER TABLE "_dhatus_v" DROP COLUMN "version_krdanta";
  ALTER TABLE "nouns" DROP COLUMN "order";
  ALTER TABLE "nouns" DROP COLUMN "slug";
  ALTER TABLE "nouns" DROP COLUMN "cat";
  ALTER TABLE "nouns" DROP COLUMN "meaning_te";
  ALTER TABLE "nouns" DROP COLUMN "meaning_kn";
  ALTER TABLE "nouns" DROP COLUMN "meaning_ta";
  ALTER TABLE "phrases" DROP COLUMN "pack_id";
  ALTER TABLE "phrases" DROP COLUMN "local";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "avyayas_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "packs_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "greetings_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "audio_id";
  DROP TYPE "public"."enum_nouns_cat";
  DROP TYPE "public"."enum_avyayas_category";
  DROP TYPE "public"."enum_greetings_kind";
  DROP TYPE "public"."enum_greetings_gender";
  DROP TYPE "public"."enum_audio_source";`)
}
