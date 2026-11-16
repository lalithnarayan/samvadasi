import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_subhashitas_theme" AS ENUM('learning', 'effort', 'speech', 'kindness', 'friendship', 'life', 'world');
  CREATE TABLE "subhashitas" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"slug" varchar NOT NULL,
  	"theme" "enum_subhashitas_theme" NOT NULL,
  	"source" varchar,
  	"order" numeric,
  	"text" varchar NOT NULL,
  	"padaccheda" varchar,
  	"meaning_en" varchar NOT NULL,
  	"meaning_te" varchar,
  	"meaning_kn" varchar,
  	"meaning_ta" varchar,
  	"reviewed" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "subhashitas_id" integer;
  CREATE UNIQUE INDEX "subhashitas_slug_idx" ON "subhashitas" USING btree ("slug");
  CREATE INDEX "subhashitas_updated_at_idx" ON "subhashitas" USING btree ("updated_at");
  CREATE INDEX "subhashitas_created_at_idx" ON "subhashitas" USING btree ("created_at");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_subhashitas_fk" FOREIGN KEY ("subhashitas_id") REFERENCES "public"."subhashitas"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_subhashitas_id_idx" ON "payload_locked_documents_rels" USING btree ("subhashitas_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "subhashitas" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "subhashitas" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_subhashitas_fk";
  
  DROP INDEX "payload_locked_documents_rels_subhashitas_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "subhashitas_id";
  DROP TYPE "public"."enum_subhashitas_theme";`)
}
