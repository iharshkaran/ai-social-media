import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, ExternalLink, FileText, Heart, MessageCircle, Send, Share2 } from "lucide-react";
import Navbar from "../components/Navbar";
import { api } from "../utils/api";
import { useAuth } from "../context/useAuth";
import { notificationTime } from "../utils/socialStore";

function PostDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [shareFeedback, setShareFeedback] = useState("");

  useEffect(() => {
    let active = true;
    setLoading(true);
    Promise.all([api.post(id), api.postComments(id)])
      .then(([item, savedComments]) => { if (active) { setPost(item); setComments(savedComments); setError(""); } })
      .catch((requestError) => { if (active) setError(requestError.message); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [id]);

  async function toggleLike() {
    if (!post) return;
    setBusy(true);
    try {
      const result = await api.toggleLike(post.id);
      setPost((current) => ({ ...current, likes: result.likes, liked: result.liked }));
    } catch (requestError) { setError(requestError.message); }
    finally { setBusy(false); }
  }

  async function submitComment(event) {
    event.preventDefault();
    const text = draft.trim();
    if (!text || !post) return;
    setBusy(true);
    try {
      const saved = await api.comment(post.id, text);
      setComments((current) => [...current, saved]);
      setDraft("");
      window.dispatchEvent(new Event("connectly:backend-update"));
    } catch (requestError) { setError(requestError.message); }
    finally { setBusy(false); }
  }

  async function sharePost() {
    try {
      if (navigator.share) await navigator.share({ title: `${post.name}'s post on OrbitU`, url: window.location.href });
      else {
        await navigator.clipboard.writeText(window.location.href);
        setShareFeedback("Link copied");
        window.setTimeout(() => setShareFeedback(""), 1800);
      }
    } catch (shareError) {
      if (shareError.name !== "AbortError") setError("Could not share this post.");
    }
  }

  const profileLink = post?.authorId === user?.id ? "/profile" : `/profile/${post?.authorId}`;
  const hasMedia = Boolean(post?.image || post?.mediaUrl);

  return <div className="min-h-screen orbit-pattern-bg text-[#17182d]"><Navbar /><main className="mx-auto max-w-6xl px-4 py-6 pb-28 sm:px-6 lg:px-8">
    <Link to={profileLink} className="mb-5 inline-flex items-center gap-2 rounded-lg px-2 py-2 text-sm font-semibold text-[#514e62] hover:bg-white/70 hover:text-[#5947a8]"><ArrowLeft size={17} /> Back to profile</Link>
    {error && <p role="alert" className="mb-4 rounded-xl border border-red-400/20 bg-white px-4 py-3 text-sm text-[#a33b48]">{error}</p>}
    {loading ? <div className="rounded-[26px] border-2 border-[#191a32] bg-white p-12 text-center text-sm text-[#6e6a7b] shadow-[4px_5px_0_#c9bcff]">Loading post…</div> : post ? <article className="mx-auto grid max-w-6xl overflow-hidden rounded-[26px] border-2 border-[#191a32] bg-white shadow-[5px_6px_0_#c9bcff] lg:grid-cols-[3fr_2fr]">
      <div className="flex min-w-0 flex-col border-b border-[#e7dfd0] lg:border-b-0 lg:border-r">
        <header className="flex items-center gap-3 border-b border-[#e7dfd0] p-4 sm:p-5"><Link to={profileLink} className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-[#191a32] bg-[#eee9ff] font-bold text-[#5947a8]">{post.avatar ? <img src={post.avatar} alt="" className="h-full w-full object-cover" /> : post.name?.slice(0, 1)}</Link><div className="min-w-0 flex-1"><Link to={profileLink} className="block truncate text-sm font-bold hover:text-[#5947a8]">{post.name}</Link><p className="mt-0.5 truncate text-xs text-[#6e6a7b]">{post.role || "OrbitU student"}</p><p className="mt-1 text-[11px] text-[#858191]">{notificationTime(post.time)}</p></div><span className="rounded-full bg-[#eee9ff] px-3 py-1 text-[10px] font-bold text-[#5947a8]">{post.category || "General"}</span></header>
        {hasMedia && <div className="flex min-h-64 flex-1 items-center justify-center bg-[#191a32] lg:min-h-[680px]">{post.image ? <img src={post.image} alt="Post attachment" className="max-h-[78vh] w-full object-contain" /> : post.mediaType === "video" ? <video src={post.mediaUrl} controls playsInline className="max-h-[78vh] w-full" /> : post.mediaType === "pdf" ? <div className="p-8 text-center text-white"><FileText size={48} className="mx-auto text-[#ffe35b]" /><p className="mt-4 max-w-sm break-words font-semibold">{post.mediaName || "Attached document"}</p><a href={post.mediaUrl} target="_blank" rel="noreferrer" className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#ffe35b] px-4 py-2.5 text-sm font-bold text-black">Open PDF <ExternalLink size={15} /></a></div> : null}</div>}
        <div className="p-5 sm:p-7">{post.text ? <p className="whitespace-pre-wrap break-words text-sm leading-7 text-[#343247]">{post.text}</p> : !hasMedia ? <p className="rounded-2xl bg-[#fff9e8] p-5 text-xs text-[#858191]">A post shared with the OrbitU community.</p> : <p className="text-sm text-[#858191]">Shared with the OrbitU community.</p>}</div>
      </div>
      <div className="flex min-h-[560px] min-w-0 flex-col bg-[#fffdf9]">
        <div className="flex items-center justify-between border-b border-[#e7dfd0] px-5 py-4 text-xs text-[#6e6a7b]"><span className="font-semibold">{post.likes || 0} likes</span><span>{comments.length} comments</span></div>
        <div className="grid grid-cols-3 gap-2 border-b border-[#e7dfd0] p-3"><button type="button" disabled={busy} onClick={toggleLike} className={`flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold transition hover:bg-[#f4f0e8] ${post.liked ? "text-[#6f56d9]" : "text-[#514e62]"}`}><Heart size={17} fill={post.liked ? "currentColor" : "none"} />Like</button><a href="#post-comments" className="flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold text-[#514e62] hover:bg-[#f4f0e8]"><MessageCircle size={17} />Comment</a><button type="button" onClick={sharePost} className="flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold text-[#514e62] hover:bg-[#f4f0e8]"><Share2 size={17} />{shareFeedback || "Share"}</button></div>
        <section id="post-comments" className="min-h-0 flex-1 p-4 sm:p-5"><h2 className="text-sm font-bold">Comments <span className="ml-1 text-[#858191]">{comments.length}</span></h2><div className="mt-3 space-y-3">{comments.map((comment) => <div key={comment.id} className="flex items-start gap-2.5"><div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full border border-[#e7dfd0] bg-[#eee9ff] text-xs font-bold text-[#5947a8]">{comment.photo ? <img src={comment.photo} alt="" className="h-full w-full object-cover" /> : comment.name?.slice(0, 1)}</div><div className="min-w-0 flex-1 rounded-2xl bg-[#f4f0e8] px-3.5 py-2.5"><p className="text-xs font-bold">{comment.name}</p><p className="mt-1 whitespace-pre-wrap break-words text-sm leading-5 text-[#514e62]">{comment.text}</p></div></div>)}{comments.length === 0 && <p className="py-3 text-sm text-[#858191]">No comments yet. Start the conversation.</p>}</div></section>
        <form onSubmit={submitComment} className="flex items-center gap-2 border-t border-[#e7dfd0] bg-white p-3 sm:p-4"><div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full border border-[#191a32] bg-[#ffe35b] text-xs font-bold">{user?.photo ? <img src={user.photo} alt="" className="h-full w-full object-cover" /> : user?.name?.slice(0, 1)}</div><input value={draft} onChange={(event) => setDraft(event.target.value)} maxLength={500} placeholder="Add a comment…" className="min-w-0 flex-1 rounded-xl border border-[#e7dfd0] bg-white px-3 py-2.5 text-sm outline-none focus:border-[#7660dc]" /><button type="submit" disabled={!draft.trim() || busy} aria-label="Post comment" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border-2 border-[#191a32] bg-[#ffe35b] text-black shadow-[0_2px_0_#191a32] disabled:opacity-50"><Send size={16} /></button></form>
      </div>
    </article> : <div className="mx-auto max-w-xl rounded-[26px] border-2 border-[#191a32] bg-white px-5 py-12 text-center shadow-[4px_5px_0_#c9bcff]"><h2 className="font-bold">Post not found</h2><p className="mt-2 text-sm text-[#6e6a7b]">It may have been removed.</p><Link to={profileLink} className="mt-4 inline-flex rounded-xl border-2 border-[#191a32] bg-[#ffe35b] px-4 py-2 text-sm font-bold shadow-[0_2px_0_#191a32]">Return to profile</Link></div>}
  </main></div>;
}

export default PostDetail;
