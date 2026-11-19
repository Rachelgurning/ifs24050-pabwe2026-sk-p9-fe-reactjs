import { apiRequest } from '../../../helpers/apiHelper'

export const CATEGORIES = ['Teknologi', 'Pendidikan', 'Gaya Hidup', 'Bisnis', 'Opini', 'Umum']

const qs = (params) => {
  const s = new URLSearchParams(Object.entries(params).filter(([, v]) => v)).toString()
  return s ? `?${s}` : ''
}

export const blogApi = {
  categories: () => apiRequest('/api/public/categories', { auth: false }),
  publicPosts: (q, category) => apiRequest(`/api/public/posts${qs({ q, category })}`, { auth: false }),
  publicPost: (slug) => apiRequest(`/api/public/posts/${encodeURIComponent(slug)}`, { auth: false }),
  myPosts: () => apiRequest('/api/posts'),
  stats: () => apiRequest('/api/posts/stats'),
  getPost: (id) => apiRequest(`/api/posts/${id}`),
  createPost: (payload) => apiRequest('/api/posts', { method: 'POST', body: payload }),
  updatePost: (id, payload) => apiRequest(`/api/posts/${id}`, { method: 'PUT', body: payload }),
  togglePublish: (id) => apiRequest(`/api/posts/${id}/toggle-publish`, { method: 'PATCH' }),
  deletePost: (id) => apiRequest(`/api/posts/${id}`, { method: 'DELETE' }),
  aiGenerate: (payload) => apiRequest('/api/posts/ai-generate', { method: 'POST', body: payload }),
}
