import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Search, Send, MessageCircle } from "lucide-react";
import Navbar from "../components/Navbar";
import { api } from "../utils/api";
import { useConnectlyStore } from "../store/useConnectlyStore";

export default function Messages() {
  const [chats, setChats] = useState([]);
  const [activeId, setActiveId] = useState("");
  const [messages, setMessages] = useState([]);
  const [query, setQuery] = useState("");
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(true);
  const [threadLoading, setThreadLoading] = useState(false);
  const [error, setError] = useState("");
  const active = chats.find((chat) => chat.userId === activeId);
  const visibleChats = useMemo(() => chats.filter((chat) => chat.name.toLowerCase().includes(query.toLowerCase())), [chats, query]);

  useEffect(() => {
    let mounted = true;
    const refreshInbox = () => Promise.all([useConnectlyStore.getState().loadConnections(), useConnectlyStore.getState().loadInbox()])
      .then(([network, inbox]) => {
        if (!mounted) return;
        const inboxById = new Map(inbox.map((chat) => [chat.userId, chat]));
        const connected = network.connected.map((person) => ({ ...person, userId: person.studentId, lastMessage: inboxById.get(person.studentId)?.lastMessage || "Start a conversation", unreadCount: inboxById.get(person.studentId)?.unreadCount || 0 }));
        const known = new Set(connected.map((chat) => chat.userId));
        setChats([...inbox.filter((chat) => !known.has(chat.userId)), ...connected]);
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

  return <div className="min-h-screen bg-[#111] text-white"><Navbar /><main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
    <div className="mb-6"><p className="text-sm font-semibold text-yellow-400">YOUR NETWORK</p><h1 className="mt-1 text-3xl font-bold">Messages</h1><p className="mt-2 text-sm text-gray-400">Keep conversations and collaborations moving.</p></div>
    {error && <p role="alert" className="mb-4 rounded-xl border border-red-400/20 bg-red-400/5 px-4 py-3 text-sm text-red-300">{error}</p>}
    <section className="grid min-h-[620px] overflow-hidden rounded-2xl border border-white/10 bg-[#1b1b1b] md:grid-cols-[300px_1fr]">
      <aside className="border-b border-white/10 md:border-b-0 md:border-r"><div className="border-b border-white/10 p-4"><label className="flex items-center gap-2 rounded-xl border border-white/10 bg-[#202020] px-3"><Search size={16} className="text-gray-500"/><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search messages" className="w-full bg-transparent py-3 text-sm outline-none"/></label></div>
        {visibleChats.map((chat) => <button key={chat.userId} onClick={() => { if (activeId !== chat.userId) { setMessages([]); setThreadLoading(true); } setActiveId(chat.userId); }} className={`flex w-full items-start gap-3 border-b border-white/[0.06] p-4 text-left hover:bg-white/[0.04] ${activeId === chat.userId ? "bg-yellow-400/[0.06]" : ""}`}><span className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-pink-400/15 font-semibold text-pink-300">{chat.photo ? <img src={chat.photo} alt="" loading="lazy" decoding="async" className="h-full w-full rounded-full object-cover"/> : chat.initials || chat.name.split(" ").map((part) => part[0]).join("")}</span><span className="min-w-0 flex-1"><span className="block font-medium">{chat.name}</span><span className="mt-1 block truncate text-xs text-gray-400">{chat.lastMessage}</span></span>{chat.unreadCount > 0 && <span className="rounded-full bg-yellow-400 px-2 py-0.5 text-[10px] font-bold text-black">{chat.unreadCount}</span>}</button>)}
        {!loading && !visibleChats.length && <div className="p-5 text-sm text-gray-500">{query ? "No matching conversations." : <>You can message accepted connections. <Link to="/explore" className="text-yellow-400 hover:text-yellow-300">Explore students</Link></>}</div>}
        {loading && <p className="p-5 text-sm text-gray-500">Loading conversations...</p>}
      </aside>
      {active ? <div className="flex min-h-[500px] flex-col"><header className="flex items-center gap-3 border-b border-white/10 p-4"><span className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-pink-400/15 font-semibold text-pink-300">{active.photo ? <img src={active.photo} alt="" decoding="async" className="h-full w-full object-cover"/> : active.name.split(" ").map((part) => part[0]).join("")}</span><div><h2 className="font-semibold">{active.name}</h2><p className="text-xs text-gray-400">{active.role || "Connectly student"}</p></div></header><div className="flex flex-1 flex-col gap-3 overflow-y-auto p-5">{threadLoading && messages.length === 0 ? <p className="text-center text-sm text-gray-500">Loading conversation...</p> : messages.map((message) => <div key={message.id} className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-6 ${message.from === "you" ? "self-end rounded-br-sm bg-yellow-400 text-black" : "rounded-bl-sm bg-white/[0.06] text-gray-200"}`}>{message.text}</div>)}{!threadLoading && messages.length === 0 && <p className="m-auto text-center text-sm text-gray-500">Say hello and start the conversation.</p>}</div><form onSubmit={sendMessage} className="flex gap-2 border-t border-white/10 p-4"><input value={draft} onChange={(e) => setDraft(e.target.value)} maxLength={2000} placeholder={`Message ${active.name.split(" ")[0]}...`} className="min-w-0 flex-1 rounded-xl border border-white/10 bg-[#202020] px-4 py-3 text-sm outline-none focus:border-yellow-400"/><button disabled={!draft.trim()} aria-label="Send message" className="flex items-center gap-2 rounded-xl bg-yellow-400 px-4 font-semibold text-black hover:bg-yellow-300 disabled:opacity-50"><Send size={17}/><span className="hidden sm:inline">Send</span></button></form></div> : <div className="flex flex-col items-center justify-center p-8 text-center text-gray-500"><MessageCircle size={34}/><p className="mt-3">Choose a conversation to get started.</p></div>}
    </section>
  </main></div>;
}
