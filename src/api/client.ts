import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppError } from '@/utils/errors';

const TOKEN_KEY = 'martisoor-api-token';
const DEFAULT_API_URL = 'https://martsoor.onrender.com';
const REQUEST_TIMEOUT_MS = 90_000;
const MAX_ATTEMPTS = 3;

function apiBase() {
  const url = (process.env.EXPO_PUBLIC_API_URL || DEFAULT_API_URL).replace(
    /\/$/,
    '',
  );
  if (!url) {
    throw new AppError(
      'API URL not configured. Set EXPO_PUBLIC_API_URL in .env',
      'API_CONFIG',
    );
  }
  return url;
}

export async function getToken() {
  return AsyncStorage.getItem(TOKEN_KEY);
}

export async function setToken(token: string | null) {
  if (token) await AsyncStorage.setItem(TOKEN_KEY, token);
  else await AsyncStorage.removeItem(TOKEN_KEY);
}

type RequestOptions = {
  method?: string;
  body?: unknown;
  auth?: boolean;
};

async function sleep(ms: number) {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchWithTimeout(
  url: string,
  init: RequestInit,
  timeoutMs: number,
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

export async function api<T = unknown>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const { method = 'GET', body, auth = true } = options;
  const headers: Record<string, string> = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  };

  if (auth) {
    const token = await getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const base = apiBase();
  const url = `${base}${path}`;
  const init: RequestInit = {
    method,
    headers,
    body: body != null ? JSON.stringify(body) : undefined,
  };

  let lastError: unknown;
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      const res = await fetchWithTimeout(url, init, REQUEST_TIMEOUT_MS);
      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
        message?: string;
      } & T;

      if (!res.ok) {
        throw new AppError(
          data.error || data.message || `Request failed (${res.status})`,
          'API_ERROR',
        );
      }

      return data;
    } catch (error) {
      if (error instanceof AppError && error.code === 'API_ERROR') {
        throw error;
      }
      lastError = error;
      if (attempt < MAX_ATTEMPTS) {
        await sleep(1500 * attempt);
      }
    }
  }

  const reason =
    lastError instanceof Error && lastError.name === 'AbortError'
      ? 'timed out'
      : 'unreachable';
  throw new AppError(
    `Cannot reach API (${reason}): ${base}. Open that URL in your phone browser, wait, then try login again.`,
    'NETWORK',
  );
}
