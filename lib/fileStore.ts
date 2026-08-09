import { Business, AssessmentResponse } from '@/types';
import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');
const BUSINESSES_FILE = path.join(DATA_DIR, 'businesses.json');
const RESPONSES_FILE = path.join(DATA_DIR, 'responses.json');

// Memory fallback if filesystem is read-only in serverless environment
let memoryBusinesses: Record<string, Business> = {};
let memoryResponses: AssessmentResponse[] = [];

function ensureDataDirectory() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  } catch (err) {
    // Fallback to memory
  }
}

export function saveBusiness(business: Business): Business {
  memoryBusinesses[business.id] = business;
  ensureDataDirectory();
  try {
    let list: Business[] = [];
    if (fs.existsSync(BUSINESSES_FILE)) {
      list = JSON.parse(fs.readFileSync(BUSINESSES_FILE, 'utf8'));
    }
    const index = list.findIndex((b) => b.id === business.id);
    if (index >= 0) {
      list[index] = business;
    } else {
      list.push(business);
    }
    fs.writeFileSync(BUSINESSES_FILE, JSON.stringify(list, null, 2), 'utf8');
  } catch (err) {
    // Handled by memory fallback
  }
  return business;
}

export function getBusiness(id: string): Business | null {
  ensureDataDirectory();
  try {
    if (fs.existsSync(BUSINESSES_FILE)) {
      const list: Business[] = JSON.parse(fs.readFileSync(BUSINESSES_FILE, 'utf8'));
      const found = list.find((b) => b.id === id);
      if (found) {
        memoryBusinesses[id] = found;
        return found;
      }
    }
  } catch (err) {
    // Handled below
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
  memoryResponses.push(res);
  ensureDataDirectory();
  try {
    let list: AssessmentResponse[] = [];
    if (fs.existsSync(RESPONSES_FILE)) {
      list = JSON.parse(fs.readFileSync(RESPONSES_FILE, 'utf8'));
    }
    list.push(res);
    fs.writeFileSync(RESPONSES_FILE, JSON.stringify(list, null, 2), 'utf8');
  } catch (err) {
    // Handled by memory fallback
  }
  return res;
}

export function getResponsesForBusiness(businessId: string): AssessmentResponse[] {
  ensureDataDirectory();
  let results: AssessmentResponse[] = [];
  try {
    if (fs.existsSync(RESPONSES_FILE)) {
      const list: AssessmentResponse[] = JSON.parse(fs.readFileSync(RESPONSES_FILE, 'utf8'));
      results = list.filter((r) => r.businessId === businessId);
    }
  } catch (err) {
    // Handled below
  }

  const memMatches = memoryResponses.filter((r) => r.businessId === businessId);
  const combined = [...results, ...memMatches];
  
  // Deduplicate by ID
  const map = new Map<string, AssessmentResponse>();
  combined.forEach((item) => map.set(item.id, item));
  return Array.from(map.values());
}
