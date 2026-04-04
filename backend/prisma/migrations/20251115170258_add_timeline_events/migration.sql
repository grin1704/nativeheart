-- CreateTable
CREATE TABLE "timeline_events" (
    "id" TEXT NOT NULL,
    "memorial_page_id" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "description" TEXT NOT NULL,
    "order_index" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "timeline_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "timeline_events_memorial_page_id_idx" ON "timeline_events"("memorial_page_id");

-- AddForeignKey
ALTER TABLE "timeline_events" ADD CONSTRAINT "timeline_events_memorial_page_id_fkey" FOREIGN KEY ("memorial_page_id") REFERENCES "memorial_pages"("id") ON DELETE CASCADE ON UPDATE CASCADE;
