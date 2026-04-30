import { apiFetch } from '@/app/lib/api';
export type AuthUser = {
  id: string;
  email: string;
  role: 'USER' | 'ADMIN';
};

export type AuthResponse = {
  user: AuthUser;
  accessToken: string;
};

export function login(email: string, password: string) {
  return apiFetch<AuthResponse>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export function register(email: string, password: string) {
  return apiFetch<AuthResponse>('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export function refresh() {
  return apiFetch<AuthResponse>('/api/auth/refresh', {
    method: 'POST',
    credentials: 'include',
  });
}

export function logout() {
  return apiFetch<{ success: true }>('/api/auth/logout', {
    method: 'POST',
    credentials: 'include',
  });
}

export function me() {
  return apiFetch<AuthUser>('/api/auth/me', {
    method: 'GET',
  });
}