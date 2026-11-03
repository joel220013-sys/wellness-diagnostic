import { Pool } from 'pg';
import fs from 'fs';
import path from 'path';

let cachedPool: Pool | null = null;

function getDatabaseUrl(): string {
  const envKeys = [
    'DATABASE_URL',
    'POSTGRES_URL',
    'POSTGRES_PRISMA_URL',
    'POSTGRES_URL_NON_POOLING',
    'SUPABASE_DB_URL',
  ];

  for (const k of envKeys) {
    if (process.env[k]) {
      return process.env[k]!;
    }
  }

  // Fallback to reading .env.local if running in local dev or standalone
  try {
    const envPath = path.resolve(process.cwd(), '.env.local');
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, 'utf8');
      for (const line of content.split(/\r?\n/)) {
        const trimmed = line.trim();
        for (const k of envKeys) {
          if (trimmed.startsWith(`${k}=`)) {
            const raw = trimmed.slice(`${k}=`.length).trim();
            return raw.replace(/^["']|["']$/g, '');
          }
        }
      }
    }
  } catch {}

  return '';
}

export function getDbPool(): Pool {
  if (!cachedPool) {
    const dbUrl = getDatabaseUrl();
    if (!dbUrl) {
      throw new Error('DATABASE_URL is not set in environment or .env.local');
    }

    cachedPool = new Pool({
      connectionString: dbUrl,
      ssl: {
        rejectUnauthorized: false,
      },
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 8000,
    });

    cachedPool.on('error', (err) => {
      console.error('[PostgreSQL Pool Unexpected Error]', err);
    });
  }

  return cachedPool;
}

export async function queryDb<T = any>(text: string, params: any[] = []): Promise<T[]> {
  const pool = getDbPool();
  const start = Date.now();
  const res = await pool.query(text, params);
  const duration = Date.now() - start;
  if (duration > 1500) {
    console.warn(`[Slow PostgreSQL Query] ${duration}ms: ${text.slice(0, 100)}`);
  }
  return res.rows as T[];
}
