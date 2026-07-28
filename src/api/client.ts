import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppError } from '@/utils/errors';

const TOKEN_KEY = 'martisoor-api-token';

function apiBase() {
  const url = process.env.EXPO_PUBLIC_API_URL?.replace(/\/$/, '');
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

  let res: Response;
  try {
    res = await fetch(`${apiBase()}${path}`, {
      method,
      headers,
      body: body != null ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new AppError(
      'Cannot reach API. Start the server and check EXPO_PUBLIC_API_URL.',
      'NETWORK',
    );
  }

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
}
