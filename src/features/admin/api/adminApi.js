import { apiRequest } from '../../../helpers/apiHelper'

export const adminApi = {
  users: () => apiRequest('/api/admin/users'),
  posts: () => apiRequest('/api/admin/posts'),
  userPosts: (id) => apiRequest(`/api/admin/users/${id}/posts`),
}
