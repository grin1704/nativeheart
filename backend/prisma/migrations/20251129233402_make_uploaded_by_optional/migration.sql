-- DropForeignKey
ALTER TABLE "media_files" DROP CONSTRAINT "media_files_uploaded_by_fkey";

-- AlterTable
ALTER TABLE "media_files" ALTER COLUMN "uploaded_by" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "media_files" ADD CONSTRAINT "media_files_uploaded_by_fkey" FOREIGN KEY ("uploaded_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
