-- AlterTable
ALTER TABLE "tributes" ADD COLUMN     "likes_count" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "tribute_likes" (
    "id" TEXT NOT NULL,
    "tribute_id" TEXT NOT NULL,
    "user_id" TEXT,
    "fingerprint" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tribute_likes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tribute_likes_tribute_id_user_id_key" ON "tribute_likes"("tribute_id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "tribute_likes_tribute_id_fingerprint_key" ON "tribute_likes"("tribute_id", "fingerprint");

-- AddForeignKey
ALTER TABLE "tribute_likes" ADD CONSTRAINT "tribute_likes_tribute_id_fkey" FOREIGN KEY ("tribute_id") REFERENCES "tributes"("id") ON DELETE CASCADE ON UPDATE CASCADE;
