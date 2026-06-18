
// A wrapper for the Supabase client with enhanced error handling, retries, and connection monitoring
import { supabase as rawSupabase } from './client';

// --- Retry configuration ---
const DEFAULT_MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000; // Base delay for exponential backoff
const RETRYABLE_ERRORS = [
  'network',
  'connection',
  'timeout',
  'ECONNRESET',
  'ECONNREFUSED',
  '500',
  '502',
  '503',
  '504',
  'Too many requests',
  'rate limit'
];

// --- Connection state tracking ---
let isConnected = true;
let connectionListeners: ((connected: boolean) => void)[] = [];

export const connectionState = {
  isConnected: () => isConnected,
  subscribe: (listener: (connected: boolean) => void) => {
    connectionListeners.push(listener);
    return () => {
      connectionListeners = connectionListeners.filter(l => l !== listener);
    };
  }
};

const setConnected = (connected: boolean) => {
  if (isConnected !== connected) {
    isConnected = connected;
    connectionListeners.forEach(listener => listener(connected));
  }
};

// --- Exponential backoff helper ---
const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// --- Retry logic wrapper ---
export async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries = DEFAULT_MAX_RETRIES,
  retryDelay = RETRY_DELAY_MS
): Promise<T> {
  let lastError: any;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const result = await fn();
      setConnected(true);
      return result;
    } catch (error: any) {
      lastError = error;
      
      const errorMessage = (error.message || error.toString()).toLowerCase();
      const isRetryable = RETRYABLE_ERRORS.some(keyword => 
        errorMessage.includes(keyword.toLowerCase())
      );
      
      if (!isRetryable || attempt === maxRetries) {
        if (errorMessage.includes('network') || errorMessage.includes('connection')) {
          setConnected(false);
        }
        throw error;
      }
      
      console.log(`[Supabase] Retrying (${attempt + 1}/${maxRetries})...`);
      await wait(retryDelay * Math.pow(2, attempt)); // Exponential backoff
    }
  }
  
  throw lastError;
}

// --- Re-export the raw client and add our helpers ---
export const supabase = rawSupabase;

export default {
  ...rawSupabase,
  withRetry,
  connectionState
};

