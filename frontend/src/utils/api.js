const API_BASE = import.meta.env.VITE_API_URL || "/api";

async function request(path, options = {}, includeMetadata = false) {
  const response = await fetch(`${API_BASE}${path}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json", ...options.headers },
    ...options,
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.message || "Could not connect to OrbitU. Please try again.");
  return includeMetadata ? body : body.data ?? body;
}

export const api = {
  register: (payload) => request("/auth/register", { method: "POST", body: JSON.stringify(payload) }),
  login: (payload) => request("/auth/login", { method: "POST", body: JSON.stringify(payload) }),
  logout: () => request("/auth/logout", { method: "POST" }),
  me: () => request("/auth/me"),
  updateProfile: (payload) => {
    const fields = ["name", "headline", "university", "course", "year", "location", "bio", "skills", "photo", "banner", "projects", "education", "featured", "portfolioUrl"];
    const profile = Object.fromEntries(fields.filter((field) => field in payload).map((field) => [field, payload[field]]));
    return request("/users/me", { method: "PATCH", body: JSON.stringify(profile) });
  },
  users: (query = "", page = 1, limit = 12) => {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (query) params.set("q", query);
    return request(`/users?${params.toString()}`, {}, true);
  },
  user: (id) => request(`/users/${encodeURIComponent(id)}`),
  userPosts: (id, page = 1, limit = 50) => request(`/users/${encodeURIComponent(id)}/posts?page=${page}&limit=${limit}`),
  userPostsWithMeta: (id, page = 1, limit = 50) => request(`/users/${encodeURIComponent(id)}/posts?page=${page}&limit=${limit}`, {}, true),
  connections: () => request("/connections"),
  requestConnection: (id) => request(`/users/${id}/connections`, { method: "POST" }),
  respondConnection: (id, action) => request(`/connections/${id}`, { method: "PATCH", body: JSON.stringify({ action }) }),
  removeConnection: (id) => request(`/connections/${id}`, { method: "DELETE" }),
  posts: (page = 1, limit = 10) => request(`/posts?page=${page}&limit=${limit}`, {}, true),
  post: (id) => request(`/posts/${encodeURIComponent(id)}`),
  postComments: (id) => request(`/posts/${encodeURIComponent(id)}/comments`),
  createPost: (payload) => request("/posts", { method: "POST", body: JSON.stringify(payload) }),
  updatePost: (id, payload) => request(`/posts/${encodeURIComponent(id)}`, { method: "PATCH", body: JSON.stringify(payload) }),
  deletePost: (id) => request(`/posts/${id}`, { method: "DELETE" }),
  toggleLike: (id) => request(`/posts/${id}/like`, { method: "POST" }),
  comment: (id, text) => request(`/posts/${id}/comments`, { method: "POST", body: JSON.stringify({ text }) }),
  notifications: () => request("/notifications"),
  markNotificationsRead: (id) => request("/notifications/read", { method: "PATCH", body: JSON.stringify(id ? { id } : {}) }),
  dismissNotification: (id) => request(`/notifications/${id}`, { method: "DELETE" }),
  messageInbox: () => request("/messages"),
  messageThread: (userId) => request(`/messages/${encodeURIComponent(userId)}`),
  sendMessage: (userId, text) => request(`/messages/${encodeURIComponent(userId)}`, { method: "POST", body: JSON.stringify({ text }) }),
  imagekitAuth: () => request("/uploads/imagekit/auth"),
};




