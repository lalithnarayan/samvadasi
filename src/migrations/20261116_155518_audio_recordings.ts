import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "audio" ALTER COLUMN "url" DROP NOT NULL;
  ALTER TABLE "audio" ADD COLUMN "file" varchar;
  ALTER TABLE "audio" ADD COLUMN "mime" varchar;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "audio" ALTER COLUMN "url" SET NOT NULL;
  ALTER TABLE "audio" DROP COLUMN "file";
  ALTER TABLE "audio" DROP COLUMN "mime";`)
}
