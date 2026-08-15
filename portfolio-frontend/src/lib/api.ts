const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

interface FetchOptions extends RequestInit {
  token?: string;
}

async function fetchApi<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
  const { token, headers: customHeaders, ...rest } = options;

  // Con FormData el navegador debe fijar su propio Content-Type (boundary)
  const isFormData = typeof FormData !== 'undefined' && rest.body instanceof FormData;

  const headers: Record<string, string> = {
    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
    ...customHeaders as Record<string, string>,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_URL}${endpoint}`, { headers, ...rest });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: 'Error de red' }));
    throw new Error(error.message || `HTTP ${res.status}`);
  }

  const json = await res.json();
  // El TransformInterceptor del backend envuelve todo en { data: ... }
  return json.data !== undefined ? json.data : json;
}

export const api = {
  // Auth
  login: (email: string, password: string) =>
    fetchApi<{ accessToken: string; refreshToken: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  register: (data: { email: string; password: string; name: string }) =>
    fetchApi('/auth/register', { method: 'POST', body: JSON.stringify(data) }),

  getProfile: (token: string) =>
    fetchApi('/auth/me', { token }),

  refreshToken: (refreshToken: string) =>
    fetchApi<{ accessToken: string }>('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    }),

  // Projects
  getProjects: (params?: Record<string, string>) => {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return fetchApi(`/projects${query}`);
  },

  getProject: (slug: string) => fetchApi(`/projects/${slug}`),

  // Posts
  getPosts: (params?: Record<string, string>) => {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return fetchApi(`/posts${query}`);
  },

  getPost: (slug: string) => fetchApi(`/posts/${slug}`),

  likePost: (id: string, token: string) =>
    fetchApi(`/posts/${id}/like`, { method: 'POST', token }),

  // Courses
  getCourses: (params?: Record<string, string>) => {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return fetchApi(`/courses${query}`);
  },

  getCourse: (slug: string) => fetchApi(`/courses/${slug}`),

  getLesson: (courseSlug: string, lessonSlug: string, token: string) =>
    fetchApi(`/courses/${courseSlug}/lessons/${lessonSlug}`, { token }),

  checkEnrollment: (courseSlug: string, token: string) =>
    fetchApi(`/enrollments/check/${courseSlug}`, { token }).catch(() => null),

  enrollCourse: (courseId: string, token: string) =>
    fetchApi('/enrollments', { method: 'POST', body: JSON.stringify({ courseId }), token }),

  // Enrollments
  getMyEnrollments: (token: string) =>
    fetchApi('/enrollments/my', { token }),

  updateProgress: (id: string, data: unknown, token: string) =>
    fetchApi(`/enrollments/${id}/progress`, {
      method: 'PATCH',
      body: JSON.stringify(data),
      token,
    }),

  // Comments
  getComments: (targetType: string, targetId: string) =>
    fetchApi(`/comments?targetType=${targetType}&targetId=${targetId}`),

  getMyComments: (token: string) =>
    fetchApi('/comments/my', { token }),

  createComment: (data: unknown, token: string) =>
    fetchApi('/comments', { method: 'POST', body: JSON.stringify(data), token }),

  // Newsletter
  subscribe: (email: string, name?: string) =>
    fetchApi('/newsletter/subscribe', {
      method: 'POST',
      body: JSON.stringify({ email, name }),
    }),

  // Contact / Analytics
  trackPageview: (path: string) =>
    fetchApi('/analytics/track', {
      method: 'POST',
      body: JSON.stringify({ path }),
    }).catch(() => {}),

  // Categories
  getCategories: (type?: string) => {
    const query = type ? `?type=${type}` : '';
    return fetchApi(`/categories${query}`);
  },

  // Site Config
  getSiteConfig: () => fetchApi('/site-config'),

  // Auth (extended)
  getAuthProviders: () =>
    fetchApi<{ google: boolean; github: boolean }>('/auth/providers'),

  uploadAvatar: (file: File, token: string) => {
    const formData = new FormData();
    formData.append('file', file);
    return fetchApi<{ url: string }>('/upload/avatar', {
      method: 'POST',
      token,
      body: formData as unknown as string,
      headers: {},
    });
  },

  logout: (token: string) =>
    fetchApi('/auth/logout', { method: 'POST', token }),

  updateProfile: (data: unknown, token: string) =>
    fetchApi('/auth/me', { method: 'PATCH', body: JSON.stringify(data), token }),

  forgotPassword: (email: string) =>
    fetchApi('/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email }) }),

  resetPassword: (token: string, password: string) =>
    fetchApi('/auth/reset-password', { method: 'POST', body: JSON.stringify({ token, password }) }),

  // Projects (admin)
  createProject: (data: unknown, token: string) =>
    fetchApi('/projects', { method: 'POST', body: JSON.stringify(data), token }),

  updateProject: (id: string, data: unknown, token: string) =>
    fetchApi(`/projects/${id}`, { method: 'PATCH', body: JSON.stringify(data), token }),

  deleteProject: (id: string, token: string) =>
    fetchApi(`/projects/${id}`, { method: 'DELETE', token }),

  // Posts (admin)
  createPost: (data: unknown, token: string) =>
    fetchApi('/posts', { method: 'POST', body: JSON.stringify(data), token }),

  updatePost: (id: string, data: unknown, token: string) =>
    fetchApi(`/posts/${id}`, { method: 'PATCH', body: JSON.stringify(data), token }),

  deletePost: (id: string, token: string) =>
    fetchApi(`/posts/${id}`, { method: 'DELETE', token }),

  // Contenido propio (maestros/admin)
  getMyPosts: (token: string) => fetchApi('/posts/mine', { token }),

  getMyCourses: (token: string) => fetchApi('/courses/mine', { token }),

  // Courses (admin)
  createCourse: (data: unknown, token: string) =>
    fetchApi('/courses', { method: 'POST', body: JSON.stringify(data), token }),

  updateCourse: (id: string, data: unknown, token: string) =>
    fetchApi(`/courses/${id}`, { method: 'PATCH', body: JSON.stringify(data), token }),

  deleteCourse: (id: string, token: string) =>
    fetchApi(`/courses/${id}`, { method: 'DELETE', token }),

  // Services
  getServices: (params?: Record<string, string>) => {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return fetchApi(`/services${query}`);
  },

  getService: (slug: string) => fetchApi(`/services/${slug}`),

  // Services (admin)
  createService: (data: unknown, token: string) =>
    fetchApi('/services', { method: 'POST', body: JSON.stringify(data), token }),

  updateService: (id: string, data: unknown, token: string) =>
    fetchApi(`/services/${id}`, { method: 'PATCH', body: JSON.stringify(data), token }),

  deleteService: (id: string, token: string) =>
    fetchApi(`/services/${id}`, { method: 'DELETE', token }),

  // Categories (admin)
  createCategory: (data: unknown, token: string) =>
    fetchApi('/categories', { method: 'POST', body: JSON.stringify(data), token }),

  updateCategory: (id: string, data: unknown, token: string) =>
    fetchApi(`/categories/${id}`, { method: 'PATCH', body: JSON.stringify(data), token }),

  deleteCategory: (id: string, token: string) =>
    fetchApi(`/categories/${id}`, { method: 'DELETE', token }),

  // Comments (admin)
  updateComment: (id: string, data: unknown, token: string) =>
    fetchApi(`/comments/${id}`, { method: 'PATCH', body: JSON.stringify(data), token }),

  deleteComment: (id: string, token: string) =>
    fetchApi(`/comments/${id}`, { method: 'DELETE', token }),

  approveComment: (id: string, token: string) =>
    fetchApi(`/comments/${id}/approve`, { method: 'PATCH', token }),

  // Users (admin)
  getUsers: (token: string) => fetchApi('/users', { token }),

  getUser: (id: string, token: string) => fetchApi(`/users/${id}`, { token }),

  searchUsers: (query: string, token: string) =>
    fetchApi<{ _id: string; name: string }[]>(`/users/search?q=${encodeURIComponent(query)}`, { token }),

  updateUser: (id: string, data: unknown, token: string) =>
    fetchApi(`/users/${id}`, { method: 'PATCH', body: JSON.stringify(data), token }),

  deleteUser: (id: string, token: string) =>
    fetchApi(`/users/${id}`, { method: 'DELETE', token }),

  // Newsletter (admin)
  getSubscribers: (token: string) => fetchApi('/newsletter/subscribers', { token }),

  // Analytics (admin)
  getAnalyticsStats: (token: string, days?: number) => {
    const query = days ? `?days=${days}` : '';
    return fetchApi(`/analytics/stats${query}`, { token });
  },

  getAnalyticsReferrers: (token: string, days?: number) => {
    const query = days ? `?days=${days}` : '';
    return fetchApi(`/analytics/referrers${query}`, { token });
  },

  // Certificates
  getCertificate: (id: string) => fetchApi(`/certificates/${id}`),

  getMyCertificates: (token: string) =>
    fetchApi('/certificates/my', { token }),

  generateCertificate: (data: unknown, token: string) =>
    fetchApi('/certificates/generate', { method: 'POST', body: JSON.stringify(data), token }),

  // Site Config (admin)
  updateSiteConfig: (data: unknown, token: string) =>
    fetchApi('/site-config', { method: 'PUT', body: JSON.stringify(data), token }),

  // Upload (admin)
  uploadFile: (file: File, token: string) => {
    const formData = new FormData();
    formData.append('file', file);
    return fetchApi('/upload', {
      method: 'POST',
      token,
      body: formData as unknown as string,
      headers: {},
    });
  },

  deleteFile: (filename: string, token: string) =>
    fetchApi(`/upload/${filename}`, { method: 'DELETE', token }),

  // Messages (chat)
  sendMessage: (data: { to: string; body: string }, token: string) =>
    fetchApi('/messages', { method: 'POST', body: JSON.stringify(data), token }),

  getConversations: (token: string) => fetchApi('/messages/conversations', { token }),

  getConversation: (userId: string, token: string) =>
    fetchApi(`/messages/conversation/${userId}`, { token }),

  getUnreadCount: (token: string) =>
    fetchApi<{ count: number }>('/messages/unread-count', { token }),

  deleteMessage: (id: string, token: string) =>
    fetchApi(`/messages/${id}`, { method: 'DELETE', token }),

  // Messages (admin)
  getAdminConversations: (token: string) =>
    fetchApi('/messages/admin/all', { token }),

  getAdminConversation: (userA: string, userB: string, token: string) =>
    fetchApi(`/messages/admin/conversation/${userA}/${userB}`, { token }),

  adminDeleteMessage: (id: string, token: string) =>
    fetchApi(`/messages/admin/${id}`, { method: 'DELETE', token }),

  // AI Generation (admin)
  generateBlogPost: (data: { topic: string; style?: string; language?: string; targetKeywords?: string[] }, token: string) =>
    fetchApi('/generation/blog', { method: 'POST', body: JSON.stringify(data), token }),
};

export default api;
