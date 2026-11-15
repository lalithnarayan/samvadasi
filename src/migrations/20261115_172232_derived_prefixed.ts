import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "dhatus" ADD COLUMN "meaning_te" varchar;
  ALTER TABLE "dhatus" ADD COLUMN "meaning_kn" varchar;
  ALTER TABLE "dhatus" ADD COLUMN "meaning_ta" varchar;
  ALTER TABLE "dhatus" ADD COLUMN "common_prefixed" boolean DEFAULT false;
  ALTER TABLE "dhatus" ADD COLUMN "derived" jsonb;
  ALTER TABLE "_dhatus_v" ADD COLUMN "version_meaning_te" varchar;
  ALTER TABLE "_dhatus_v" ADD COLUMN "version_meaning_kn" varchar;
  ALTER TABLE "_dhatus_v" ADD COLUMN "version_meaning_ta" varchar;
  ALTER TABLE "_dhatus_v" ADD COLUMN "version_common_prefixed" boolean DEFAULT false;
  ALTER TABLE "_dhatus_v" ADD COLUMN "version_derived" jsonb;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "dhatus" DROP COLUMN "meaning_te";
  ALTER TABLE "dhatus" DROP COLUMN "meaning_kn";
  ALTER TABLE "dhatus" DROP COLUMN "meaning_ta";
  ALTER TABLE "dhatus" DROP COLUMN "common_prefixed";
  ALTER TABLE "dhatus" DROP COLUMN "derived";
  ALTER TABLE "_dhatus_v" DROP COLUMN "version_meaning_te";
  ALTER TABLE "_dhatus_v" DROP COLUMN "version_meaning_kn";
  ALTER TABLE "_dhatus_v" DROP COLUMN "version_meaning_ta";
  ALTER TABLE "_dhatus_v" DROP COLUMN "version_common_prefixed";
  ALTER TABLE "_dhatus_v" DROP COLUMN "version_derived";`)
}
