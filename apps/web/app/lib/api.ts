const API_URL = process.env.NEXT_PUBLIC_API_URL ?? '';
let isRefreshing = false;
export async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const accessToken =
    typeof window !== 'undefined'
      ? localStorage.getItem('accessToken')
      : null;

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(accessToken
        ? { Authorization: `Bearer ${accessToken}` }
        : {}),
      ...options.headers,
    },
  });

  if (response.status === 401 && path !== '/api/auth/refresh' && !isRefreshing) {
    isRefreshing = true;

    try {
      const refreshResponse = await fetch(`${API_URL}/api/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!refreshResponse.ok) {
        localStorage.removeItem('accessToken');
        throw new Error(await refreshResponse.text());
      }

      const refreshData = await refreshResponse.json();
      localStorage.setItem('accessToken', refreshData.accessToken);

      return apiFetch<T>(path, options);
    } finally {
      isRefreshing = false;
    }
  }

  if (!response.ok) {
    throw new Error(await response.text());
  }

  return response.json() as Promise<T>;
}