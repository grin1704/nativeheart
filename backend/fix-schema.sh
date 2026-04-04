#!/bin/bash

# Скрипт для исправления schema.prisma после db pull

# Заменяем snake_case модели на PascalCase с @@map
sed -i.bak2 '
s/^model users {/model User {/
s/^model memorial_pages {/model MemorialPage {/
s/^model media_files {/model MediaFile {/
s/^model memories {/model Memory {/
s/^model tributes {/model Tribute {/
s/^model burial_locations {/model BurialLocation {/
s/^model collaborators {/model Collaborator {/
s/^model admin_users {/model AdminUser {/
s/^model admin_permissions {/model AdminPermission {/
s/^model admin_audit_logs {/model AdminAuditLog {/
s/^model system_settings {/model SystemSetting {/
s/^model content_moderation {/model ContentModeration {/
s/^model biography_photos {/model BiographyPhoto {/
s/^model photo_gallery {/model PhotoGallery {/
s/^model video_gallery {/model VideoGallery {/
s/^model memory_photos {/model MemoryPhoto {/
s/^model timeline_events {/model TimelineEvent {/
' prisma/schema.prisma

echo "Schema fixed! Now run: npx prisma generate"
