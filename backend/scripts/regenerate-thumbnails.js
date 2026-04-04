/**
 * Regenerate thumbnails for existing images
 * This script recreates all thumbnails with the new masonry-optimized dimensions
 * (fixed width 600px, proportional height)
 */

const { PrismaClient } = require('@prisma/client');
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');
const AWS = require('aws-sdk');

const prisma = new PrismaClient();

// Check if Yandex Cloud is configured
const isYandexCloudConfigured = !!(
  process.env.YANDEX_CLOUD_ACCESS_KEY_ID &&
  process.env.YANDEX_CLOUD_SECRET_ACCESS_KEY &&
  process.env.YANDEX_CLOUD_BUCKET_NAME
);

// Configure AWS SDK for Yandex Cloud
let s3 = null;
if (isYandexCloudConfigured) {
  s3 = new AWS.S3({
    endpoint: 'https://storage.yandexcloud.net',
    accessKeyId: process.env.YANDEX_CLOUD_ACCESS_KEY_ID,
    secretAccessKey: process.env.YANDEX_CLOUD_SECRET_ACCESS_KEY,
    region: process.env.YANDEX_CLOUD_REGION || 'ru-central1',
    s3ForcePathStyle: true,
    signatureVersion: 'v4'
  });
}

const THUMBNAIL_WIDTH = 600;
const BUCKET_NAME = process.env.YANDEX_CLOUD_BUCKET_NAME || 'memorial-pages-storage';
const UPLOADS_DIR = path.join(process.cwd(), 'uploads');

const allowedImageTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

async function regenerateThumbnailLocal(mediaFile) {
  try {
    console.log(`Processing local file: ${mediaFile.originalName}`);
    
    // Read original file
    const originalPath = path.join(UPLOADS_DIR, mediaFile.url.replace('/uploads/', ''));
    if (!fs.existsSync(originalPath)) {
      console.log(`  ⚠️  Original file not found: ${originalPath}`);
      return false;
    }

    const imageBuffer = fs.readFileSync(originalPath);
    
    // Get image metadata
    const metadata = await sharp(imageBuffer).metadata();
    console.log(`  📐 Original: ${metadata.width}x${metadata.height}`);

    // Generate new thumbnail with fixed width
    const thumbnailBuffer = await sharp(imageBuffer)
      .resize(THUMBNAIL_WIDTH, null, {
        fit: 'inside',
        withoutEnlargement: true
      })
      .jpeg({ quality: 85, progressive: true })
      .toBuffer();

    const thumbnailMetadata = await sharp(thumbnailBuffer).metadata();
    console.log(`  📐 Thumbnail: ${thumbnailMetadata.width}x${thumbnailMetadata.height}`);

    // Save thumbnail
    const fileId = mediaFile.id;
    const year = new Date(mediaFile.uploadedAt).getFullYear();
    const month = String(new Date(mediaFile.uploadedAt).getMonth() + 1).padStart(2, '0');
    const thumbnailFileName = `${fileId}_thumb.jpg`;
    const thumbnailPath = `thumbnails/${year}/${month}/${thumbnailFileName}`;
    const fullThumbnailPath = path.join(UPLOADS_DIR, thumbnailPath);

    // Ensure directory exists
    const thumbnailDir = path.dirname(fullThumbnailPath);
    if (!fs.existsSync(thumbnailDir)) {
      fs.mkdirSync(thumbnailDir, { recursive: true });
    }

    // Delete old thumbnail if exists
    if (mediaFile.thumbnailUrl) {
      const oldThumbnailPath = path.join(UPLOADS_DIR, mediaFile.thumbnailUrl.replace('/uploads/', ''));
      if (fs.existsSync(oldThumbnailPath)) {
        fs.unlinkSync(oldThumbnailPath);
        console.log(`  🗑️  Deleted old thumbnail`);
      }
    }

    // Write new thumbnail
    fs.writeFileSync(fullThumbnailPath, thumbnailBuffer);
    const thumbnailUrl = `/uploads/${thumbnailPath}`;

    // Update database
    await prisma.mediaFile.update({
      where: { id: mediaFile.id },
      data: { thumbnailUrl }
    });

    console.log(`  ✅ Thumbnail regenerated: ${thumbnailUrl}`);
    return true;
  } catch (error) {
    console.error(`  ❌ Error processing ${mediaFile.originalName}:`, error.message);
    return false;
  }
}

async function regenerateThumbnailCloud(mediaFile) {
  try {
    console.log(`Processing cloud file: ${mediaFile.originalName}`);
    
    // Extract file path from URL
    const urlParts = mediaFile.url.split('/');
    const bucketIndex = urlParts.findIndex(part => part === BUCKET_NAME);
    const filePath = urlParts.slice(bucketIndex + 1).join('/');

    // Download original file from cloud
    const getParams = {
      Bucket: BUCKET_NAME,
      Key: filePath
    };

    const data = await s3.getObject(getParams).promise();
    const imageBuffer = data.Body;

    // Get image metadata
    const metadata = await sharp(imageBuffer).metadata();
    console.log(`  📐 Original: ${metadata.width}x${metadata.height}`);

    // Generate new thumbnail with fixed width
    const thumbnailBuffer = await sharp(imageBuffer)
      .resize(THUMBNAIL_WIDTH, null, {
        fit: 'inside',
        withoutEnlargement: true
      })
      .jpeg({ quality: 85, progressive: true })
      .toBuffer();

    const thumbnailMetadata = await sharp(thumbnailBuffer).metadata();
    console.log(`  📐 Thumbnail: ${thumbnailMetadata.width}x${thumbnailMetadata.height}`);

    // Upload new thumbnail
    const fileId = mediaFile.id;
    const thumbnailFileName = `${fileId}_thumb.jpg`;
    const year = new Date(mediaFile.uploadedAt).getFullYear();
    const month = String(new Date(mediaFile.uploadedAt).getMonth() + 1).padStart(2, '0');
    const thumbnailPath = `thumbnails/${year}/${month}/${thumbnailFileName}`;

    // Delete old thumbnail if exists
    if (mediaFile.thumbnailUrl) {
      const oldUrlParts = mediaFile.thumbnailUrl.split('/');
      const oldBucketIndex = oldUrlParts.findIndex(part => part === BUCKET_NAME);
      const oldThumbnailPath = oldUrlParts.slice(oldBucketIndex + 1).join('/');
      
      try {
        await s3.deleteObject({
          Bucket: BUCKET_NAME,
          Key: oldThumbnailPath
        }).promise();
        console.log(`  🗑️  Deleted old thumbnail`);
      } catch (err) {
        console.log(`  ⚠️  Could not delete old thumbnail: ${err.message}`);
      }
    }

    // Upload new thumbnail
    const uploadParams = {
      Bucket: BUCKET_NAME,
      Key: thumbnailPath,
      Body: thumbnailBuffer,
      ContentType: 'image/jpeg',
      ACL: 'public-read'
    };

    const uploadResult = await s3.upload(uploadParams).promise();
    const thumbnailUrl = uploadResult.Location;

    // Update database
    await prisma.mediaFile.update({
      where: { id: mediaFile.id },
      data: { thumbnailUrl }
    });

    console.log(`  ✅ Thumbnail regenerated: ${thumbnailUrl}`);
    return true;
  } catch (error) {
    console.error(`  ❌ Error processing ${mediaFile.originalName}:`, error.message);
    return false;
  }
}

async function main() {
  console.log('🔄 Starting thumbnail regeneration...\n');
  console.log(`Storage mode: ${isYandexCloudConfigured ? 'Yandex Cloud' : 'Local'}`);
  console.log(`Thumbnail width: ${THUMBNAIL_WIDTH}px (proportional height)\n`);

  try {
    // Get all image files
    const imageFiles = await prisma.mediaFile.findMany({
      where: {
        mimeType: {
          in: allowedImageTypes
        }
      },
      orderBy: {
        uploadedAt: 'desc'
      }
    });

    console.log(`Found ${imageFiles.length} image files\n`);

    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < imageFiles.length; i++) {
      const file = imageFiles[i];
      console.log(`[${i + 1}/${imageFiles.length}] ${file.originalName}`);

      const success = isYandexCloudConfigured
        ? await regenerateThumbnailCloud(file)
        : await regenerateThumbnailLocal(file);

      if (success) {
        successCount++;
      } else {
        failCount++;
      }

      console.log('');
    }

    console.log('✨ Thumbnail regeneration complete!');
    console.log(`✅ Success: ${successCount}`);
    console.log(`❌ Failed: ${failCount}`);
    console.log(`📊 Total: ${imageFiles.length}`);

  } catch (error) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
