const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export class ApiError extends Error {
  status: number
  constructor(message: string, status: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

function getToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('token')
}

function extractError(data: any, status: number): string {
  if (!data || !data.detail) return `請求失敗 (${status})`
  if (typeof data.detail === 'string') return data.detail
  if (Array.isArray(data.detail)) {
    return data.detail.map((d: any) => d.msg || d.message || String(d)).join(', ')
  }
  return `請求失敗 (${status})`
}

function handleAuthError(status: number) {
  if (status === 401 && typeof window !== 'undefined') {
    localStorage.removeItem('token')
    window.location.href = '/login'
  }
}

export async function apiGet<T = any>(endpoint: string): Promise<T> {
  const token = getToken()
  const res = await fetch(`${API_BASE}${endpoint}`, {
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  })
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    handleAuthError(res.status)
    throw new ApiError(extractError(data, res.status), res.status)
  }
  return res.json()
}

export async function apiPost<T = any>(endpoint: string, body?: any): Promise<T> {
  const token = getToken()
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
    handleAuthError(res.status)
    throw new ApiError(extractError(data, res.status), res.status)
  }
  return res.json()
}

export async function apiPut<T = any>(endpoint: string, body?: any): Promise<T> {
  const token = getToken()
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
    handleAuthError(res.status)
    throw new ApiError(extractError(data, res.status), res.status)
  }
  return res.json()
}

export async function apiDelete<T = any>(endpoint: string): Promise<T> {
  const token = getToken()
  const res = await fetch(`${API_BASE}${endpoint}`, {
    method: 'DELETE',
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  })
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    handleAuthError(res.status)
    throw new ApiError(extractError(data, res.status), res.status)
  }
  return res.json()
}
