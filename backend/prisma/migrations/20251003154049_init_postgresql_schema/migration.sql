-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "subscription_type" TEXT NOT NULL DEFAULT 'trial',
    "subscription_expires_at" TIMESTAMP(3),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "memorial_pages" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "owner_id" TEXT NOT NULL,
    "full_name" TEXT NOT NULL,
    "birth_date" DATE NOT NULL,
    "death_date" DATE NOT NULL,
    "main_photo_id" TEXT,
    "biography_text" TEXT,
    "is_private" BOOLEAN NOT NULL DEFAULT false,
    "password_hash" TEXT,
    "qr_code_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "memorial_pages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "media_files" (
    "id" TEXT NOT NULL,
    "original_name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "thumbnail_url" TEXT,
    "size" INTEGER NOT NULL,
    "mime_type" TEXT NOT NULL,
    "uploaded_by" TEXT NOT NULL,
    "uploaded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "media_files_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "memories" (
    "id" TEXT NOT NULL,
    "memorial_page_id" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "memories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tributes" (
    "id" TEXT NOT NULL,
    "memorial_page_id" TEXT NOT NULL,
    "author_name" TEXT NOT NULL,
    "author_email" TEXT,
    "text" TEXT NOT NULL,
    "photo_id" TEXT,
    "is_approved" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tributes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "burial_locations" (
    "id" TEXT NOT NULL,
    "memorial_page_id" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "description" TEXT,
    "latitude" DECIMAL(10,8),
    "longitude" DECIMAL(11,8),
    "instructions" TEXT,

    CONSTRAINT "burial_locations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "collaborators" (
    "id" TEXT NOT NULL,
    "memorial_page_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "permissions" TEXT NOT NULL DEFAULT 'edit',
    "invited_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "accepted_at" TIMESTAMP(3),

    CONSTRAINT "collaborators_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "admin_users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'moderator',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_login" TIMESTAMP(3),

    CONSTRAINT "admin_users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "admin_permissions" (
    "id" TEXT NOT NULL,
    "admin_user_id" TEXT NOT NULL,
    "resource" TEXT NOT NULL,
    "actions" TEXT[],

    CONSTRAINT "admin_permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "system_settings" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" JSONB NOT NULL,
    "description" TEXT,
    "updated_by" TEXT,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "system_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "admin_audit_logs" (
    "id" TEXT NOT NULL,
    "admin_user_id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "resource_type" TEXT NOT NULL,
    "resource_id" TEXT,
    "details" JSONB,
    "ip_address" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "admin_audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "content_moderation" (
    "id" TEXT NOT NULL,
    "content_type" TEXT NOT NULL,
    "content_id" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "moderator_id" TEXT,
    "reason" TEXT,
    "moderated_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "content_moderation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "biography_photos" (
    "id" TEXT NOT NULL,
    "memorial_page_id" TEXT NOT NULL,
    "media_file_id" TEXT NOT NULL,
    "order_index" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "biography_photos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "photo_gallery" (
    "id" TEXT NOT NULL,
    "memorial_page_id" TEXT NOT NULL,
    "media_file_id" TEXT NOT NULL,
    "title" TEXT,
    "description" TEXT,
    "order_index" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "photo_gallery_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "video_gallery" (
    "id" TEXT NOT NULL,
    "memorial_page_id" TEXT NOT NULL,
    "media_file_id" TEXT NOT NULL,
    "title" TEXT,
    "description" TEXT,
    "order_index" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "video_gallery_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "memory_photos" (
    "id" TEXT NOT NULL,
    "memory_id" TEXT NOT NULL,
    "media_file_id" TEXT NOT NULL,
    "order_index" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "memory_photos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_PageMedia" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "memorial_pages_slug_key" ON "memorial_pages"("slug");

-- CreateIndex
CREATE INDEX "memories_memorial_page_id_idx" ON "memories"("memorial_page_id");

-- CreateIndex
CREATE UNIQUE INDEX "burial_locations_memorial_page_id_key" ON "burial_locations"("memorial_page_id");

-- CreateIndex
CREATE UNIQUE INDEX "admin_users_email_key" ON "admin_users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "system_settings_key_key" ON "system_settings"("key");

-- CreateIndex
CREATE INDEX "biography_photos_memorial_page_id_idx" ON "biography_photos"("memorial_page_id");

-- CreateIndex
CREATE UNIQUE INDEX "biography_photos_memorial_page_id_media_file_id_key" ON "biography_photos"("memorial_page_id", "media_file_id");

-- CreateIndex
CREATE INDEX "photo_gallery_memorial_page_id_idx" ON "photo_gallery"("memorial_page_id");

-- CreateIndex
CREATE UNIQUE INDEX "photo_gallery_memorial_page_id_media_file_id_key" ON "photo_gallery"("memorial_page_id", "media_file_id");

-- CreateIndex
CREATE INDEX "video_gallery_memorial_page_id_idx" ON "video_gallery"("memorial_page_id");

-- CreateIndex
CREATE UNIQUE INDEX "video_gallery_memorial_page_id_media_file_id_key" ON "video_gallery"("memorial_page_id", "media_file_id");

-- CreateIndex
CREATE INDEX "memory_photos_memory_id_idx" ON "memory_photos"("memory_id");

-- CreateIndex
CREATE UNIQUE INDEX "memory_photos_memory_id_media_file_id_key" ON "memory_photos"("memory_id", "media_file_id");

-- CreateIndex
CREATE UNIQUE INDEX "_PageMedia_AB_unique" ON "_PageMedia"("A", "B");

-- CreateIndex
CREATE INDEX "_PageMedia_B_index" ON "_PageMedia"("B");

-- AddForeignKey
ALTER TABLE "memorial_pages" ADD CONSTRAINT "memorial_pages_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "memorial_pages" ADD CONSTRAINT "memorial_pages_main_photo_id_fkey" FOREIGN KEY ("main_photo_id") REFERENCES "media_files"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "media_files" ADD CONSTRAINT "media_files_uploaded_by_fkey" FOREIGN KEY ("uploaded_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "memories" ADD CONSTRAINT "memories_memorial_page_id_fkey" FOREIGN KEY ("memorial_page_id") REFERENCES "memorial_pages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tributes" ADD CONSTRAINT "tributes_memorial_page_id_fkey" FOREIGN KEY ("memorial_page_id") REFERENCES "memorial_pages"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tributes" ADD CONSTRAINT "tributes_photo_id_fkey" FOREIGN KEY ("photo_id") REFERENCES "media_files"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "burial_locations" ADD CONSTRAINT "burial_locations_memorial_page_id_fkey" FOREIGN KEY ("memorial_page_id") REFERENCES "memorial_pages"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "collaborators" ADD CONSTRAINT "collaborators_memorial_page_id_fkey" FOREIGN KEY ("memorial_page_id") REFERENCES "memorial_pages"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "collaborators" ADD CONSTRAINT "collaborators_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "admin_permissions" ADD CONSTRAINT "admin_permissions_admin_user_id_fkey" FOREIGN KEY ("admin_user_id") REFERENCES "admin_users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "admin_audit_logs" ADD CONSTRAINT "admin_audit_logs_admin_user_id_fkey" FOREIGN KEY ("admin_user_id") REFERENCES "admin_users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "content_moderation" ADD CONSTRAINT "content_moderation_moderator_id_fkey" FOREIGN KEY ("moderator_id") REFERENCES "admin_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "biography_photos" ADD CONSTRAINT "biography_photos_memorial_page_id_fkey" FOREIGN KEY ("memorial_page_id") REFERENCES "memorial_pages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "biography_photos" ADD CONSTRAINT "biography_photos_media_file_id_fkey" FOREIGN KEY ("media_file_id") REFERENCES "media_files"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "photo_gallery" ADD CONSTRAINT "photo_gallery_memorial_page_id_fkey" FOREIGN KEY ("memorial_page_id") REFERENCES "memorial_pages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "photo_gallery" ADD CONSTRAINT "photo_gallery_media_file_id_fkey" FOREIGN KEY ("media_file_id") REFERENCES "media_files"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "video_gallery" ADD CONSTRAINT "video_gallery_memorial_page_id_fkey" FOREIGN KEY ("memorial_page_id") REFERENCES "memorial_pages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "video_gallery" ADD CONSTRAINT "video_gallery_media_file_id_fkey" FOREIGN KEY ("media_file_id") REFERENCES "media_files"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "memory_photos" ADD CONSTRAINT "memory_photos_memory_id_fkey" FOREIGN KEY ("memory_id") REFERENCES "memories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "memory_photos" ADD CONSTRAINT "memory_photos_media_file_id_fkey" FOREIGN KEY ("media_file_id") REFERENCES "media_files"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PageMedia" ADD CONSTRAINT "_PageMedia_A_fkey" FOREIGN KEY ("A") REFERENCES "media_files"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PageMedia" ADD CONSTRAINT "_PageMedia_B_fkey" FOREIGN KEY ("B") REFERENCES "memorial_pages"("id") ON DELETE CASCADE ON UPDATE CASCADE;
