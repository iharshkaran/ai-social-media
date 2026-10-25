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
    <div className="min-h-screen orbit-pattern-bg text-[#17182d]">
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-8 pb-28 sm:px-6 lg:px-8">
        <header className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#6f56d9]">Your student network</p>
            <h1 className="mt-1 text-3xl font-black tracking-[-0.04em] sm:text-4xl">Connections</h1>
            <p className="mt-2 text-sm text-[#6e6a7b]">Manage your connections and invitations in one place.</p>
          </div>
          <Link to="/explore" className="inline-flex w-fit items-center gap-2 rounded-xl border-2 border-[#191a32] bg-[#ffe35b] px-4 py-2.5 text-sm font-semibold text-black shadow-[0_3px_0_#191a32] transition hover:-translate-y-0.5 hover:bg-[#f3d446]"><UserPlus size={16} /> Find students</Link>
        </header>

        <section className="overflow-hidden rounded-[26px] border-2 border-[#191a32] bg-white shadow-[4px_5px_0_#e7dfd0]">
          <div className="border-b border-[#e7dfd0] bg-[#fffdf9] p-4 sm:p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex w-fit max-w-full gap-1 overflow-x-auto rounded-xl border border-[#e7dfd0] bg-white p-1" role="tablist" aria-label="Connection lists">
              {tabs.map((tab) => (
                <button key={tab.id} type="button" role="tab" aria-selected={activeTab === tab.id} onClick={() => setActiveTab(tab.id)} className={`whitespace-nowrap rounded-lg px-3 py-2 text-sm transition sm:px-4 ${activeTab === tab.id ? "bg-[#ffe35b] font-semibold text-[#17182d] shadow-[0_2px_0_#191a32]" : "text-[#6e6a7b] hover:bg-[#f4f0e8] hover:text-[#17182d]"}`}>
                  {tab.label}<span className={`ml-2 rounded-full px-1.5 py-0.5 text-[11px] ${activeTab === tab.id ? "bg-white/80" : "bg-[#f4f0e8]"}`}>{countForTab(tab.id)}</span>
                </button>
              ))}
            </div>
            <label className="flex w-full items-center gap-2 rounded-xl border-2 border-[#e7dfd0] bg-white px-3 transition focus-within:border-[#7660dc] lg:max-w-sm">
              <Search size={16} className="shrink-0 text-[#858191]" />
              <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search people in your network" className="min-w-0 flex-1 bg-transparent py-3 text-sm outline-none placeholder:text-[#a29eac]" />
            </label>
            </div>
            <p className="mt-3 text-xs text-[#858191]">{countForTab(activeTab)} {activeTab === "connections" ? "people in your network" : activeTab === "received" ? "requests waiting for you" : "requests you have sent"}</p>
          </div>

          {error && <p role="alert" className="border-b border-red-400/10 px-5 py-3 text-sm text-[#a33b48]">{error}</p>}
          {loading ? (
            <p className="px-5 py-14 text-center text-sm text-[#6e6a7b]">Loading your network...</p>
          ) : filteredItems.length > 0 ? (
            <div className="grid gap-4 p-4 sm:grid-cols-2 sm:p-5">
              {filteredItems.map((person) => (
                <article key={person.id} className="flex flex-wrap items-center gap-3 rounded-2xl border-2 border-[#191a32] bg-white p-4 shadow-[3px_4px_0_#c9bcff] transition hover:-translate-y-0.5 hover:shadow-[4px_5px_0_#87d4f4] sm:gap-4">
                  <Link to={`/profile/${person.studentId}`} aria-label={`Open ${person.name}'s profile`} className={`flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl border-2 border-[#191a32] font-semibold shadow-[2px_2px_0_#191a32] transition hover:scale-105 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#7660dc]/30 ${activeTab === "connections" ? "bg-[#dff6eb] text-[#28734d]" : "bg-[#eee9ff] text-[#5947a8]"}`}>
                    {person.photo ? <img src={person.photo} alt="" loading="lazy" decoding="async" className="h-full w-full object-cover" /> : person.initials || person.name.split(" ").map((part) => part[0]).join("")}
                  </Link>
                  <div className="min-w-0 flex-1">
                    <h2 className="truncate font-bold"><Link to={`/profile/${person.studentId}`} className="hover:text-[#5947a8]">{person.name}</Link></h2>
                    <p className="mt-1 truncate text-sm text-[#6e6a7b]">{person.role || person.course || person.headline || "OrbitU student"}</p>
                    <span className={`mt-2 inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${activeTab === "connections" ? "bg-[#e8f6ed] text-[#28734d]" : activeTab === "received" ? "bg-[#fff3c4] text-[#805d00]" : "bg-[#eee9ff] text-[#5947a8]"}`}>{activeTab === "connections" ? "Connected" : activeTab === "received" ? "Request received" : "Request sent"}</span>
                  </div>
                  {activeTab === "received" && (
                    <div className="flex w-full gap-2 sm:w-auto">
                      <button type="button" disabled={busyId === person.id} onClick={() => respondToRequest(person, true)} className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border-2 border-[#191a32] bg-[#ffe35b] px-3 py-2 text-xs font-bold text-black shadow-[0_2px_0_#191a32] hover:-translate-y-0.5 disabled:opacity-50 sm:flex-none"><Check size={14} /> Accept</button>
                      <button type="button" disabled={busyId === person.id} onClick={() => respondToRequest(person, false)} className="flex-1 rounded-lg border border-[#e7dfd0] px-3 py-2 text-xs font-medium text-[#514e62] hover:bg-[#f4f0e8] disabled:opacity-50 sm:flex-none">Decline</button>
                    </div>
                  )}
                  {activeTab !== "received" && <button type="button" disabled={busyId === person.id} onClick={() => removeConnection(person)} className="flex w-full items-center justify-center gap-1.5 rounded-lg border-2 border-[#191a32] bg-white px-3 py-2 text-xs font-semibold text-[#514e62] shadow-[0_2px_0_#e7dfd0] transition hover:-translate-y-0.5 hover:border-red-400/60 hover:text-[#a33b48] disabled:opacity-50 sm:w-auto">{activeTab === "sent" ? <><X size={14} /> Cancel request</> : "Remove"}</button>}
                </article>
              ))}
            </div>
          ) : (
            <div className="px-5 py-14 text-center">
              {activeTab === "connections" ? <Users size={32} className="mx-auto text-[#a29eac]" /> : activeTab === "received" ? <UserPlus size={32} className="mx-auto text-[#a29eac]" /> : <UserCheck size={32} className="mx-auto text-[#a29eac]" />}
              <h2 className="mt-4 font-semibold">{search ? "No matches found" : activeTab === "connections" ? "Your network is just getting started" : activeTab === "received" ? "No pending requests" : "No sent requests"}</h2>
              <p className="mt-2 text-sm text-[#858191]">{search ? "Try another name." : "Explore students and build your network."}</p>
              {!search && <Link to="/explore" className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#ffe35b] px-4 py-2.5 text-sm font-semibold text-black hover:bg-[#f3d446]"><UserPlus size={16} /> Explore students</Link>}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}


