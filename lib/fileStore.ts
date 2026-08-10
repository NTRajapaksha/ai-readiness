import { Business, AssessmentResponse } from '@/types';
import fs from 'fs';
import path from 'path';

// Primary and Vercel Serverless Writable /tmp Directories
const PRIMARY_DATA_DIR = path.join(process.cwd(), 'data');
const TMP_DATA_DIR = path.join('/tmp', 'data');

let memoryBusinesses: Record<string, Business> = {};
let memoryResponses: AssessmentResponse[] = [];

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
    const targetDir = getWritableDir();
    const filePath = path.join(targetDir, 'businesses.json');
    let list: Business[] = [];
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8');
      list = JSON.parse(content);
      if (!Array.isArray(list)) list = [];
    }
    const index = list.findIndex((b) => b && b.id === business.id);
    if (index >= 0) {
      list[index] = business;
    } else {
      list.push(business);
    }
    fs.writeFileSync(filePath, JSON.stringify(list, null, 2), 'utf8');
  } catch (err) {
    console.warn('[fileStore] Filesystem write failed, using memory fallback:', err);
  }
  return business;
}

export function getBusiness(id: string): Business | null {
  if (!id) return null;
  
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

  // Automatic Fallback: Construct a default Business for any businessId so shareable links NEVER fail!
  const namePart = id.split('-')[0] || 'Organization';
  const formattedName = namePart.charAt(0).toUpperCase() + namePart.slice(1);
  const fallbackBus: Business = {
    id,
    name: formattedName + ' Organization',
    teams: ['Sales', 'Engineering', 'Ops', 'Marketing', 'Support', 'Product', 'Finance'],
    createdAt: new Date().toISOString(),
  };

  saveBusiness(fallbackBus);
  return fallbackBus;
}

export function saveResponse(res: AssessmentResponse): AssessmentResponse {
  if (!res || !res.id) return res;
  memoryResponses = memoryResponses.filter((r) => r && r.id !== res.id);
  memoryResponses.push(res);
  
  try {
    const targetDir = getWritableDir();
    const filePath = path.join(targetDir, 'responses.json');
    let list: AssessmentResponse[] = [];
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8');
      list = JSON.parse(content);
      if (!Array.isArray(list)) list = [];
    }
    const idx = list.findIndex((r) => r && r.id === res.id);
    if (idx >= 0) {
      list[idx] = res;
    } else {
      list.push(res);
    }
    fs.writeFileSync(filePath, JSON.stringify(list, null, 2), 'utf8');
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
