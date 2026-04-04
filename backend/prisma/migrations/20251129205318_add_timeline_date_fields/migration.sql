/*
  Warnings:

  - A unique constraint covering the columns `[verification_token]` on the table `users` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[reset_token]` on the table `users` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[oauth_provider,oauth_id]` on the table `users` will be added. If there are existing duplicate values, this will fail.
  - Made the column `uploaded_by` on table `media_files` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "media_files" DROP CONSTRAINT "media_files_uploaded_by_fkey";

-- AlterTable
ALTER TABLE "media_files" ALTER COLUMN "uploaded_by" SET NOT NULL;

-- AlterTable
ALTER TABLE "timeline_events" ADD COLUMN     "day" INTEGER,
ADD COLUMN     "month" INTEGER;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "email_verified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "oauth_id" TEXT,
ADD COLUMN     "oauth_provider" TEXT,
ADD COLUMN     "reset_token" TEXT,
ADD COLUMN     "reset_token_expires" TIMESTAMP(3),
ADD COLUMN     "verification_expires" TIMESTAMP(3),
ADD COLUMN     "verification_token" TEXT,
ALTER COLUMN "password_hash" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "users_verification_token_key" ON "users"("verification_token");

-- CreateIndex
CREATE UNIQUE INDEX "users_reset_token_key" ON "users"("reset_token");

-- CreateIndex
CREATE UNIQUE INDEX "users_oauth_provider_oauth_id_key" ON "users"("oauth_provider", "oauth_id");

-- AddForeignKey
ALTER TABLE "media_files" ADD CONSTRAINT "media_files_uploaded_by_fkey" FOREIGN KEY ("uploaded_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
