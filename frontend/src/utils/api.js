const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

async function request(path, options = {}, includeMetadata = false) {
  const response = await fetch(`${API_BASE}${path}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json", ...options.headers },
    ...options,
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.message || "Could not connect to Connectly. Please try again.");
  return includeMetadata ? body : body.data ?? body;
}

export const api = {
  register: (payload) => request("/auth/register", { method: "POST", body: JSON.stringify(payload) }),
  login: (payload) => request("/auth/login", { method: "POST", body: JSON.stringify(payload) }),
  logout: () => request("/auth/logout", { method: "POST" }),
  me: () => request("/auth/me"),
  updateProfile: (payload) => {
    const fields = ["name", "headline", "university", "course", "year", "location", "bio", "skills", "photo", "portfolioUrl"];
    const profile = Object.fromEntries(fields.filter((field) => field in payload).map((field) => [field, payload[field]]));
    return request("/users/me", { method: "PATCH", body: JSON.stringify(profile) });
  },
  users: (query = "", page = 1, limit = 12) => {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (query) params.set("q", query);
    return request(`/users?${params.toString()}`, {}, true);
  },
  user: (id) => request(`/users/${encodeURIComponent(id)}`),
  userPosts: (id) => request(`/users/${encodeURIComponent(id)}/posts`),
  connections: () => request("/connections"),
  requestConnection: (id) => request(`/users/${id}/connections`, { method: "POST" }),
  respondConnection: (id, action) => request(`/connections/${id}`, { method: "PATCH", body: JSON.stringify({ action }) }),
  removeConnection: (id) => request(`/connections/${id}`, { method: "DELETE" }),
  posts: (page = 1, limit = 10) => request(`/posts?page=${page}&limit=${limit}`, {}, true),
  createPost: (payload) => request("/posts", { method: "POST", body: JSON.stringify(payload) }),
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




