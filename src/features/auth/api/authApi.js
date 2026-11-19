import { apiRequest } from '../../../helpers/apiHelper'

export const authApi = {
  login: (username, password) => apiRequest('/api/auth/login', { method: 'POST', body: { username, password }, auth: false }),
  register: (payload) => apiRequest('/api/auth/register', { method: 'POST', body: payload, auth: false }),
  logout: () => apiRequest('/api/auth/logout', { method: 'POST' }),
  profile: () => apiRequest('/api/auth/profile'),
  updateProfile: (payload) => apiRequest('/api/auth/profile', { method: 'PUT', body: payload }),
}
