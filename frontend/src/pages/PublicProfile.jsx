import { useCallback, useEffect, useState } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, BriefcaseBusiness, Check, GraduationCap, MapPin, MessageCircle, UserPlus, X } from "lucide-react";
import Navbar from "../components/Navbar";
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

  return <div className="min-h-screen bg-[#111111] text-white">
    <Navbar />
    <main className="mx-auto max-w-4xl px-4 py-7 sm:px-6 lg:px-8">
      <Link to="/explore" className="mb-5 inline-flex items-center gap-2 text-sm text-gray-400 hover:text-yellow-300"><ArrowLeft size={16} /> Back to Explore</Link>
      {error && <p role="alert" className="mb-4 rounded-xl border border-red-400/20 bg-red-400/5 px-4 py-3 text-sm text-red-300">{error}</p>}
      {loading ? <div className="rounded-2xl border border-white/10 bg-[#1b1b1b] p-10 text-center text-sm text-gray-400">Loading student profile...</div> : profile ? <>
        <section className="overflow-hidden rounded-2xl border border-white/10 bg-[#1b1b1b]">
          <div className="h-36 bg-gradient-to-r from-yellow-500/30 via-yellow-400/10 to-[#242424] sm:h-48" />
          <div className="px-5 pb-6 sm:px-8">
            <div className="-mt-12 flex flex-wrap items-end justify-between gap-4">
              <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-3xl border-4 border-[#1b1b1b] bg-[#303030] text-2xl font-bold text-yellow-300">
                {profile.photo ? <img src={profile.photo} alt={`${profile.name}'s profile`} className="h-full w-full object-cover" /> : profile.name?.split(/\s+/).map((part) => part[0]).join("").slice(0, 2)}
              </div>
              <div className="flex flex-wrap gap-2">
                {connected ? <>
                  <span className="inline-flex items-center gap-2 rounded-xl border border-green-400/20 bg-green-400/10 px-4 py-2.5 text-sm font-semibold text-green-300"><Check size={16} /> Connected</span>
                  <button type="button" onClick={() => navigate("/messages")} className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-4 py-2.5 text-sm font-semibold text-gray-200 hover:border-yellow-400/50 hover:text-yellow-300"><MessageCircle size={16} /> Message</button>
                </> : incoming ? <>
                  <button type="button" disabled={busy} onClick={() => updateConnection("accept")} className="inline-flex items-center gap-2 rounded-xl bg-yellow-400 px-4 py-2.5 text-sm font-semibold text-black hover:bg-yellow-300 disabled:opacity-50"><Check size={16} /> Accept request</button>
                  <button type="button" disabled={busy} onClick={() => updateConnection("reject")} className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-4 py-2.5 text-sm text-gray-300 hover:bg-white/5 disabled:opacity-50"><X size={16} /> Decline</button>
                </> : <button type="button" disabled={busy} onClick={() => updateConnection(outgoing ? "cancel" : "request")} className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold disabled:opacity-50 ${outgoing ? "border border-yellow-400/30 bg-yellow-400/10 text-yellow-300 hover:bg-red-400/10 hover:text-red-300" : "bg-yellow-400 text-black hover:bg-yellow-300"}`}><UserPlus size={16} /> {busy ? "Please wait..." : outgoing ? "Request sent · Cancel" : "Connect"}</button>}
              </div>
            </div>
            <h1 className="mt-5 text-2xl font-bold">{profile.name}</h1>
            <p className="mt-1 text-sm text-gray-300">{profile.headline || "Connectly student"}</p>
            {(profile.course || profile.year || profile.university) && <p className="mt-3 flex items-center gap-2 text-sm text-gray-400"><GraduationCap size={16} className="shrink-0 text-yellow-400" /> {[profile.course, profile.year, profile.university].filter(Boolean).join(" · ")}</p>}
            {profile.location && <p className="mt-2 flex items-center gap-2 text-sm text-gray-400"><MapPin size={15} className="text-yellow-400" /> {profile.location}</p>}
            {profile.bio && <div className="mt-6 border-t border-white/10 pt-5"><h2 className="font-semibold">About</h2><p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-gray-400">{profile.bio}</p></div>}
            {profile.skills?.length > 0 && <div className="mt-6 border-t border-white/10 pt-5"><h2 className="font-semibold">Skills</h2><div className="mt-3 flex flex-wrap gap-2">{profile.skills.map((skill) => <span key={skill} className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-gray-300">{skill}</span>)}</div></div>}
            {profile.portfolioUrl && <a href={profile.portfolioUrl} target="_blank" rel="noreferrer" className="mt-5 inline-flex items-center gap-2 text-sm text-yellow-400 hover:text-yellow-300"><BriefcaseBusiness size={16} /> View portfolio</a>}
          </div>
        </section>

        <section className="mt-6">
          <div className="mb-4 flex items-end justify-between"><div><p className="text-sm font-semibold text-yellow-400">UPDATES</p><h2 className="mt-1 text-xl font-bold">{profile.name.split(" ")[0]}'s posts</h2></div><span className="text-sm text-gray-500">{posts.length}</span></div>
          {posts.length ? <div className="space-y-4">{posts.map((post) => <article key={post.id} className="rounded-2xl border border-white/10 bg-[#1b1b1b] p-5"><div className="flex items-center justify-between gap-3"><span className="text-sm font-semibold">{post.name}</span><span className="rounded-full bg-white/[0.06] px-2.5 py-1 text-xs text-gray-400">{post.category || "General"}</span></div><p className="mt-1 text-xs text-gray-500">{post.time ? new Date(post.time).toLocaleString() : ""}</p>{post.text && <p className="mt-4 whitespace-pre-wrap break-words text-sm leading-7 text-gray-200">{post.text}</p>}{post.image && <img src={post.image} alt="Shared by this student" className="mt-4 max-h-[480px] w-full rounded-xl border border-white/10 object-contain" />}<p className="mt-4 border-t border-white/10 pt-3 text-xs text-gray-500">{post.likes} likes · {post.comments.length} comments</p></article>)}</div> : <div className="rounded-2xl border border-white/10 bg-[#1b1b1b] px-5 py-12 text-center text-sm text-gray-500">{profile.name.split(" ")[0]} has not shared any posts yet.</div>}
        </section>
      </> : <div className="rounded-2xl border border-white/10 bg-[#1b1b1b] px-5 py-12 text-center"><p className="font-semibold">Profile unavailable</p><p className="mt-2 text-sm text-gray-400">This student profile could not be loaded.</p></div>}
    </main>
  </div>;
}
