import { useEffect, useState } from "react";
import {
  Award,
  Bell,
  Check,
  FileText,
  Heart,
  MessageCircle,
  UserPlus,
  X,
} from "lucide-react";
import Navbar from "../components/Navbar";
import { notificationTime } from "../utils/socialStore";
import { api } from "../utils/api";
import { useConnectlyStore } from "../store/useConnectlyStore";

const iconMap = { connection: UserPlus, like: Heart, comment: MessageCircle, system: Award };
const loadNotificationData = (force = false) => Promise.all([useConnectlyStore.getState().loadNotifications(force), useConnectlyStore.getState().loadConnections(force)]);

export default function Notifications() {
  const [items, setItems] = useState([]);
  const [connections, setConnections] = useState({ incoming: [], outgoing: [], connected: [] });
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState("");
  const [error, setError] = useState("");
  const unreadCount = items.filter((item) => !item.read).length;

  async function refreshData(force = false) {
    try {
      const [notifications, network] = await loadNotificationData(force);
      setItems(notifications);
      setConnections(network);
      setError("");
    } catch (requestError) { setError(requestError.message); }
    finally { setLoading(false); }
  }

  useEffect(() => {
    let active = true;
    loadNotificationData().then(([notifications, network]) => { if (active) { setItems(notifications); setConnections(network); } }).catch((requestError) => { if (active) setError(requestError.message); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  async function markAllRead() {
    setError("");
    try {
      await api.markNotificationsRead();
      setItems((current) => {
        const updated = current.map((item) => ({ ...item, read: true }));
        useConnectlyStore.getState().updateCachedNotifications(updated);
        return updated;
      });
      window.dispatchEvent(new Event("connectly:backend-update"));
    } catch (requestError) { setError(requestError.message); }
  }

  async function markRead(notificationId) {
    setBusyId(notificationId);
    try {
      await api.markNotificationsRead(notificationId);
      setItems((current) => {
        const updated = current.map((item) => item.id === notificationId ? { ...item, read: true } : item);
        useConnectlyStore.getState().updateCachedNotifications(updated);
        return updated;
      });
      window.dispatchEvent(new Event("connectly:backend-update"));
    } catch (requestError) { setError(requestError.message); }
    finally { setBusyId(""); }
  }

  async function dismiss(notificationId) {
    setBusyId(notificationId);
    try {
      await api.dismissNotification(notificationId);
      setItems((current) => {
        const updated = current.filter((item) => item.id !== notificationId);
        useConnectlyStore.getState().updateCachedNotifications(updated);
        return updated;
      });
      window.dispatchEvent(new Event("connectly:backend-update"));
    } catch (requestError) { setError(requestError.message); }
    finally { setBusyId(""); }
  }

  async function respondToRequest(request, accept) {
    setBusyId(request.id);
    try {
      await api.respondConnection(request.id, accept ? "accept" : "reject");
      await refreshData(true);
      window.dispatchEvent(new Event("connectly:backend-update"));
    } catch (requestError) { setError(requestError.message); }
    finally { setBusyId(""); }
  }

  return (
    <div className="min-h-screen bg-[#111] text-white">
      <Navbar />
      {error && <p role="alert" className="mx-auto max-w-3xl px-4 pt-4 text-sm text-red-300 sm:px-6 lg:px-8">{error}</p>}
      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        <header className="flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-yellow-400">STAY IN THE LOOP</p>
            <h1 className="mt-1 text-3xl font-bold">Notifications</h1>
            <p className="mt-2 text-sm text-gray-400">Connection requests and updates from your activity.</p>
          </div>
          {unreadCount > 0 && <button type="button" onClick={markAllRead} className="flex shrink-0 items-center gap-2 rounded-xl border border-white/10 px-3 py-2 text-xs text-gray-300 hover:border-yellow-400 hover:text-yellow-400"><Check size={15} /> Mark all read</button>}
        </header>

        {connections.incoming.length > 0 && (
          <section className="mt-6 overflow-hidden rounded-2xl border border-white/10 bg-[#1b1b1b]">
            <div className="border-b border-white/[0.06] p-5"><h2 className="font-semibold">Connection requests <span className="ml-2 text-xs font-normal text-yellow-300">{connections.incoming.length} pending</span></h2></div>
            {connections.incoming.map((request) => (
              <article key={request.id} className="flex flex-wrap items-center gap-3 border-b border-white/[0.06] p-5 last:border-0">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-pink-400/15 font-semibold text-pink-300">{request.photo ? <img src={request.photo} alt="" loading="lazy" decoding="async" className="h-full w-full object-cover" /> : request.initials || request.name.slice(0, 1)}</div>
                <div className="min-w-0 flex-1"><p className="text-sm font-semibold">{request.name}</p><p className="mt-1 text-sm text-gray-400">{request.role} would like to connect.</p></div>
                <div className="flex gap-2">
                  <button type="button" disabled={busyId === request.id} onClick={() => respondToRequest(request, true)} className="rounded-lg bg-yellow-400 px-3 py-2 text-xs font-semibold text-black hover:bg-yellow-300 disabled:opacity-50">Accept</button>
                  <button type="button" disabled={busyId === request.id} onClick={() => respondToRequest(request, false)} className="rounded-lg border border-white/10 px-3 py-2 text-xs text-gray-300 hover:bg-white/5 disabled:opacity-50">Decline</button>
                </div>
              </article>
            ))}
          </section>
        )}

        <section className="mt-6 overflow-hidden rounded-2xl border border-white/10 bg-[#1b1b1b]">
          {loading ? <p className="px-6 py-14 text-center text-sm text-gray-400">Loading notifications...</p> : items.map((item) => {
            const Icon = iconMap[item.type] || (item.type === "post" ? FileText : Bell);
            return (
              <article key={item.id} className={`flex gap-4 border-b border-white/[0.06] p-5 last:border-0 ${item.read ? "" : "bg-yellow-400/[0.04]"}`}>
                <div className="relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-yellow-400/10 text-yellow-400">
                  {item.photo ? <img src={item.photo} alt="" loading="lazy" decoding="async" className="h-full w-full object-cover" /> : <Icon size={19} />}
                  {!item.read && <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-yellow-400 ring-2 ring-[#1b1b1b]" />}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold">{item.title}</p>
                  <p className="mt-1 text-sm leading-6 text-gray-300">{item.message}</p>
                  <p className="mt-2 text-xs text-gray-500">{notificationTime(item.createdAt)}</p>
                </div>
                <div className="flex shrink-0 items-start gap-1">
                  {!item.read && <button type="button" disabled={busyId === item.id} onClick={() => markRead(item.id)} aria-label="Mark notification as read" className="rounded-lg p-2 text-gray-500 hover:bg-white/5 hover:text-yellow-400 disabled:opacity-50"><Check size={16} /></button>}
                  <button type="button" disabled={busyId === item.id} onClick={() => dismiss(item.id)} aria-label="Dismiss notification" className="rounded-lg p-2 text-gray-500 hover:bg-white/5 hover:text-white disabled:opacity-50"><X size={16} /></button>
                </div>
              </article>
            );
          })}
          {!loading && items.length === 0 && <div className="px-6 py-16 text-center"><Bell size={32} className="mx-auto text-gray-600" /><h2 className="mt-4 font-semibold">No recent activity</h2><p className="mt-2 text-sm text-gray-500">Likes, comments and connection updates will show up here.</p></div>}
        </section>
      </main>
    </div>
  );
}

