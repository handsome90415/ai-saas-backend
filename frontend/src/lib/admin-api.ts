const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export class AdminApiError extends Error {
  status: number
  constructor(message: string, status: number) {
    super(message)
    this.name = 'AdminApiError'
    this.status = status
  }
}

function getAdminToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('admin_token')
}

export function setAdminToken(token: string) {
  localStorage.setItem('admin_token', token)
}

export function removeAdminToken() {
  localStorage.removeItem('admin_token')
}

export function isLoggedIn(): boolean {
  return !!getAdminToken()
}

export async function adminGet<T = any>(endpoint: string): Promise<T> {
  const token = getAdminToken()
  const res = await fetch(`${API_BASE}${endpoint}`, {
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  })
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new AdminApiError(data.detail || `請求失敗 (${res.status})`, res.status)
  }
  return res.json()
}

export async function adminPost<T = any>(endpoint: string, body?: any): Promise<T> {
  const token = getAdminToken()
  const res = await fetch(`${API_BASE}${endpoint}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  })
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new AdminApiError(data.detail || `請求失敗 (${res.status})`, res.status)
  }
  return res.json()
}

export async function adminPut<T = any>(endpoint: string, body?: any): Promise<T> {
  const token = getAdminToken()
  const res = await fetch(`${API_BASE}${endpoint}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  })
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new AdminApiError(data.detail || `請求失敗 (${res.status})`, res.status)
  }
  return res.json()
}

export async function adminDelete<T = any>(endpoint: string): Promise<T> {
  const token = getAdminToken()
  const res = await fetch(`${API_BASE}${endpoint}`, {
    method: 'DELETE',
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  })
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new AdminApiError(data.detail || `請求失敗 (${res.status})`, res.status)
  }
  return res.json()
}
