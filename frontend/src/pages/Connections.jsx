import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Check, Search, UserCheck, UserPlus, Users, X } from "lucide-react";
import Navbar from "../components/Navbar";
import { api } from "../utils/api";
import { useConnectlyStore } from "../store/useConnectlyStore";

const tabs = [
  { id: "connections", label: "Connections" },
  { id: "received", label: "Received" },
  { id: "sent", label: "Sent" },
];
const emptyConnections = { incoming: [], outgoing: [], connected: [] };

export default function Connections() {
  const [connections, setConnections] = useState(emptyConnections);
  const [activeTab, setActiveTab] = useState("connections");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState("");
  const [error, setError] = useState("");

  async function refreshConnections(force = false) {
    try {
      setConnections(await useConnectlyStore.getState().loadConnections(force));
      setError("");
    } catch (requestError) { setError(requestError.message); }
    finally { setLoading(false); }
  }

  useEffect(() => {
    let active = true;
    useConnectlyStore.getState().loadConnections().then((data) => { if (active) setConnections(data); }).catch((requestError) => { if (active) setError(requestError.message); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const connectedPeople = connections.connected;
  const sentRequests = connections.outgoing;
  const sourceItems = activeTab === "connections"
    ? connectedPeople
    : activeTab === "received"
      ? connections.incoming
      : sentRequests;
  const filteredItems = sourceItems.filter((person) => person.name.toLowerCase().includes(search.trim().toLowerCase()));

  async function respondToRequest(request, accept) {
    setBusyId(request.id);
    try {
      await api.respondConnection(request.id, accept ? "accept" : "reject");
      await refreshConnections(true);
      window.dispatchEvent(new Event("connectly:backend-update"));
    } catch (requestError) { setError(requestError.message); }
    finally { setBusyId(""); }
  }

  async function removeConnection(person) {
    setBusyId(person.id);
    try {
      await api.removeConnection(person.id);
      await refreshConnections(true);
      window.dispatchEvent(new Event("connectly:backend-update"));
    } catch (requestError) { setError(requestError.message); }
    finally { setBusyId(""); }
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
                <button key={tab.id} type="button" role="tab" aria-selected={activeTab === tab.id} onClick={() => setActiveTab(tab.id)} className={`whitespace-nowrap rounded-lg px-3 py-2 text-sm transition ${activeTab === tab.id ? "bg-yellow-400/10 font-semibold text-yellow-300" : "text-gray-400 hover:bg-white/[0.04] hover:text-white"}`}>
                  {tab.label} <span className="ml-1 text-xs opacity-70">{countForTab(tab.id)}</span>
                </button>
              ))}
            </div>
            <label className="flex w-full items-center gap-2 rounded-xl border border-white/10 bg-[#202020] px-3 sm:max-w-xs">
              <Search size={16} className="shrink-0 text-gray-500" />
              <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search this list" className="min-w-0 flex-1 bg-transparent py-2.5 text-sm outline-none" />
            </label>
          </div>

          {error && <p role="alert" className="border-b border-red-400/10 px-5 py-3 text-sm text-red-300">{error}</p>}
          {loading ? (
            <p className="px-5 py-14 text-center text-sm text-gray-400">Loading your network...</p>
          ) : filteredItems.length > 0 ? (
            <div className="divide-y divide-white/[0.06]">
              {filteredItems.map((person) => (
                <article key={person.id} className="flex flex-wrap items-center gap-3 px-4 py-4 sm:px-5">
                  <div className={`flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full font-semibold ${activeTab === "connections" ? "bg-green-400/10 text-green-300" : "bg-yellow-400/10 text-yellow-300"}`}>
                    {person.photo ? <img src={person.photo} alt="" loading="lazy" decoding="async" className="h-full w-full object-cover" /> : person.initials || person.name.split(" ").map((part) => part[0]).join("")}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h2 className="truncate text-sm font-semibold">{person.name}</h2>
                    <p className="mt-1 truncate text-sm text-gray-400">{person.role || person.course || person.headline}</p>
                  </div>
                  {activeTab === "received" && (
                    <div className="flex gap-2">
                      <button type="button" disabled={busyId === person.id} onClick={() => respondToRequest(person, true)} className="flex items-center gap-1.5 rounded-lg bg-yellow-400 px-3 py-2 text-xs font-semibold text-black hover:bg-yellow-300 disabled:opacity-50"><Check size={14} /> Accept</button>
                      <button type="button" disabled={busyId === person.id} onClick={() => respondToRequest(person, false)} className="rounded-lg border border-white/10 px-3 py-2 text-xs text-gray-300 hover:bg-white/5 disabled:opacity-50">Decline</button>
                    </div>
                  )}
                  {activeTab !== "received" && <button type="button" disabled={busyId === person.id} onClick={() => removeConnection(person)} className="flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-2 text-xs text-gray-300 hover:border-red-400/40 hover:text-red-300 disabled:opacity-50">{activeTab === "sent" ? <><X size={14} /> Cancel</> : "Remove"}</button>}
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
      </main>
    </div>
  );
}


