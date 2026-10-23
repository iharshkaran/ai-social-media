import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Check, Search, UserCheck, UserPlus, Users, X } from "lucide-react";
import Navbar from "../components/Navbar";
import students from "../data/students";
import { addNotification, readConnections, saveConnections } from "../utils/socialStore";

const tabs = [
  { id: "connections", label: "Connections" },
  { id: "received", label: "Received" },
  { id: "sent", label: "Sent" },
];

function getPerson(connection) {
  if (typeof connection === "object") return connection;
  return students.find((student) => student.id === connection);
}

export default function Connections() {
  const [connections, setConnections] = useState(readConnections);
  const [activeTab, setActiveTab] = useState("connections");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const syncConnections = (event) => setConnections(event.detail || readConnections());
    const syncOtherTab = () => setConnections(readConnections());
    window.addEventListener("connectly:connections", syncConnections);
    window.addEventListener("storage", syncOtherTab);
    return () => {
      window.removeEventListener("connectly:connections", syncConnections);
      window.removeEventListener("storage", syncOtherTab);
    };
  }, []);

  const connectedPeople = useMemo(
    () => connections.connected.map(getPerson).filter(Boolean),
    [connections.connected],
  );
  const sentRequests = useMemo(
    () => Object.entries(connections.outgoing)
      .filter(([, status]) => status === "pending")
      .map(([id]) => students.find((student) => String(student.id) === id))
      .filter(Boolean),
    [connections.outgoing],
  );
  const sourceItems = activeTab === "connections"
    ? connectedPeople
    : activeTab === "received"
      ? connections.incoming
      : sentRequests;
  const filteredItems = sourceItems.filter((person) => person.name.toLowerCase().includes(search.trim().toLowerCase()));

  function save(next) {
    setConnections(next);
    saveConnections(next);
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
    save(next);
    if (accept) {
      addNotification({ type: "connection", title: "You're connected", message: `You and ${request.name} are now connected.` });
    }
  }

  function cancelRequest(student) {
    const outgoing = { ...connections.outgoing };
    delete outgoing[student.id];
    save({ ...connections, outgoing });
  }

  function removeConnection(person) {
    const next = {
      ...connections,
      connected: connections.connected.filter((item) => (typeof item === "object" ? item.id : item) !== person.id),
    };
    save(next);
    addNotification({ type: "connection", title: "Connection removed", message: `${person.name} was removed from your network.` });
  }

  const countForTab = (tabId) => tabId === "connections"
    ? connectedPeople.length
    : tabId === "received"
      ? connections.incoming.length
      : sentRequests.length;

  return (
    <div className="min-h-screen bg-[#111] text-white">
      <Navbar />
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <header className="mb-7">
          <p className="text-sm font-semibold text-yellow-400">YOUR STUDENT NETWORK</p>
          <h1 className="mt-1 text-3xl font-bold">Connections</h1>
          <p className="mt-2 text-sm text-gray-400">Manage your connections and invitations in one place.</p>
        </header>

        <section className="overflow-hidden rounded-2xl border border-white/10 bg-[#1b1b1b]">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/[0.06] px-4 py-3 sm:px-5">
            <div className="flex gap-1 overflow-x-auto" role="tablist" aria-label="Connection lists">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={activeTab === tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`whitespace-nowrap rounded-lg px-3 py-2 text-sm transition ${activeTab === tab.id ? "bg-yellow-400/10 font-semibold text-yellow-300" : "text-gray-400 hover:bg-white/[0.04] hover:text-white"}`}
                >
                  {tab.label} <span className="ml-1 text-xs opacity-70">{countForTab(tab.id)}</span>
                </button>
              ))}
            </div>
            <label className="flex w-full items-center gap-2 rounded-xl border border-white/10 bg-[#202020] px-3 sm:max-w-xs">
              <Search size={16} className="shrink-0 text-gray-500" />
              <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search this list" className="min-w-0 flex-1 bg-transparent py-2.5 text-sm outline-none" />
            </label>
          </div>

          {filteredItems.length > 0 ? (
            <div className="divide-y divide-white/[0.06]">
              {filteredItems.map((person) => (
                <article key={person.id} className="flex flex-wrap items-center gap-3 px-4 py-4 sm:px-5">
                  <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full font-semibold ${activeTab === "connections" ? "bg-green-400/10 text-green-300" : "bg-yellow-400/10 text-yellow-300"}`}>
                    {person.initials || person.name.split(" ").map((part) => part[0]).join("")}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h2 className="truncate text-sm font-semibold">{person.name}</h2>
                    <p className="mt-1 truncate text-sm text-gray-400">{person.role || person.course}</p>
                    {person.sample && <p className="mt-1 text-xs text-gray-500">Preview request</p>}
                  </div>
                  {activeTab === "received" && (
                    <div className="flex gap-2">
                      <button type="button" onClick={() => respondToRequest(person, true)} className="flex items-center gap-1.5 rounded-lg bg-yellow-400 px-3 py-2 text-xs font-semibold text-black hover:bg-yellow-300"><Check size={14} /> Accept</button>
                      <button type="button" onClick={() => respondToRequest(person, false)} className="rounded-lg border border-white/10 px-3 py-2 text-xs text-gray-300 hover:bg-white/5">Decline</button>
                    </div>
                  )}
                  {activeTab === "sent" && <button type="button" onClick={() => cancelRequest(person)} className="flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-2 text-xs text-gray-300 hover:border-red-400/40 hover:text-red-300"><X size={14} /> Cancel</button>}
                  {activeTab === "connections" && <button type="button" onClick={() => removeConnection(person)} className="rounded-lg border border-white/10 px-3 py-2 text-xs text-gray-300 hover:border-red-400/40 hover:text-red-300">Remove</button>}
                </article>
              ))}
            </div>
          ) : (
            <div className="px-5 py-14 text-center">
              {activeTab === "connections" ? <Users size={32} className="mx-auto text-gray-600" /> : activeTab === "received" ? <UserPlus size={32} className="mx-auto text-gray-600" /> : <UserCheck size={32} className="mx-auto text-gray-600" />}
              <h2 className="mt-4 font-semibold">{search ? "No matches found" : activeTab === "connections" ? "Your network is just getting started" : activeTab === "received" ? "No pending requests" : "No sent requests"}</h2>
              <p className="mt-2 text-sm text-gray-500">{search ? "Try another name." : "Explore students and build your network."}</p>
              {!search && <Link to="/explore" className="mt-5 inline-flex items-center gap-2 rounded-xl bg-yellow-400 px-4 py-2.5 text-sm font-semibold text-black hover:bg-yellow-300"><UserPlus size={16} /> Explore students</Link>}
            </div>
          )}
        </section>
        <p className="mt-4 text-center text-xs text-gray-600">Connection changes are saved in this browser for the frontend preview.</p>
      </main>
    </div>
  );
}
