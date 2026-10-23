import { useEffect, useState } from "react";
import {
  Award,
  Bell,
  Check,
  FileText,
  Heart,
  MessageCircle,
  UserRound,
  UserPlus,
  X,
} from "lucide-react";
import Navbar from "../components/Navbar";
import {
  NOTIFICATION_EVENT,
  addNotification,
  notificationTime,
  readConnections,
  readNotifications,
  saveConnections,
  saveNotifications,
} from "../utils/socialStore";

const iconMap = {
  connection: UserPlus,
  like: Heart,
  comment: MessageCircle,
  profile: UserRound,
  post: FileText,
  achievement: Award,
};

export default function Notifications() {
  const [items, setItems] = useState(readNotifications);
  const [connections, setConnections] = useState(readConnections);
  const unreadCount = items.filter((item) => !item.read).length;

  useEffect(() => {
    const syncNotifications = (event) => {
      setItems(event.detail || readNotifications());
    };
    const syncOtherTab = () => setItems(readNotifications());
    const syncConnections = (event) => setConnections(event.detail || readConnections());
    const syncOtherTabConnections = () => setConnections(readConnections());

    window.addEventListener(NOTIFICATION_EVENT, syncNotifications);
    window.addEventListener("storage", syncOtherTab);
    window.addEventListener("connectly:connections", syncConnections);
    window.addEventListener("storage", syncOtherTabConnections);
    return () => {
      window.removeEventListener(NOTIFICATION_EVENT, syncNotifications);
      window.removeEventListener("storage", syncOtherTab);
      window.removeEventListener("connectly:connections", syncConnections);
      window.removeEventListener("storage", syncOtherTabConnections);
    };
  }, []);

  function updateItems(nextItems) {
    setItems(nextItems);
    saveNotifications(nextItems);
  }

  function markAllRead() {
    updateItems(items.map((item) => ({ ...item, read: true })));
  }

  function markRead(notificationId) {
    updateItems(items.map((item) => item.id === notificationId ? { ...item, read: true } : item));
  }

  function dismiss(notificationId) {
    updateItems(items.filter((item) => item.id !== notificationId));
  }

  function respondToRequest(request, accept) {
    const person = {
      id: request.studentId ?? request.id,
      name: request.name,
      role: request.role,
      initials: request.initials || request.name.slice(0, 1),
    };
    const next = {
      ...connections,
      incoming: connections.incoming.filter((item) => item.id !== request.id),
      connected: accept && !connections.connected.some((item) => (typeof item === "object" ? item.id : item) === person.id)
        ? [...connections.connected, person]
        : connections.connected,
    };
    setConnections(next);
    saveConnections(next);
    if (accept) {
      addNotification({ type: "connection", title: "You're connected", message: `You and ${request.name} are now connected.` });
    }
  }

  return (
    <div className="min-h-screen bg-[#111] text-white">
      <Navbar />
      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        <header className="flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-yellow-400">STAY IN THE LOOP</p>
            <h1 className="mt-1 text-3xl font-bold">Notifications</h1>
            <p className="mt-2 text-sm text-gray-400">Connection requests and updates from your activity.</p>
          </div>
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={markAllRead}
              className="flex shrink-0 items-center gap-2 rounded-xl border border-white/10 px-3 py-2 text-xs text-gray-300 hover:border-yellow-400 hover:text-yellow-400"
            >
              <Check size={15} /> Mark all read
            </button>
          )}
        </header>

        {connections.incoming.length > 0 && (
          <section className="mt-6 overflow-hidden rounded-2xl border border-white/10 bg-[#1b1b1b]">
            <div className="border-b border-white/[0.06] p-5">
              <h2 className="font-semibold">Connection requests <span className="ml-2 text-xs font-normal text-yellow-300">{connections.incoming.length} pending</span></h2>
            </div>
            {connections.incoming.map((request) => (
              <article key={request.id} className="flex flex-wrap items-center gap-3 border-b border-white/[0.06] p-5 last:border-0">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-pink-400/15 font-semibold text-pink-300">{request.initials || request.name.slice(0, 1)}</div>
                <div className="min-w-0 flex-1"><p className="text-sm font-semibold">{request.name}</p><p className="mt-1 text-sm text-gray-400">{request.role} would like to connect.</p></div>
                {request.sample && <span className="text-xs text-gray-500">Preview request</span>}
                <div className="flex gap-2">
                  <button type="button" onClick={() => respondToRequest(request, true)} className="rounded-lg bg-yellow-400 px-3 py-2 text-xs font-semibold text-black hover:bg-yellow-300">Accept</button>
                  <button type="button" onClick={() => respondToRequest(request, false)} className="rounded-lg border border-white/10 px-3 py-2 text-xs text-gray-300 hover:bg-white/5">Decline</button>
                </div>
              </article>
            ))}
          </section>
        )}

        <section className="mt-6 overflow-hidden rounded-2xl border border-white/10 bg-[#1b1b1b]">
          {items.map((item) => {
            const Icon = iconMap[item.type] || Bell;
            return (
              <article
                key={item.id}
                className={`flex gap-4 border-b border-white/[0.06] p-5 last:border-0 ${item.read ? "" : "bg-yellow-400/[0.04]"}`}
              >
                <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-yellow-400/10 text-yellow-400">
                  <Icon size={19} />
                  {!item.read && <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-yellow-400 ring-2 ring-[#1b1b1b]" />}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold">{item.title}</p>
                  <p className="mt-1 text-sm leading-6 text-gray-300">{item.message}</p>
                  <p className="mt-2 text-xs text-gray-500">{notificationTime(item.createdAt)}</p>
                </div>
                <div className="flex shrink-0 items-start gap-1">
                  {!item.read && (
                    <button type="button" onClick={() => markRead(item.id)} aria-label="Mark notification as read" className="rounded-lg p-2 text-gray-500 hover:bg-white/5 hover:text-yellow-400">
                      <Check size={16} />
                    </button>
                  )}
                  <button type="button" onClick={() => dismiss(item.id)} aria-label="Dismiss notification" className="rounded-lg p-2 text-gray-500 hover:bg-white/5 hover:text-white">
                    <X size={16} />
                  </button>
                </div>
              </article>
            );
          })}

          {items.length === 0 && (
            <div className="px-6 py-16 text-center">
              <Bell size={32} className="mx-auto text-gray-600" />
              <h2 className="mt-4 font-semibold">No recent activity</h2>
              <p className="mt-2 text-sm text-gray-500">Likes, comments and profile updates will show up here.</p>
            </div>
          )}
        </section>
        <p className="mt-4 text-center text-xs text-gray-600">Activity is saved in this browser for the frontend preview.</p>
      </main>
    </div>
  );
}
