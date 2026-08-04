import { getToken, clearSession } from '../utils/auth';

function resolveBaseUrl() {
  if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL;
  if (import.meta.env.DEV) return '/api';

  const apiPort = new URLSearchParams(window.location.search).get('apiPort');
  return `http://localhost:${apiPort || 4001}/api`;
}

const BASE_URL = resolveBaseUrl();

async function request(path, { method = 'GET', body, auth = true } = {}) {
  const headers = { 'Content-Type': 'application/json' };

  if (auth) {
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  let response;
  try {
    response = await fetch(`${BASE_URL}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined
    });
  } catch (networkError) {
    throw new Error('Não foi possível conectar ao servidor. Verifique se o backend está rodando.');
  }

  const isJson = response.headers.get('content-type')?.includes('application/json');
  const data = isJson ? await response.json() : null;

  if (response.status === 401 && auth) {
    clearSession();
    window.dispatchEvent(new CustomEvent('auth:unauthorized'));
  }

  if (!response.ok) {
    throw new Error(data?.error || 'Ocorreu um erro inesperado.');
  }

  return data;
}

export const api = {
  get: (path, options) => request(path, { ...options, method: 'GET' }),
  post: (path, body, options) => request(path, { ...options, method: 'POST', body }),
  put: (path, body, options) => request(path, { ...options, method: 'PUT', body }),
  delete: (path, options) => request(path, { ...options, method: 'DELETE' })
};
