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
    <div className="min-h-screen orbit-pattern-bg text-[#17182d]">
      <Navbar />
      {error && <p role="alert" className="mx-auto max-w-3xl px-4 pt-4 text-sm text-[#a33b48] sm:px-6 lg:px-8">{error}</p>}
      <main className="mx-auto max-w-3xl px-4 py-8 pb-28 sm:px-6 lg:px-8">
        <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-3xl font-black tracking-[-0.04em] sm:text-4xl">A little good news?</h1>
              <p className="mt-2 text-sm text-[#6e6a7b]">Connection requests and updates from your OrbitU community.</p>
            </div>
            {unreadCount > 0 && <button type="button" onClick={markAllRead} className="flex w-fit shrink-0 items-center gap-2 rounded-xl border-2 border-[#191a32] bg-white px-3 py-2.5 text-xs font-semibold text-[#514e62] shadow-[0_3px_0_#c9bcff] transition hover:-translate-y-0.5"><Check size={15} /> Mark all read</button>}
        </header>

        {connections.incoming.length > 0 && (
          <section className="mt-6 overflow-hidden rounded-[26px] border-2 border-[#191a32] bg-white shadow-[4px_5px_0_#ffafd0]">
            <div className="border-b border-[#e7dfd0] p-5"><h2 className="font-bold">Connection requests <span className="ml-2 rounded-full bg-[#ffedf3] px-2.5 py-1 text-xs font-semibold text-[#843454]">{connections.incoming.length} pending</span></h2></div>
            {connections.incoming.map((request) => (
              <article key={request.id} className="flex flex-wrap items-center gap-3 border-b border-[#e7dfd0] p-5 last:border-0">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-2xl border-2 border-[#191a32] bg-[#ffafd0] font-bold text-[#843454]">{request.photo ? <img src={request.photo} alt="" loading="lazy" decoding="async" className="h-full w-full object-cover" /> : request.initials || request.name.slice(0, 1)}</div>
                <div className="min-w-0 flex-1"><p className="text-sm font-semibold">{request.name}</p><p className="mt-1 text-sm text-[#6e6a7b]">{request.role} would like to connect.</p></div>
                <div className="flex gap-2">
                  <button type="button" disabled={busyId === request.id} onClick={() => respondToRequest(request, true)} className="rounded-lg border-2 border-[#191a32] bg-[#ffe35b] px-3 py-2 text-xs font-bold text-black shadow-[0_2px_0_#191a32] hover:-translate-y-0.5 disabled:opacity-50">Accept</button>
                  <button type="button" disabled={busyId === request.id} onClick={() => respondToRequest(request, false)} className="rounded-lg border border-[#e7dfd0] px-3 py-2 text-xs text-[#514e62] hover:bg-[#f4f0e8] disabled:opacity-50">Decline</button>
                </div>
              </article>
            ))}
          </section>
        )}

        <section className="mt-6 overflow-hidden rounded-[26px] border-2 border-[#191a32] bg-white shadow-[4px_5px_0_#e7dfd0]">
          {loading ? <p className="px-6 py-14 text-center text-sm text-[#6e6a7b]">Loading notifications...</p> : items.map((item) => {
            const Icon = iconMap[item.type] || (item.type === "post" ? FileText : Bell);
            return (
              <article key={item.id} className={`flex gap-4 border-b border-[#e7dfd0] p-5 last:border-0 ${item.read ? "bg-white" : "bg-[#fff9e8]"}`}>
                <div className="relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-2xl border-2 border-[#191a32] bg-[#c9bcff] text-[#5947a8]">
                  {item.photo ? <img src={item.photo} alt="" loading="lazy" decoding="async" className="h-full w-full object-cover" /> : <Icon size={19} />}
                  {!item.read && <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-[#ffe35b] ring-2 ring-white" />}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold">{item.title}</p>
                  <p className="mt-1 text-sm leading-6 text-[#514e62]">{item.message}</p>
                  <p className="mt-2 text-xs text-[#858191]">{notificationTime(item.createdAt)}</p>
                </div>
                <div className="flex shrink-0 items-start gap-1">
                  {!item.read && <button type="button" disabled={busyId === item.id} onClick={() => markRead(item.id)} aria-label="Mark notification as read" className="rounded-lg p-2 text-[#858191] hover:bg-[#f4f0e8] hover:text-[#6f56d9] disabled:opacity-50"><Check size={16} /></button>}
                  <button type="button" disabled={busyId === item.id} onClick={() => dismiss(item.id)} aria-label="Dismiss notification" className="rounded-lg p-2 text-[#858191] hover:bg-[#f4f0e8] hover:text-[#17182d] disabled:opacity-50"><X size={16} /></button>
                </div>
              </article>
            );
          })}
          {!loading && items.length === 0 && <div className="px-6 py-16 text-center"><span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border-2 border-[#191a32] bg-[#fff3b7] text-[#5947a8] shadow-[3px_4px_0_#191a32]"><Bell size={30} /></span><h2 className="mt-5 font-bold">No recent activity</h2><p className="mt-2 text-sm text-[#858191]">Likes, comments and connection updates will show up here.</p></div>}
        </section>
      </main>
    </div>
  );
}

