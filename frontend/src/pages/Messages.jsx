import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Search, Send, MessageCircle } from "lucide-react";
import Navbar from "../components/Navbar";
import { api } from "../utils/api";
import { useConnectlyStore } from "../store/useConnectlyStore";

function mergeChats(network, inbox) {
  const inboxItems = Array.isArray(inbox) ? inbox : [];
  const connectedItems = Array.isArray(network?.connected) ? network.connected : [];
  const inboxById = new Map(inboxItems.map((chat) => [chat.userId, chat]));
  const connected = connectedItems.map((person) => ({
    ...person,
    userId: person.studentId,
    lastMessage: inboxById.get(person.studentId)?.lastMessage || "Start a conversation",
    unreadCount: inboxById.get(person.studentId)?.unreadCount || 0,
  }));
  const known = new Set(connected.map((chat) => chat.userId));
  return [...inboxItems.filter((chat) => !known.has(chat.userId)), ...connected];
}

export default function Messages() {
  const cachedConnections = useConnectlyStore.getState().connections;
  const cachedInbox = useConnectlyStore.getState().inbox;
  const [chats, setChats] = useState(() => mergeChats(cachedConnections, cachedInbox));
  const [activeId, setActiveId] = useState("");
  const [messages, setMessages] = useState([]);
  const [query, setQuery] = useState("");
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(() => cachedConnections === null && cachedInbox === null);
  const [threadLoading, setThreadLoading] = useState(false);
  const [error, setError] = useState("");
  const active = chats.find((chat) => chat.userId === activeId);
  const visibleChats = useMemo(() => chats.filter((chat) => chat.name.toLowerCase().includes(query.toLowerCase())), [chats, query]);

  useEffect(() => {
    let mounted = true;
    const refreshInbox = () => Promise.all([useConnectlyStore.getState().loadConnections(), useConnectlyStore.getState().loadInbox()])
      .then(([network, inbox]) => {
        if (!mounted) return;
        setChats(mergeChats(network, inbox));
        setError("");
      })
      .catch((requestError) => { if (mounted) setError(requestError.message); })
      .finally(() => { if (mounted) setLoading(false); });
    refreshInbox();
    const timer = window.setInterval(refreshInbox, 15000);
    return () => { mounted = false; window.clearInterval(timer); };
  }, []);

  useEffect(() => {
    if (!activeId) return undefined;
    let mounted = true;
    const load = () => api.messageThread(activeId)
      .then((items) => { if (mounted) { setMessages(items); setChats((current) => current.map((chat) => chat.userId === activeId ? { ...chat, unreadCount: 0 } : chat)); setError(""); } })
      .catch((requestError) => { if (mounted) setError(requestError.message); })
      .finally(() => { if (mounted) setThreadLoading(false); });
    load();
    const timer = window.setInterval(load, 15000);
    return () => { mounted = false; window.clearInterval(timer); };
  }, [activeId]);

  async function sendMessage(event) {
    event.preventDefault();
    const text = draft.trim();
    if (!text || !active) return;
    setError("");
    try {
      const message = await api.sendMessage(activeId, text);
      useConnectlyStore.getState().loadInbox(true).catch(() => {});
      setMessages((current) => [...current, message]);
      setChats((current) => current.map((chat) => chat.userId === activeId ? { ...chat, lastMessage: text } : chat));
      setDraft("");
      window.dispatchEvent(new Event("connectly:backend-update"));
    } catch (requestError) { setError(requestError.message); }
  }

  return <div className="min-h-screen orbit-pattern-bg text-[#17182d]"><Navbar /><main className="mx-auto max-w-6xl px-4 py-8 pb-28 sm:px-6 lg:px-8">
    {error && <p role="alert" className="mb-4 rounded-xl border border-red-400/20 bg-red-400/5 px-4 py-3 text-sm text-[#a33b48]">{error}</p>}
    <section className="grid min-h-[720px] overflow-hidden rounded-[26px] border-2 border-[#191a32] bg-white shadow-[4px_5px_0_#c9bcff] lg:min-h-[calc(100vh-12rem)] md:grid-cols-[300px_1fr]">
      <aside className={`${activeId ? "hidden md:block" : "block"} min-w-0 border-b border-[#e7dfd0] bg-[#fffdf9] md:border-b-0 md:border-r`}>
        <div className="border-b border-[#e7dfd0] p-4">
          <h1 className="mb-3 text-lg font-extrabold">Connections</h1>
          <label className="flex items-center gap-2 rounded-2xl border-2 border-[#e7dfd0] bg-white px-3 focus-within:border-[#7660dc]"><Search size={16} className="text-[#858191]"/><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search connections" className="w-full bg-transparent py-3 text-sm outline-none"/></label>
        </div>
        {visibleChats.map((chat) => <button key={chat.userId} onClick={() => { if (activeId !== chat.userId) { setMessages([]); setThreadLoading(true); } setActiveId(chat.userId); }} className={`flex w-full items-start gap-3 border-b border-[#e7dfd0] p-4 text-left transition hover:bg-[#f4f0e8] ${activeId === chat.userId ? "bg-[#eee9ff]" : ""}`}><span className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-2xl border-2 border-[#191a32] bg-[#ffafd0] font-bold text-[#843454]">{chat.photo ? <img src={chat.photo} alt="" loading="lazy" decoding="async" className="h-full w-full object-cover"/> : chat.initials || chat.name.split(" ").map((part) => part[0]).join("")}</span><span className="min-w-0 flex-1"><span className="block font-semibold">{chat.name}</span><span className="mt-1 block truncate text-xs text-[#6e6a7b]">{chat.lastMessage}</span></span>{chat.unreadCount > 0 && <span className="rounded-full border border-[#191a32] bg-[#ffe35b] px-2 py-0.5 text-[10px] font-bold text-black">{chat.unreadCount}</span>}</button>)}
        {!loading && !visibleChats.length && <div className="p-5 text-sm text-[#858191]">{query ? "No matching conversations." : <>You can message accepted connections. <Link to="/explore" className="font-semibold text-[#6f56d9] hover:text-[#5947a8]">Explore students</Link></>}</div>}
        {loading && <p className="p-5 text-sm text-[#858191]">Loading conversations...</p>}
      </aside>
      {active ? <div className="flex min-h-[500px] min-w-0 flex-col"><header className="flex items-center gap-3 border-b border-[#e7dfd0] bg-white p-4"><button type="button" onClick={() => { setActiveId(""); setMessages([]); setDraft(""); setError(""); }} aria-label="Back to connections" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[#e7dfd0] text-[#514e62] transition hover:bg-[#f4f0e8] md:hidden"><ArrowLeft size={18} /></button><span className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-2xl border-2 border-[#191a32] bg-[#c9bcff] font-bold text-[#5947a8]">{active.photo ? <img src={active.photo} alt="" decoding="async" className="h-full w-full object-cover"/> : active.name.split(" ").map((part) => part[0]).join("")}</span><div className="min-w-0"><h2 className="truncate font-bold">{active.name}</h2><p className="truncate text-xs text-[#6e6a7b]">{active.role || "OrbitU student"}</p></div></header><div className="flex flex-1 flex-col gap-3 overflow-y-auto bg-[#fffdf9] p-5">{threadLoading && messages.length === 0 ? <p className="text-center text-sm text-[#858191]">Loading conversation...</p> : messages.map((message) => <div key={message.id} className={`max-w-[80%] rounded-2xl border-2 border-[#191a32] px-4 py-3 text-sm leading-6 ${message.from === "you" ? "self-end rounded-br-sm bg-[#ffe35b] text-[#17182d] shadow-[2px_3px_0_#c9bcff]" : "rounded-bl-sm bg-[#eee9ff] text-[#343247]"}`}>{message.text}</div>)}{!threadLoading && messages.length === 0 && <p className="m-auto text-center text-sm text-[#858191]">Say hello and start the conversation.</p>}</div><form onSubmit={sendMessage} className="flex gap-2 border-t border-[#e7dfd0] bg-white p-4"><input value={draft} onChange={(e) => setDraft(e.target.value)} maxLength={2000} placeholder={`Message ${active.name.split(" ")[0]}...`} className="min-w-0 flex-1 rounded-2xl border-2 border-[#e7dfd0] bg-[#fffdf9] px-4 py-3 text-sm outline-none focus:border-[#7660dc]"/><button disabled={!draft.trim()} aria-label="Send message" className="flex items-center gap-2 rounded-xl border-2 border-[#191a32] bg-[#ffe35b] px-4 font-bold text-black shadow-[0_3px_0_#191a32] transition hover:-translate-y-0.5 disabled:opacity-50"><Send size={17}/><span className="hidden sm:inline">Send</span></button></form></div> : <div className="hidden min-h-[500px] flex-col items-center justify-center bg-[#fffdf9] p-8 text-center text-[#858191] md:flex"><span className="flex h-16 w-16 items-center justify-center rounded-2xl border-2 border-[#191a32] bg-[#c9bcff] text-[#5947a8] shadow-[3px_4px_0_#191a32]"><MessageCircle size={30}/></span><p className="mt-5 font-semibold text-[#514e62]">Choose a conversation to get started.</p><p className="mt-1 text-sm">A quick hello can turn into something great.</p></div>}
    </section>
  </main></div>;
}
