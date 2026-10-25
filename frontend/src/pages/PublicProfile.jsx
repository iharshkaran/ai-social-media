import { useCallback, useEffect, useState } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, BriefcaseBusiness, Check, GraduationCap, MapPin, MessageCircle, UserPlus, X } from "lucide-react";
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
    <main className="mx-auto max-w-4xl px-4 py-7 sm:px-6 lg:px-8">
      <Link to="/explore" className="mb-5 inline-flex items-center gap-2 text-sm text-[#6e6a7b] hover:text-[#5947a8]"><ArrowLeft size={16} /> Back to Explore</Link>
      {error && <p role="alert" className="mb-4 rounded-xl border border-red-400/20 bg-red-400/5 px-4 py-3 text-sm text-[#a33b48]">{error}</p>}
      {loading ? <div className="rounded-2xl border border-[#e7dfd0] bg-white p-10 text-center text-sm text-[#6e6a7b]">Loading student profile...</div> : profile ? <>
        <section className="overflow-hidden rounded-2xl border border-[#e7dfd0] bg-white">
          <div className="h-36 bg-gradient-to-r from-[#c9bcff] via-[#ffafd0] to-[#87d4f4] sm:h-48" />
          <div className="px-5 pb-6 sm:px-8">
            <div className="-mt-12 flex flex-wrap items-end justify-between gap-4">
              <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-3xl border-4 border-white bg-[#f0ebdf] text-2xl font-bold text-[#5947a8]">
                {profile.photo ? <img src={profile.photo} alt={`${profile.name}'s profile`} decoding="async" className="h-full w-full object-cover" /> : profile.name?.split(/\s+/).map((part) => part[0]).join("").slice(0, 2)}
              </div>
              <div className="flex flex-wrap gap-2">
                {connected ? <>
                  <span className="inline-flex items-center gap-2 rounded-xl border border-green-400/20 bg-green-400/10 px-4 py-2.5 text-sm font-semibold text-[#28734d]"><Check size={16} /> Connected</span>
                  <button type="button" onClick={() => navigate("/messages")} className="inline-flex items-center gap-2 rounded-xl border border-[#e7dfd0] px-4 py-2.5 text-sm font-semibold text-[#343247] hover:border-[#d9cffb] hover:text-[#5947a8]"><MessageCircle size={16} /> Message</button>
                </> : incoming ? <>
                  <button type="button" disabled={busy} onClick={() => updateConnection("accept")} className="inline-flex items-center gap-2 rounded-xl bg-[#ffe35b] px-4 py-2.5 text-sm font-semibold text-black hover:bg-[#f3d446] disabled:opacity-50"><Check size={16} /> Accept request</button>
                  <button type="button" disabled={busy} onClick={() => updateConnection("reject")} className="inline-flex items-center gap-2 rounded-xl border border-[#e7dfd0] px-4 py-2.5 text-sm text-[#514e62] hover:bg-[#f4f0e8] disabled:opacity-50"><X size={16} /> Decline</button>
                </> : <button type="button" disabled={busy} onClick={() => updateConnection(outgoing ? "cancel" : "request")} className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold disabled:opacity-50 ${outgoing ? "border border-[#d9cffb] bg-[#eee9ff] text-[#5947a8] hover:bg-red-400/10 hover:text-[#a33b48]" : "bg-[#ffe35b] text-black hover:bg-[#f3d446]"}`}><UserPlus size={16} /> {busy ? "Please wait..." : outgoing ? "Request sent · Cancel" : "Connect"}</button>}
              </div>
            </div>
            <h1 className="mt-5 text-2xl font-bold">{profile.name}</h1>
            <p className="mt-1 text-sm text-[#514e62]">{profile.headline || "OrbitU student"}</p>
            {(profile.course || profile.year || profile.university) && <p className="mt-3 flex items-center gap-2 text-sm text-[#6e6a7b]"><GraduationCap size={16} className="shrink-0 text-[#6f56d9]" /> {[profile.course, profile.year, profile.university].filter(Boolean).join(" · ")}</p>}
            {profile.location && <p className="mt-2 flex items-center gap-2 text-sm text-[#6e6a7b]"><MapPin size={15} className="text-[#6f56d9]" /> {profile.location}</p>}
            {profile.bio && <div className="mt-6 border-t border-[#e7dfd0] pt-5"><h2 className="font-semibold">About</h2><p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-[#6e6a7b]">{profile.bio}</p></div>}
            {profile.skills?.length > 0 && <div className="mt-6 border-t border-[#e7dfd0] pt-5"><h2 className="font-semibold">Skills</h2><div className="mt-3 flex flex-wrap gap-2">{profile.skills.map((skill) => <span key={skill} className="rounded-full border border-[#e7dfd0] bg-[#f4f0e8] px-3 py-1.5 text-xs text-[#514e62]">{skill}</span>)}</div></div>}
            {profile.portfolioUrl && <a href={profile.portfolioUrl} target="_blank" rel="noreferrer" className="mt-5 inline-flex items-center gap-2 text-sm text-[#6f56d9] hover:text-[#5947a8]"><BriefcaseBusiness size={16} /> View portfolio</a>}
          </div>
        </section>

        <ProfileSections profile={profile} posts={posts} />

        <section className="mt-6">
          <div className="mb-4 flex items-end justify-between"><div><p className="text-sm font-semibold text-[#6f56d9]">UPDATES</p><h2 className="mt-1 text-xl font-bold">{profile.name.split(" ")[0]}'s posts</h2></div><span className="text-sm text-[#858191]">{posts.length}</span></div>
          <ProfilePostGrid posts={posts} />
        </section>
      </> : <div className="rounded-2xl border border-[#e7dfd0] bg-white px-5 py-12 text-center"><p className="font-semibold">Profile unavailable</p><p className="mt-2 text-sm text-[#6e6a7b]">This student profile could not be loaded.</p></div>}
    </main>
  </div>;
}
