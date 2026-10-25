import { useCallback, useEffect, useState } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, BriefcaseBusiness, Check, FileText, GraduationCap, MapPin, MessageCircle, UserPlus, Users, X, ExternalLink } from "lucide-react";
import Navbar from "../components/Navbar";
import ProfileSections from "../components/ProfileSections";
import ProfilePostGrid from "../components/ProfilePostGrid";
import { useAuth } from "../context/useAuth";
import { api } from "../utils/api";
import { useConnectlyStore } from "../store/useConnectlyStore";

const emptyConnections = { incoming: [], outgoing: [], connected: [] };

export default function PublicProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [connections, setConnections] = useState(emptyConnections);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const refresh = useCallback(async (forceConnections = false) => {
    try {
      const [{ user: student }, studentPosts, network] = await Promise.all([
        api.user(id),
        api.userPosts(id),
        useConnectlyStore.getState().loadConnections(forceConnections),
      ]);
      setProfile(student);
      setPosts(studentPosts);
      setConnections(network);
      setError("");
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    const timer = window.setTimeout(refresh, 0);
    return () => window.clearTimeout(timer);
  }, [refresh]);

  if (user?.id === id) return <Navigate to="/profile" replace />;

  const incoming = connections.incoming.find((request) => request.studentId === id);
  const outgoing = connections.outgoing.find((request) => request.studentId === id);
  const connected = connections.connected.some((connection) => connection.studentId === id);

  async function updateConnection(action) {
    setBusy(true);
    setError("");
    try {
      if (incoming && (action === "accept" || action === "reject")) {
        await api.respondConnection(incoming.id, action);
      } else if (outgoing && action === "cancel") {
        await api.removeConnection(outgoing.id);
      } else if (action === "request") {
        await api.requestConnection(id);
      }
      await refresh(true);
      window.dispatchEvent(new Event("connectly:backend-update"));
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  }

  return <div className="min-h-screen orbit-pattern-bg text-[#17182d]">
    <Navbar />
    <main className="mx-auto max-w-5xl px-4 py-7 pb-28 sm:px-6 lg:px-8">
      <Link to="/explore" className="mb-5 inline-flex items-center gap-2 text-sm text-[#6e6a7b] hover:text-[#5947a8]"><ArrowLeft size={16} /> Back to Explore</Link>
      {error && <p role="alert" className="mb-4 rounded-xl border border-red-400/20 bg-red-400/5 px-4 py-3 text-sm text-[#a33b48]">{error}</p>}
      {loading ? <div className="rounded-[28px] border-2 border-[#191a32] bg-white p-10 text-center text-sm text-[#6e6a7b] shadow-[4px_5px_0_#c9bcff]">Loading student profile...</div> : profile ? <>
        <section className="overflow-hidden rounded-[28px] border-2 border-[#191a32] bg-white shadow-[4px_5px_0_#c9bcff]">
          <div className="relative h-36 overflow-hidden bg-gradient-to-r from-[#c9bcff] via-[#ffafd0] to-[#87d4f4] sm:h-48">{profile.banner && <img src={profile.banner} alt={`${profile.name}'s profile banner`} decoding="async" className="absolute inset-0 h-full w-full object-cover" />}</div>
          <div className="px-5 pb-6 sm:px-8">
            <div className="-mt-12 flex flex-wrap items-end justify-between gap-4">
              <div className="relative z-10 flex h-32 w-32 items-center justify-center overflow-hidden rounded-[28px] border-4 border-white bg-[#fff3b7] text-3xl font-bold text-[#6f56d9] shadow-[0_0_0_2px_#191a32]">
                {profile.photo ? <img src={profile.photo} alt={`${profile.name}'s profile`} decoding="async" className="h-full w-full object-cover" /> : profile.name?.split(/\s+/).map((part) => part[0]).join("").slice(0, 2)}
              </div>
              <div className="flex flex-wrap gap-2">
                {connected ? <>
                  <span className="inline-flex items-center gap-2 rounded-xl border-2 border-[#191a32] bg-[#e7f7ed] px-4 py-2.5 text-sm font-semibold text-[#28734d] shadow-[0_2px_0_#191a32]"><Check size={16} /> Connected</span>
                  <button type="button" onClick={() => navigate("/messages")} className="inline-flex items-center gap-2 rounded-xl border-2 border-[#191a32] bg-white px-4 py-2.5 text-sm font-semibold text-[#343247] shadow-[0_2px_0_#c9bcff] hover:text-[#5947a8]"><MessageCircle size={16} /> Message</button>
                </> : incoming ? <>
                  <button type="button" disabled={busy} onClick={() => updateConnection("accept")} className="inline-flex items-center gap-2 rounded-xl border-2 border-[#191a32] bg-[#ffe35b] px-4 py-2.5 text-sm font-semibold text-black shadow-[0_2px_0_#191a32] disabled:opacity-50"><Check size={16} /> Accept request</button>
                  <button type="button" disabled={busy} onClick={() => updateConnection("reject")} className="inline-flex items-center gap-2 rounded-xl border-2 border-[#191a32] bg-white px-4 py-2.5 text-sm text-[#514e62] shadow-[0_2px_0_#c9bcff] disabled:opacity-50"><X size={16} /> Decline</button>
                </> : <button type="button" disabled={busy} onClick={() => updateConnection(outgoing ? "cancel" : "request")} className={`inline-flex items-center gap-2 rounded-xl border-2 border-[#191a32] px-4 py-2.5 text-sm font-semibold shadow-[0_3px_0_#191a32] disabled:opacity-50 ${outgoing ? "bg-[#eee9ff] text-[#5947a8] hover:bg-red-50 hover:text-[#a33b48]" : "bg-[#ffe35b] text-black hover:bg-[#f3d446]"}`}><UserPlus size={16} /> {busy ? "Please wait..." : outgoing ? "Request sent · Cancel" : "Connect"}</button>}
              </div>
            </div>
            <div className="mt-5"><h1 className="text-2xl font-black tracking-tight">{profile.name}</h1><p className="mt-1 text-sm text-[#6e6a7b]">{profile.headline || "OrbitU student"}</p>
              {(profile.course || profile.year || profile.university) && <p className="mt-3 flex items-center gap-2 text-sm text-[#514e62]"><GraduationCap size={17} className="shrink-0 text-[#6f56d9]" /> {[profile.course, profile.year, profile.university].filter(Boolean).join(" · ")}</p>}
              {profile.location && <p className="mt-2 flex items-center gap-2 text-sm text-[#6e6a7b]"><MapPin size={16} className="shrink-0 text-[#6f56d9]" /> {profile.location}</p>}
            </div>
            <div className="mt-5 grid max-w-lg grid-cols-2 gap-3">
              <div className="flex items-center gap-3 rounded-2xl border-2 border-[#191a32] bg-[#fff3b7] p-3.5 shadow-[2px_3px_0_#191a32] sm:p-4"><span className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#191a32]/15 bg-white/70 text-[#5947a8]"><FileText size={19} /></span><span><strong className="block text-xl leading-none">{posts.length}</strong><span className="mt-1 block text-xs text-[#6e6a7b]">Posts</span></span></div>
              <div className="flex items-center gap-3 rounded-2xl border-2 border-[#191a32] bg-[#eee9ff] p-3.5 shadow-[2px_3px_0_#191a32] sm:p-4"><span className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#191a32]/15 bg-white/70 text-[#5947a8]"><Users size={19} /></span><span><strong className="block text-xl leading-none">{profile.connectionCount || 0}</strong><span className="mt-1 block text-xs text-[#6e6a7b]">Connections</span></span></div>
            </div>
            <section className="mt-7 rounded-[22px] border-2 border-[#191a32] bg-[#fffdf9] p-5 shadow-[3px_4px_0_#c9bcff]">
              <h2 className="font-bold">About</h2><p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-[#6e6a7b]">{profile.bio || "This student hasn’t added an introduction yet."}</p>
              <div className="mt-5 border-t border-[#e7dfd0] pt-4"><h3 className="text-sm font-bold">Things I can do</h3><div className="mt-3 flex flex-wrap gap-2">{profile.skills?.length ? profile.skills.map((skill) => <span key={skill} className="rounded-xl border border-[#e7dfd0] bg-[#eee9ff] px-4 py-2 text-sm font-medium text-[#5947a8]">{skill}</span>) : <p className="text-sm text-[#858191]">No skills added yet.</p>}</div></div>
            </section>
          </div>
        </section>

        <ProfileSections profile={profile} posts={posts} />

        {profile.portfolioUrl && <section className="mt-5 rounded-[24px] border-2 border-[#191a32] bg-[#fff3b7] p-5 shadow-[3px_4px_0_#191a32]"><h2 className="font-bold">Find me around the web</h2><a href={profile.portfolioUrl} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-2 break-all text-sm font-medium text-[#6f56d9] hover:text-[#5947a8]"><BriefcaseBusiness size={16} /> {profile.portfolioUrl} <ExternalLink size={14} /></a></section>}

        <section className="mt-8 scroll-mt-24 rounded-[28px] border-2 border-[#191a32] bg-white p-5 shadow-[4px_5px_0_#c9bcff] sm:p-8">
          <div className="mb-5 flex items-end justify-between gap-3 border-b-2 border-[#191a32] pb-4"><div><p className="inline-flex rounded-full bg-[#eee9ff] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-[#5947a8]">Activity</p><h2 className="mt-2 text-2xl font-black tracking-[-0.03em]">Posts</h2><p className="mt-1 text-sm text-[#858191]">Updates shared with their network.</p></div><span className="shrink-0 rounded-full border-2 border-[#191a32] bg-[#fff3b7] px-3 py-1.5 text-xs font-bold text-[#17182d]">{posts.length} total</span></div>
          <ProfilePostGrid posts={posts} />
        </section>
      </> : <div className="rounded-2xl border border-[#e7dfd0] bg-white px-5 py-12 text-center"><p className="font-semibold">Profile unavailable</p><p className="mt-2 text-sm text-[#6e6a7b]">This student profile could not be loaded.</p></div>}
    </main>
  </div>;
}
