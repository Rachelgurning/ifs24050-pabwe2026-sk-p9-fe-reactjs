const TOKEN_KEY = 'delcom_blog_token'
const USER_KEY = 'delcom_blog_user'

function resolveBase() {
  const env = import.meta.env.VITE_API_URL
  if (env) return env.replace(/\/+$/, '')
  const { origin, hostname } = window.location
  if (hostname !== 'localhost' && hostname !== '127.0.0.1' && origin.includes('-fe-reactjs')) {
    return origin.replace('-fe-reactjs', '-be-golang-gin')
  }
  return ''
}

export const API_BASE = resolveBase()

function storage() {
  try {
    return window.localStorage
  } catch {
    return null
  }
}

export const getToken = () => storage()?.getItem(TOKEN_KEY) || null

export function getUser() {
  try {
    return JSON.parse(storage()?.getItem(USER_KEY) || 'null')
  } catch {
    return null
  }
}

export function setSession(token, user) {
  storage()?.setItem(TOKEN_KEY, token)
  storage()?.setItem(USER_KEY, JSON.stringify(user))
}

export function clearSession() {
  storage()?.removeItem(TOKEN_KEY)
  storage()?.removeItem(USER_KEY)
}

export async function apiRequest(path, { method = 'GET', body, auth = true } = {}) {
  const headers = { Accept: 'application/json' }
  if (body !== undefined) headers['Content-Type'] = 'application/json'
  const token = getToken()
  if (auth && token) headers.Authorization = `Bearer ${token}`
  let res
  try {
    res = await fetch(API_BASE + path, { method, headers, body: body !== undefined ? JSON.stringify(body) : undefined })
  } catch {
    throw new Error('Tidak dapat terhubung ke server API')
  }
  let json = {}
  try {
    json = await res.json()
  } catch {
    json = {}
  }
  if (!res.ok || json.status !== 'success') {
    if (res.status === 401 && auth && token) {
      clearSession()
      window.dispatchEvent(new Event('auth:expired'))
    }
    const err = new Error(json.message || `Permintaan gagal (${res.status})`)
    err.status = res.status
    throw err
  }
  return json.data ?? {}
}
