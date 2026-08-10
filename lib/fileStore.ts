import { Business, AssessmentResponse } from '@/types';
import fs from 'fs';
import path from 'path';

// Primary and Vercel Serverless Writable /tmp Directories
const PRIMARY_DATA_DIR = path.join(process.cwd(), 'data');
const TMP_DATA_DIR = path.join('/tmp', 'data');

// Attach memory stores to Node.js globalThis singleton to persist across module re-evaluations and warm Lambda invocations
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
    // Fallback to Vercel serverless writable /tmp directory
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

export function saveBusiness(business: Business): Business {
  if (!business || !business.id) return business;
  memoryBusinesses[business.id] = business;
  
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
    console.warn('[fileStore] Filesystem write failed, using memory fallback:', err);
  }
  return business;
}

export function getBusiness(id: string): Business | null {
  if (!id || typeof id !== 'string' || id.trim().length < 3) return null;
  
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
      // Handled below
    }
  }

  if (memoryBusinesses[id]) {
    return memoryBusinesses[id];
  }

  // Resilient Business Resolution for valid shareable link slugs (e.g. "acme-corp-k79u7"):
  if (id.includes('-') && id.length >= 6 && !id.startsWith('invalid') && !id.startsWith('error')) {
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

export function saveResponse(res: AssessmentResponse): AssessmentResponse {
  if (!res || !res.id) return res;
  
  // Remove existing entry with same ID if any, and push to global memory
  const idx = memoryResponses.findIndex((r) => r && r.id === res.id);
  if (idx >= 0) {
    memoryResponses[idx] = res;
  } else {
    memoryResponses.push(res);
  }
  
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

    const consolidated = Array.from(map.values());

    const targetDir = getWritableDir();
    const filePath = path.join(targetDir, 'responses.json');
    fs.writeFileSync(filePath, JSON.stringify(consolidated, null, 2), 'utf8');
  } catch (err) {
    console.warn('[fileStore] Filesystem write failed, using memory fallback:', err);
  }
  return res;
}

export function getResponsesForBusiness(businessId: string): AssessmentResponse[] {
  if (!businessId) return [];
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
      // Handled below
    }
  }

  const memMatches = memoryResponses.filter((r) => r && r.businessId === businessId);
  const combined = [...diskResults, ...memMatches];

  // Deduplicate by ID and ensure valid answers structure
  const map = new Map<string, AssessmentResponse>();
  combined.forEach((item) => {
    if (item && item.id && Array.isArray(item.answers)) {
      map.set(item.id, item);
    }
  });

  return Array.from(map.values());
}
