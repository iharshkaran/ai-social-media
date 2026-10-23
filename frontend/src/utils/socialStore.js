const NOTIFICATIONS_KEY = "connectly-notifications";
const CONNECTIONS_KEY = "connectly-connections";
const NOTIFICATION_EVENT = "connectly:notifications";

export function readStoredJSON(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

export function readNotifications() {
  return readStoredJSON(NOTIFICATIONS_KEY, []);
}

export function addNotification(notification) {
  const item = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    createdAt: new Date().toISOString(),
    read: false,
    ...notification,
  };
  const items = [item, ...readNotifications()].slice(0, 100);

  try {
    localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(items));
    window.dispatchEvent(new CustomEvent(NOTIFICATION_EVENT, { detail: items }));
  } catch {
    // The page interaction still works when browser storage is unavailable.
  }

  return item;
}

export function saveNotifications(items) {
  try {
    localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(items));
    window.dispatchEvent(new CustomEvent(NOTIFICATION_EVENT, { detail: items }));
  } catch {
    // Keep notification controls usable for the current page session.
  }
}

export function readConnections() {
  const saved = readStoredJSON(CONNECTIONS_KEY, null);
  if (saved && Array.isArray(saved.incoming) && Array.isArray(saved.connected)) {
    return { outgoing: {}, ...saved };
  }

  const legacyRequests = readStoredJSON("connectly-requests", {});
  return {
    outgoing: legacyRequests,
    incoming: [
      {
        id: "sample-riya-request",
        studentId: 7,
        name: "Riya Singh",
        role: "B.Tech · Web Development",
        initials: "RS",
        sample: true,
      },
    ],
    connected: [],
  };
}

export function saveConnections(connections) {
  try {
    localStorage.setItem(CONNECTIONS_KEY, JSON.stringify(connections));
    localStorage.setItem("connectly-requests", JSON.stringify(connections.outgoing));
    window.dispatchEvent(new CustomEvent("connectly:connections", { detail: connections }));
  } catch {
    // Keep connection controls usable for the current page session.
  }
}

export function notificationTime(value) {
  const date = new Date(value);
  const seconds = Math.max(0, Math.floor((Date.now() - date.getTime()) / 1000));
  if (seconds < 60) return "Just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return date.toLocaleDateString();
}

export { NOTIFICATION_EVENT };
