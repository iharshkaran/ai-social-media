import { useMemo, useState } from "react";
import { Search, Send, MessageCircle } from "lucide-react";
import Navbar from "../components/Navbar";

const starterChats = [
  { id: 1, name: "Riya Singh", role: "UI/UX Designer · Delhi", color: "bg-pink-400/15 text-pink-300", messages: [{ from: "them", text: "Hey! I saw your post about the campus project. Would love to collaborate." }] },
  { id: 2, name: "Arjun Mehta", role: "B.Tech CSE · 3rd Year", color: "bg-blue-400/15 text-blue-300", messages: [{ from: "them", text: "Are you joining the hackathon this weekend?" }] },
  { id: 3, name: "Neha Gupta", role: "Frontend Developer · BCA", color: "bg-purple-400/15 text-purple-300", messages: [{ from: "them", text: "Thanks for connecting! What are you building these days?" }] },
];

export default function Messages() {
  const [chats, setChats] = useState(starterChats);
  const [activeId, setActiveId] = useState(1);
  const [query, setQuery] = useState("");
  const [draft, setDraft] = useState("");
  const active = chats.find((chat) => chat.id === activeId);
  const visibleChats = useMemo(() => chats.filter((chat) => chat.name.toLowerCase().includes(query.toLowerCase())), [chats, query]);

  function sendMessage(event) {
    event.preventDefault();
    const text = draft.trim();
    if (!text || !active) return;
    setChats((items) => items.map((chat) => chat.id === activeId ? { ...chat, messages: [...chat.messages, { from: "you", text }] } : chat));
    setDraft("");
  }

  return <div className="min-h-screen bg-[#111] text-white"><Navbar /><main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
    <div className="mb-6"><p className="text-sm font-semibold text-yellow-400">YOUR NETWORK</p><h1 className="mt-1 text-3xl font-bold">Messages</h1><p className="mt-2 text-sm text-gray-400">Keep conversations and collaborations moving.</p></div>
    <section className="grid min-h-[620px] overflow-hidden rounded-2xl border border-white/10 bg-[#1b1b1b] md:grid-cols-[300px_1fr]">
      <aside className="border-b border-white/10 md:border-b-0 md:border-r"><div className="border-b border-white/10 p-4"><label className="flex items-center gap-2 rounded-xl border border-white/10 bg-[#202020] px-3"><Search size={16} className="text-gray-500"/><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search messages" className="w-full bg-transparent py-3 text-sm outline-none"/></label></div>
        {visibleChats.map((chat) => <button key={chat.id} onClick={() => setActiveId(chat.id)} className={`flex w-full items-start gap-3 border-b border-white/[0.06] p-4 text-left hover:bg-white/[0.04] ${activeId === chat.id ? "bg-yellow-400/[0.06]" : ""}`}><span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full font-semibold ${chat.color}`}>{chat.name.split(" ").map((part) => part[0]).join("")}</span><span className="min-w-0"><span className="block font-medium">{chat.name}</span><span className="mt-1 block truncate text-xs text-gray-400">{chat.messages.at(-1)?.text}</span></span></button>)}
        {!visibleChats.length && <p className="p-5 text-sm text-gray-500">No conversations found.</p>}
      </aside>
      {active ? <div className="flex min-h-[500px] flex-col"><header className="flex items-center gap-3 border-b border-white/10 p-4"><span className={`flex h-10 w-10 items-center justify-center rounded-full font-semibold ${active.color}`}>{active.name.split(" ").map((part) => part[0]).join("")}</span><div><h2 className="font-semibold">{active.name}</h2><p className="text-xs text-gray-400">{active.role}</p></div></header><div className="flex flex-1 flex-col gap-3 overflow-y-auto p-5">{active.messages.map((message, index) => <div key={`${active.id}-${index}`} className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-6 ${message.from === "you" ? "self-end rounded-br-sm bg-yellow-400 text-black" : "rounded-bl-sm bg-white/[0.06] text-gray-200"}`}>{message.text}</div>)}<p className="mt-auto pt-8 text-center text-xs text-gray-600">This is a local frontend preview. Messages are not sent to other users.</p></div><form onSubmit={sendMessage} className="flex gap-2 border-t border-white/10 p-4"><input value={draft} onChange={(e) => setDraft(e.target.value)} placeholder={`Message ${active.name.split(" ")[0]}...`} className="min-w-0 flex-1 rounded-xl border border-white/10 bg-[#202020] px-4 py-3 text-sm outline-none focus:border-yellow-400"/><button aria-label="Send message" className="flex items-center gap-2 rounded-xl bg-yellow-400 px-4 font-semibold text-black hover:bg-yellow-300"><Send size={17}/><span className="hidden sm:inline">Send</span></button></form></div> : <div className="flex flex-col items-center justify-center p-8 text-center text-gray-500"><MessageCircle size={34}/><p className="mt-3">Choose a conversation to get started.</p></div>}
    </section>
  </main></div>;
}
