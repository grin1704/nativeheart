-- DropIndex
DROP INDEX "video_gallery_memorial_page_id_media_file_id_key";

-- AlterTable
ALTER TABLE "video_gallery" ADD COLUMN     "embed_code" TEXT,
ADD COLUMN     "external_url" TEXT,
ADD COLUMN     "thumbnail_url" TEXT,
ADD COLUMN     "video_type" TEXT NOT NULL DEFAULT 'upload',
ALTER COLUMN "media_file_id" DROP NOT NULL;
