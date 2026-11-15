import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "examples" ADD COLUMN "licence" varchar;
  ALTER TABLE "examples" ADD COLUMN "reviewed" boolean DEFAULT false;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "examples" DROP COLUMN "licence";
  ALTER TABLE "examples" DROP COLUMN "reviewed";`)
}
