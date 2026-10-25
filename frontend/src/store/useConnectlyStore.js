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
  postsPage: 0,
  postsHasMore: false,
  ownPostCount: null,
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

  loadPosts: async (force = false) => {
    const result = await loadCached({
      key: "posts",
      cachedValue: get().posts,
      cachedAt: get().postsAt,
      ttl: TTL.posts,
      force,
      fetcher: () => api.posts(1, 10),
      onSuccess: ({ data, page, hasMore, ownPostCount }) => set({
        posts: data,
        postsAt: Date.now(),
        postsPage: page,
        postsHasMore: hasMore,
        ownPostCount,
      }),
    });
    return Array.isArray(result) ? result : result.data;
  },

  loadMorePosts: async () => {
    if (!get().postsHasMore) return [];
    const page = get().postsPage + 1;
    const result = await loadCached({
      key: `posts:${page}`,
      cachedValue: null,
      cachedAt: 0,
      ttl: TTL.posts,
      force: false,
      fetcher: () => api.posts(page, 10),
      onSuccess: ({ data, hasMore }) => set((state) => {
        const existingIds = new Set((state.posts || []).map((post) => post.id));
        const nextPosts = [...(state.posts || []), ...data.filter((post) => !existingIds.has(post.id))];
        return { posts: nextPosts, postsAt: Date.now(), postsPage: page, postsHasMore: hasMore };
      }),
    });
    return result.data;
  },

  loadStudents: (query = "", force = false, page = 1) => {
    const normalizedQuery = query.trim();
    const key = `students:${normalizedQuery.toLowerCase()}:${page}`;
    const cached = get().studentsByQuery[key];
    return loadCached({
      key,
      cachedValue: cached?.data ?? null,
      cachedAt: cached?.updatedAt ?? 0,
      ttl: TTL.students,
      force,
      fetcher: () => api.users(normalizedQuery, page, 12),
      onSuccess: (result) => set((state) => ({
        studentsByQuery: { ...state.studentsByQuery, [key]: { data: result, updatedAt: Date.now() } },
      })),
    });
  },

  updateCachedPosts: (posts) => set({ posts, postsAt: Date.now() }),
  updateCachedConnections: (connections) => set({ connections, connectionsAt: Date.now() }),
  updateCachedInbox: (inbox) => set({ inbox, inboxAt: Date.now() }),
  updateCachedNotifications: (notifications) => set({ notifications, notificationsAt: Date.now() }),
}));
