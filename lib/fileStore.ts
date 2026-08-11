import { kv } from '@vercel/kv';
import { Business, AssessmentResponse } from '@/types';

/**
 * Detect whether Vercel KV environment variables are injected.
 * Vercel automatically injects KV_REST_API_URL & KV_REST_API_TOKEN (or VERCEL_KV_REST_API_URL/TOKEN).
 */
const hasKvEnv = Boolean(
  (process.env.KV_REST_API_URL || process.env.VERCEL_KV_REST_API_URL) &&
  (process.env.KV_REST_API_TOKEN || process.env.VERCEL_KV_REST_API_TOKEN)
);

/**
 * DEV-ONLY IN-MEMORY FALLBACK STORE
 * Used ONLY when Vercel KV environment variables are not present locally,
 * allowing `npm run dev` to work out-of-the-box without requiring a live KV connection.
 */
const globalForDevStore = globalThis as unknown as {
  devBusinesses?: Record<string, Business>;
  devResponses?: Record<string, AssessmentResponse[]>;
};

if (!globalForDevStore.devBusinesses) {
  globalForDevStore.devBusinesses = {};
}
if (!globalForDevStore.devResponses) {
  globalForDevStore.devResponses = {};
}

const devBusinesses = globalForDevStore.devBusinesses;
const devResponses = globalForDevStore.devResponses;

/**
 * Saves a business record.
 * Uses Vercel KV in connected environments or in-memory dev store for local dev.
 */
export async function saveBusiness(business: Business): Promise<Business> {
  if (!business || !business.id) return business;

  if (hasKvEnv) {
    try {
      await kv.set(`business:${business.id}`, business);
    } catch (err) {
      console.warn('[kvStore] Vercel KV saveBusiness failed, using dev fallback:', err);
      devBusinesses[business.id] = business;
    }
  } else {
    devBusinesses[business.id] = business;
  }

  return business;
}

/**
 * Fetches a business record by ID.
 * Returns null if the business does not exist.
 */
export async function getBusiness(id: string): Promise<Business | null> {
  if (!id || typeof id !== 'string' || id.trim().length < 3) return null;

  if (hasKvEnv) {
    try {
      const data = await kv.get<Business>(`business:${id}`);
      if (data) return data;
    } catch (err) {
      console.warn('[kvStore] Vercel KV getBusiness failed, trying dev fallback:', err);
    }
  }

  return devBusinesses[id] || null;
}

/**
 * Saves an assessment response record.
 */
export async function saveResponse(res: AssessmentResponse): Promise<AssessmentResponse> {
  if (!res || !res.id || !res.businessId) return res;

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
      console.warn('[kvStore] Vercel KV saveResponse failed, using dev fallback:', err);
      const list = devResponses[res.businessId] || [];
      const idx = list.findIndex((item) => item && item.id === res.id);
      if (idx >= 0) list[idx] = res;
      else list.push(res);
      devResponses[res.businessId] = list;
    }
  } else {
    const list = devResponses[res.businessId] || [];
    const idx = list.findIndex((item) => item && item.id === res.id);
    if (idx >= 0) list[idx] = res;
    else list.push(res);
    devResponses[res.businessId] = list;
  }

  return res;
}

/**
 * Fetches all responses recorded for a specific business ID.
 */
export async function getResponsesForBusiness(businessId: string): Promise<AssessmentResponse[]> {
  if (!businessId) return [];

  if (hasKvEnv) {
    try {
      const data = await kv.get<AssessmentResponse[]>(`responses:${businessId}`);
      if (Array.isArray(data)) return data;
    } catch (err) {
      console.warn('[kvStore] Vercel KV getResponsesForBusiness failed, trying dev fallback:', err);
    }
  }

  return devResponses[businessId] || [];
}
