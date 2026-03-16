export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

export async function apiRequest(path, options = {}) {
  const { method = 'GET', token, body, headers = {} } = options;

  const requestHeaders = {
    ...headers
  };

  if (body !== undefined && !requestHeaders['Content-Type']) {
    requestHeaders['Content-Type'] = 'application/json';
  }

  if (token) {
    requestHeaders.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: requestHeaders,
    body: body !== undefined ? JSON.stringify(body) : undefined
  });

  const contentType = response.headers.get('content-type') || '';
  const isJson = contentType.includes('application/json');
  const payload = isJson ? await response.json() : await response.text();

  if (!response.ok) {
    const message =
      (isJson && payload && typeof payload === 'object' && payload.detail) ||
      `Erro HTTP ${response.status}`;
    throw new Error(String(message));
  }

  return payload;
}
