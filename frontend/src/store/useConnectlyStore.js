import { create } from "zustand";
import { api } from "../utils/api";

const TTL = {
  connections: 15_000,
  inbox: 7_000,
  notifications: 15_000,
  posts: 12_000,
  students: 20_000,
};

const pending = new Map();

function loadCached({ key, cachedAt, cachedValue, ttl, force, fetcher, onSuccess }) {
  if (!force && cachedValue !== null && Date.now() - cachedAt < ttl) return Promise.resolve(cachedValue);
  if (pending.has(key)) return pending.get(key);

  const request = fetcher()
    .then((value) => {
      onSuccess(value);
      return value;
    })
    .finally(() => pending.delete(key));
  pending.set(key, request);
  return request;
}

export const useConnectlyStore = create((set, get) => ({
  connections: null,
  connectionsAt: 0,
  inbox: null,
  inboxAt: 0,
  notifications: null,
  notificationsAt: 0,
  posts: null,
  postsAt: 0,
  studentsByQuery: {},

  loadConnections: (force = false) => loadCached({
    key: "connections",
    cachedValue: get().connections,
    cachedAt: get().connectionsAt,
    ttl: TTL.connections,
    force,
    fetcher: api.connections,
    onSuccess: (connections) => set({ connections, connectionsAt: Date.now() }),
  }),

  loadInbox: (force = false) => loadCached({
    key: "inbox",
    cachedValue: get().inbox,
    cachedAt: get().inboxAt,
    ttl: TTL.inbox,
    force,
    fetcher: api.messageInbox,
    onSuccess: (inbox) => set({ inbox, inboxAt: Date.now() }),
  }),

  loadNotifications: (force = false) => loadCached({
    key: "notifications",
    cachedValue: get().notifications,
    cachedAt: get().notificationsAt,
    ttl: TTL.notifications,
    force,
    fetcher: api.notifications,
    onSuccess: (notifications) => set({ notifications, notificationsAt: Date.now() }),
  }),

  loadPosts: (force = false) => loadCached({
    key: "posts",
    cachedValue: get().posts,
    cachedAt: get().postsAt,
    ttl: TTL.posts,
    force,
    fetcher: api.posts,
    onSuccess: (posts) => set({ posts, postsAt: Date.now() }),
  }),

  loadStudents: (query = "", force = false) => {
    const normalizedQuery = query.trim();
    const key = `students:${normalizedQuery.toLowerCase()}`;
    const cached = get().studentsByQuery[key];
    return loadCached({
      key,
      cachedValue: cached?.data ?? null,
      cachedAt: cached?.updatedAt ?? 0,
      ttl: TTL.students,
      force,
      fetcher: () => api.users(normalizedQuery),
      onSuccess: (students) => set((state) => ({
        studentsByQuery: { ...state.studentsByQuery, [key]: { data: students, updatedAt: Date.now() } },
      })),
    });
  },

  updateCachedPosts: (posts) => set({ posts, postsAt: Date.now() }),
  updateCachedConnections: (connections) => set({ connections, connectionsAt: Date.now() }),
  updateCachedInbox: (inbox) => set({ inbox, inboxAt: Date.now() }),
  updateCachedNotifications: (notifications) => set({ notifications, notificationsAt: Date.now() }),
}));
