import * as dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY ?? process.env.SUPABASE_KEY;
const BUCKET_NAME = process.env.SUPABASE_BUCKET ?? 'Products';

const BACKUP_DIR = path.resolve(__dirname, '../../supabase_backup');
const IMAGES_DIR = path.join(BACKUP_DIR, 'images');

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_KEY / SUPABASE_KEY in backend/.env');
  console.log('Please ensure backend/.env has the required Supabase credentials before running this script.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

interface FileManifest {
  path: string;
  sizeBytes: number;
  sha256: string;
  downloadedAt: string;
  localRelativePath: string;
}

async function listAllFiles(bucket: string, prefix = ''): Promise<string[]> {
  const filePaths: string[] = [];
  let offset = 0;
  const limit = 100;

  while (true) {
    const { data, error } = await supabase.storage.from(bucket).list(prefix, {
      limit,
      offset,
      sortBy: { column: 'name', order: 'asc' },
    });

    if (error) {
      throw new Error(`Failed to list files in bucket "${bucket}" under prefix "${prefix}": ${error.message}`);
    }

    if (!data || data.length === 0) {
      break;
    }

    for (const item of data) {
      const fullPath = prefix ? `${prefix}/${item.name}` : item.name;
      // In Supabase storage, folders often have id === null or metadata === null
      if (item.id === null || !item.metadata) {
        // It's a directory, recurse into it
        const subFiles = await listAllFiles(bucket, fullPath);
        filePaths.push(...subFiles);
      } else {
        filePaths.push(fullPath);
      }
    }

    if (data.length < limit) {
      break;
    }
    offset += limit;
  }

  return filePaths;
}

async function main() {
  console.log('=====================================================');
  console.log('🛡️  SUPABASE STORAGE SAFE BACKUP SCRIPT');
  console.log('=====================================================');
  console.log(`Connecting to: ${SUPABASE_URL}`);
  console.log(`Target Bucket: ${BUCKET_NAME}`);
  console.log(`Local Backup : ${IMAGES_DIR}`);
  console.log('-----------------------------------------------------');

  // Ensure directories exist
  fs.mkdirSync(IMAGES_DIR, { recursive: true });

  console.log(`🔍 Scanning bucket "${BUCKET_NAME}" for all images/files...`);
  
  let files: string[] = [];
  let effectiveBucket = BUCKET_NAME;
  try {
    files = await listAllFiles(effectiveBucket);
  } catch (err: any) {
    // Try lowercase bucket if 'Products' fails
    if (BUCKET_NAME === 'Products') {
      console.log('Retrying with bucket "products" (lowercase)...');
      try {
        effectiveBucket = 'products';
        files = await listAllFiles(effectiveBucket);
      } catch (err2: any) {
        console.error('💥 Error scanning bucket:', err2.message);
        process.exit(1);
      }
    } else {
      console.error('💥 Error scanning bucket:', err.message);
      process.exit(1);
    }
  }

  if (files.length === 0) {
    console.log('⚠️  No files found in the bucket. Nothing to download.');
    return;
  }

  console.log(`📦 Found ${files.length} file(s) in Supabase Storage. Starting download...\n`);

  const manifest: FileManifest[] = [];
  let downloadedCount = 0;

  for (let i = 0; i < files.length; i++) {
    const filePath = files[i];
    const targetLocalPath = path.join(IMAGES_DIR, filePath);
    const targetLocalDir = path.dirname(targetLocalPath);

    fs.mkdirSync(targetLocalDir, { recursive: true });

    process.stdout.write(`[${i + 1}/${files.length}] Downloading: ${filePath} ... `);

    const { data, error } = await supabase.storage.from(effectiveBucket).download(filePath);

    if (error) {
      console.log(`❌ FAILED: ${error.message}`);
      continue;
    }

    if (!data) {
      console.log('❌ No data returned');
      continue;
    }

    const arrayBuffer = await data.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Calculate SHA256 checksum
    const sha256 = crypto.createHash('sha256').update(buffer).digest('hex');

    // Save to disk
    fs.writeFileSync(targetLocalPath, buffer);

    manifest.push({
      path: filePath,
      sizeBytes: buffer.length,
      sha256,
      downloadedAt: new Date().toISOString(),
      localRelativePath: path.relative(BACKUP_DIR, targetLocalPath),
    });

    downloadedCount++;
    console.log(`✅ OK (${(buffer.length / 1024).toFixed(1)} KB, sha: ${sha256.slice(0, 8)})`);
  }

  // Write manifest
  const manifestPath = path.join(BACKUP_DIR, 'manifest.json');
  fs.writeFileSync(manifestPath, JSON.stringify({
    bucket: effectiveBucket,
    totalFiles: manifest.length,
    backupCompletedAt: new Date().toISOString(),
    files: manifest,
  }, null, 2));

  console.log('\n=====================================================');
  console.log(`🎉 BACKUP COMPLETE!`);
  console.log(`📁 Downloaded: ${downloadedCount}/${files.length} files`);
  console.log(`📑 Manifest written to: ${manifestPath}`);
  console.log(`💾 All files safely preserved in: ${IMAGES_DIR}`);
  console.log('=====================================================');
}

main().catch((err) => {
  console.error('💥 Unhandled backup error:', err);
  process.exit(1);
});
