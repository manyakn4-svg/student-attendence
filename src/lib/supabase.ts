import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { SupabaseConfig } from '../types';

const STORAGE_KEY_CONFIG = 'attendwise_supabase_config';

// User's provided Supabase Project credentials
export const DEFAULT_SUPABASE_PROJECT_ID = 'ymyyzpomofoslazjjriu';
export const DEFAULT_SUPABASE_URL = 'https://ymyyzpomofoslazjjriu.supabase.co';
export const DEFAULT_SUPABASE_ANON_KEY = 'sb_publishable_eTvtgVMGFa_aInIrfXCyEQ_xMUmyC0f';

export function normalizeSupabaseUrl(input: string): string {
  let trimmed = (input || '').trim();
  if (!trimmed) return DEFAULT_SUPABASE_URL;

  // If user entered project id instead of full URL, e.g. "ymyyzpomofoslazjjri" or "ymyyzpomofoslazjjriu"
  if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
    if (trimmed === 'ymyyzpomofoslazjjri') {
      trimmed = 'ymyyzpomofoslazjjriu';
    }
    return `https://${trimmed}.supabase.co`;
  }

  // If user entered URL missing trailing 'u'
  if (trimmed.includes('ymyyzpomofoslazjjri.supabase.co')) {
    trimmed = trimmed.replace('ymyyzpomofoslazjjri.supabase.co', 'ymyyzpomofoslazjjriu.supabase.co');
  }

  return trimmed;
}

// Load stored config or environment variables, falling back to user project credentials
export function getSupabaseConfig(): SupabaseConfig {
  const envUrl = normalizeSupabaseUrl(import.meta.env.VITE_SUPABASE_URL || DEFAULT_SUPABASE_URL);
  const envKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY).trim();

  try {
    const saved = localStorage.getItem(STORAGE_KEY_CONFIG);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.url && parsed.anonKey) {
        return {
          url: normalizeSupabaseUrl(parsed.url),
          anonKey: parsed.anonKey.trim(),
          isCustom: true,
        };
      }
    }
  } catch (e) {
    // Ignore JSON errors
  }

  return {
    url: envUrl,
    anonKey: envKey,
    isCustom: false,
  };
}

export function saveSupabaseConfig(url: string, anonKey: string): void {
  const normalized = normalizeSupabaseUrl(url);
  localStorage.setItem(
    STORAGE_KEY_CONFIG,
    JSON.stringify({ url: normalized, anonKey: anonKey.trim() })
  );
}

export function clearCustomSupabaseConfig(): void {
  localStorage.removeItem(STORAGE_KEY_CONFIG);
}

let cachedClient: SupabaseClient | null = null;
let lastUsedConfig: string = '';

export function getSupabaseClient(): SupabaseClient | null {
  const config = getSupabaseConfig();
  const configKey = `${config.url}|${config.anonKey}`;

  if (!config.url || !config.anonKey) {
    return null;
  }

  if (cachedClient && lastUsedConfig === configKey) {
    return cachedClient;
  }

  try {
    cachedClient = createClient(config.url, config.anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    });
    lastUsedConfig = configKey;
    return cachedClient;
  } catch (err) {
    console.warn('Failed to initialize Supabase client:', err);
    return null;
  }
}

export interface SupabaseHealth {
  connected: boolean;
  tablesExist: boolean;
  error?: string;
}

export async function checkSupabaseHealth(): Promise<SupabaseHealth> {
  const client = getSupabaseClient();
  if (!client) {
    return { connected: false, tablesExist: false, error: 'No client initialized' };
  }

  try {
    const { data, error } = await client.from('attendance_records').select('id').limit(1);
    if (!error) {
      return { connected: true, tablesExist: true };
    }
    // PGRST205 means table doesn't exist in schema cache
    if (error.code === 'PGRST205' || error.message?.includes('schema cache') || error.message?.includes('relation "public.attendance_records" does not exist')) {
      return { connected: true, tablesExist: false, error: 'Tables not yet created in Supabase' };
    }
    // Other error (e.g. RLS policy violation or auth needed)
    return { connected: true, tablesExist: true, error: error.message };
  } catch (err: any) {
    return { connected: false, tablesExist: false, error: err?.message || 'Connection failed' };
  }
}
