-- Add isPremium field to memorial_pages
ALTER TABLE "memorial_pages" ADD COLUMN "is_premium" BOOLEAN NOT NULL DEFAULT false;

-- Create qr_code_batches table
CREATE TABLE "qr_code_batches" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "total_count" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "qr_code_batches_pkey" PRIMARY KEY ("id")
);

-- Create qr_code_plates table
CREATE TABLE "qr_code_plates" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'free',
    "batch_id" TEXT NOT NULL,
    "memorial_page_id" TEXT,
    "assigned_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "qr_code_plates_pkey" PRIMARY KEY ("id")
);

-- Unique constraints
CREATE UNIQUE INDEX "qr_code_plates_token_key" ON "qr_code_plates"("token");
CREATE UNIQUE INDEX "qr_code_plates_memorial_page_id_key" ON "qr_code_plates"("memorial_page_id");

-- Foreign keys
ALTER TABLE "qr_code_plates" ADD CONSTRAINT "qr_code_plates_batch_id_fkey"
    FOREIGN KEY ("batch_id") REFERENCES "qr_code_batches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "qr_code_plates" ADD CONSTRAINT "qr_code_plates_memorial_page_id_fkey"
    FOREIGN KEY ("memorial_page_id") REFERENCES "memorial_pages"("id") ON DELETE SET NULL ON UPDATE CASCADE;
