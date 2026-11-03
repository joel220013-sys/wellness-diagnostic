import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import fs from 'fs';
import path from 'path';

let cachedS3Client: S3Client | null = null;

function getEnvVar(key: string, defaultValue = ''): string {
  if (process.env[key]) {
    return process.env[key]!;
  }
  try {
    const envPath = path.resolve(process.cwd(), '.env.local');
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, 'utf8');
      for (const line of content.split(/\r?\n/)) {
        const trimmed = line.trim();
        if (trimmed.startsWith(`${key}=`)) {
          const raw = trimmed.slice(`${key}=`.length).trim();
          return raw.replace(/^["']|["']$/g, '');
        }
      }
    }
  } catch {}
  return defaultValue;
}

export function getR2Client(): S3Client | null {
  if (cachedS3Client) {
    return cachedS3Client;
  }

  const accountId = getEnvVar('R2_ACCOUNT_ID');
  const accessKeyId = getEnvVar('R2_ACCESS_KEY_ID');
  const secretAccessKey = getEnvVar('R2_SECRET_ACCESS_KEY');
  const endpoint = getEnvVar(
    'R2_ENDPOINT_URL',
    accountId ? `https://${accountId}.r2.cloudflarestorage.com` : ''
  );

  if (!accessKeyId || !secretAccessKey || !endpoint) {
    return null;
  }

  cachedS3Client = new S3Client({
    region: 'auto',
    endpoint,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  });

  return cachedS3Client;
}

export const R2_BUCKET_NAME = getEnvVar('R2_BUCKET_NAME', 'wellness-reports');

export async function uploadToR2(
  fileBuffer: Buffer,
  objectKey: string,
  contentType: string = 'application/pdf'
): Promise<string | null> {
  const client = getR2Client();
  if (!client) {
    console.error('[R2 Storage] Missing R2 credentials');
    return null;
  }

  try {
    await client.send(
      new PutObjectCommand({
        Bucket: R2_BUCKET_NAME,
        Key: objectKey,
        Body: fileBuffer,
        ContentType: contentType,
      })
    );

    return await getPresignedDownloadUrl(objectKey, 86400);
  } catch (err) {
    console.error(`[R2 Storage Error] Failed to upload ${objectKey}:`, err);
    return null;
  }
}

export async function getPresignedDownloadUrl(
  objectKey: string,
  expiresInSeconds = 86400,
  filename?: string
): Promise<string | null> {
  const client = getR2Client();
  if (!client) return null;

  try {
    const command = new GetObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: objectKey,
      ResponseContentDisposition: filename
        ? `attachment; filename="${filename}"`
        : undefined,
    });

    return await getSignedUrl(client, command, { expiresIn: expiresInSeconds });
  } catch (err) {
    console.error(`[R2 Storage Error] Failed to sign URL for ${objectKey}:`, err);
    return null;
  }
}
