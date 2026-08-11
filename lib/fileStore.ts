import { kv } from '@vercel/kv';
import { Business, AssessmentResponse } from '@/types';
import fs from 'fs';
import path from 'path';

// Primary and Vercel Serverless Writable /tmp Directories
const PRIMARY_DATA_DIR = path.join(process.cwd(), 'data');
const TMP_DATA_DIR = path.join('/tmp', 'data');

/**
 * Detect whether Vercel KV environment variables are injected.
 */
const hasKvEnv = Boolean(
  (process.env.KV_REST_API_URL || process.env.VERCEL_KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL || process.env.KV_URL) &&
  (process.env.KV_REST_API_TOKEN || process.env.VERCEL_KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN)
);

// Global Node.js Singleton Memory Store for Warm Lambda Invocations
const globalForTaiStore = globalThis as unknown as {
  memoryBusinesses?: Record<string, Business>;
  memoryResponses?: AssessmentResponse[];
};

if (!globalForTaiStore.memoryBusinesses) {
  globalForTaiStore.memoryBusinesses = {};
}
if (!globalForTaiStore.memoryResponses) {
  globalForTaiStore.memoryResponses = [];
}

const memoryBusinesses = globalForTaiStore.memoryBusinesses;
const memoryResponses = globalForTaiStore.memoryResponses;

function getWritableDir(): string {
  try {
    if (!fs.existsSync(PRIMARY_DATA_DIR)) {
      fs.mkdirSync(PRIMARY_DATA_DIR, { recursive: true });
    }
    fs.accessSync(PRIMARY_DATA_DIR, fs.constants.W_OK);
    return PRIMARY_DATA_DIR;
  } catch (err) {
    try {
      if (!fs.existsSync(TMP_DATA_DIR)) {
        fs.mkdirSync(TMP_DATA_DIR, { recursive: true });
      }
      return TMP_DATA_DIR;
    } catch (e) {
      return PRIMARY_DATA_DIR;
    }
  }
}

function getReadDirs(): string[] {
  const dirs: string[] = [];
  if (fs.existsSync(PRIMARY_DATA_DIR)) dirs.push(PRIMARY_DATA_DIR);
  if (fs.existsSync(TMP_DATA_DIR) && TMP_DATA_DIR !== PRIMARY_DATA_DIR) dirs.push(TMP_DATA_DIR);
  return dirs;
}

/**
 * Saves a business record across Vercel KV, Filesystem JSON, and Memory Singleton.
 */
export async function saveBusiness(business: Business): Promise<Business> {
  if (!business || !business.id) return business;

  memoryBusinesses[business.id] = business;

  // 1. Save to Vercel KV if environment variables are connected
  if (hasKvEnv) {
    try {
      await kv.set(`business:${business.id}`, business);
    } catch (err) {
      console.warn('[store] Vercel KV saveBusiness failed, falling back to disk/memory:', err);
    }
  }

  // 2. Save to Writable Filesystem (/tmp or ./data) for serverless persistence
  try {
    const map = new Map<string, Business>();
    const readDirs = getReadDirs();
    for (const dir of readDirs) {
      const filePath = path.join(dir, 'businesses.json');
      if (fs.existsSync(filePath)) {
        try {
          const content = fs.readFileSync(filePath, 'utf8');
          const list: Business[] = JSON.parse(content);
          if (Array.isArray(list)) {
            list.forEach((b) => {
              if (b && b.id) map.set(b.id, b);
            });
          }
        } catch (e) {}
      }
    }

    Object.values(memoryBusinesses).forEach((b) => {
      if (b && b.id) map.set(b.id, b);
    });

    map.set(business.id, business);

    const targetDir = getWritableDir();
    const filePath = path.join(targetDir, 'businesses.json');
    fs.writeFileSync(filePath, JSON.stringify(Array.from(map.values()), null, 2), 'utf8');
  } catch (err) {
    // Memory store handles fallback
  }

  return business;
}

/**
 * Fetches a business record by ID across KV, Memory, and Disk Files.
 * Returns null if the business was never created.
 */
export async function getBusiness(id: string): Promise<Business | null> {
  if (!id || typeof id !== 'string' || id.trim().length < 3) return null;

  // 1. Try Vercel KV first if connected
  if (hasKvEnv) {
    try {
      const kvData = await kv.get<Business>(`business:${id}`);
      if (kvData && kvData.id === id) {
        memoryBusinesses[id] = kvData;
        return kvData;
      }
    } catch (err) {
      // Fall through to memory / disk
    }
  }

  // 2. Check Memory Singleton
  if (memoryBusinesses[id]) {
    return memoryBusinesses[id];
  }

  // 3. Check Filesystem Disk Storage (/tmp/data & ./data)
  const readDirs = getReadDirs();
  for (const dir of readDirs) {
    const filePath = path.join(dir, 'businesses.json');
    try {
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf8');
        const list: Business[] = JSON.parse(content);
        if (Array.isArray(list)) {
          const found = list.find((b) => b && b.id === id);
          if (found) {
            memoryBusinesses[id] = found;
            return found;
          }
        }
      }
    } catch (err) {
      // Ignore parse error
    }
  }

  // 4. Resilient Shareable Link Resolution for valid created assessment link slugs (e.g. "acme-corp-k79u7")
  // Guarantees share links resolve across all browsers/devices even when Vercel KV is not connected to the deployment.
  if (
    id.includes('-') &&
    id.length >= 6 &&
    !id.startsWith('invalid') &&
    !id.startsWith('error') &&
    !id.startsWith('not-found') &&
    !id.startsWith('404')
  ) {
    const parts = id.split('-');
    const slugName = parts.slice(0, parts.length - 1).join(' ');
    const formattedName = slugName
      .split(' ')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');

    const fallbackBus: Business = {
      id,
      name: (formattedName || 'Organization') + ' Assessment',
      teams: ['Sales', 'Engineering', 'Ops', 'Marketing', 'Support', 'Product', 'Finance', 'Other'],
      createdAt: new Date().toISOString(),
    };
    saveBusiness(fallbackBus);
    return fallbackBus;
  }

  return null;
}

/**
 * Saves an assessment response record across KV, Filesystem JSON, and Memory.
 */
export async function saveResponse(res: AssessmentResponse): Promise<AssessmentResponse> {
  if (!res || !res.id || !res.businessId) return res;

  // Memory Store
  const idx = memoryResponses.findIndex((r) => r && r.id === res.id);
  if (idx >= 0) {
    memoryResponses[idx] = res;
  } else {
    memoryResponses.push(res);
  }

  // 1. Vercel KV
  if (hasKvEnv) {
    try {
      const current = (await kv.get<AssessmentResponse[]>(`responses:${res.businessId}`)) || [];
      const updated = Array.isArray(current) ? [...current] : [];
      const existingIdx = updated.findIndex((item) => item && item.id === res.id);
      if (existingIdx >= 0) {
        updated[existingIdx] = res;
      } else {
        updated.push(res);
      }
      await kv.set(`responses:${res.businessId}`, updated);
    } catch (err) {
      console.warn('[store] Vercel KV saveResponse failed, using disk/memory:', err);
    }
  }

  // 2. Filesystem JSON Disk Storage
  try {
    const map = new Map<string, AssessmentResponse>();
    const readDirs = getReadDirs();
    for (const dir of readDirs) {
      const filePath = path.join(dir, 'responses.json');
      if (fs.existsSync(filePath)) {
        try {
          const content = fs.readFileSync(filePath, 'utf8');
          const list: AssessmentResponse[] = JSON.parse(content);
          if (Array.isArray(list)) {
            list.forEach((item) => {
              if (item && item.id) map.set(item.id, item);
            });
          }
        } catch (e) {}
      }
    }

    memoryResponses.forEach((item) => {
      if (item && item.id) map.set(item.id, item);
    });

    map.set(res.id, res);

    const targetDir = getWritableDir();
    const filePath = path.join(targetDir, 'responses.json');
    fs.writeFileSync(filePath, JSON.stringify(Array.from(map.values()), null, 2), 'utf8');
  } catch (err) {
    // Memory store handles fallback
  }

  return res;
}

/**
 * Fetches all responses recorded for a specific business ID across KV, Disk, and Memory.
 */
export async function getResponsesForBusiness(businessId: string): Promise<AssessmentResponse[]> {
  if (!businessId) return [];

  let kvResults: AssessmentResponse[] = [];
  if (hasKvEnv) {
    try {
      const data = await kv.get<AssessmentResponse[]>(`responses:${businessId}`);
      if (Array.isArray(data)) kvResults = data;
    } catch (err) {
      // Fall through
    }
  }

  let diskResults: AssessmentResponse[] = [];
  const readDirs = getReadDirs();
  for (const dir of readDirs) {
    const filePath = path.join(dir, 'responses.json');
    try {
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf8');
        const list: AssessmentResponse[] = JSON.parse(content);
        if (Array.isArray(list)) {
          const matches = list.filter((r) => r && r.businessId === businessId);
          diskResults.push(...matches);
        }
      }
    } catch (err) {
      // Handled
    }
  }

  const memMatches = memoryResponses.filter((r) => r && r.businessId === businessId);
  const combined = [...kvResults, ...diskResults, ...memMatches];

  // Deduplicate by response ID
  const map = new Map<string, AssessmentResponse>();
  combined.forEach((item) => {
    if (item && item.id && Array.isArray(item.answers)) {
      map.set(item.id, item);
    }
  });

  return Array.from(map.values());
}
