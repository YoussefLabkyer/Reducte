const API_BASE = '/api';

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

/**
 * Manages JWT tokens using sessionStorage to isolate authenticated sessions per tab.
 * This allows administrators, technicians, and clients to be connected concurrently in different tabs.
 */
export const getStoredToken = (): string | null => {
  const sessionToken = sessionStorage.getItem('reducte_token');
  if (sessionToken) {
    return sessionToken;
  }
  // Fallback / migration from legacy localStorage
  const localToken = localStorage.getItem('reducte_token');
  if (localToken) {
    sessionStorage.setItem('reducte_token', localToken);
    localStorage.removeItem('reducte_token');
    return localToken;
  }
  return null;
};

export const setStoredToken = (token: string): void => {
  sessionStorage.setItem('reducte_token', token);
  localStorage.removeItem('reducte_token');
};

export const removeStoredToken = (): void => {
  sessionStorage.removeItem('reducte_token');
  localStorage.removeItem('reducte_token');
};

export async function fetchApi<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getStoredToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new ApiError(data.error || data.message || 'Une erreur est survenue.', response.status);
  }

  return data as T;
}
