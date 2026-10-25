import { Link } from "react-router-dom";
import { FileText, Heart, MessageCircle, Play } from "lucide-react";

function ProfilePostGrid({ posts = [] }) {
  if (!posts.length) return <div className="rounded-[24px] border-2 border-[#191a32] bg-white px-5 py-12 text-center shadow-[3px_4px_0_#c9bcff]"><FileText size={30} className="mx-auto text-[#6f56d9]" /><h3 className="mt-3 font-bold">Your posts will show here</h3><p className="mt-1 text-sm text-[#858191]">Share projects, learning milestones and ideas with your network.</p></div>;

  return <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
    {posts.map((post) => {
      const hasImage = Boolean(post.image);
      const hasVideo = post.mediaType === "video" && Boolean(post.mediaUrl);
      const hasPdf = post.mediaType === "pdf" && Boolean(post.mediaUrl);
      const hasMedia = hasImage || hasVideo || hasPdf;
      return <Link key={post.id} to={`/post/${post.id}`} aria-label={`Open post: ${(post.text || post.mediaName || "Shared post").slice(0, 90)}`} className="group relative aspect-square overflow-hidden rounded-[20px] border-2 border-[#191a32] bg-white shadow-[3px_4px_0_#c9bcff] transition duration-200 hover:-translate-y-1 hover:shadow-[5px_6px_0_#87d4f4] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#7660dc]/30">
        {hasImage && <img src={post.image} alt="Post thumbnail" loading="lazy" decoding="async" className="absolute inset-0 h-full w-full object-cover transition duration-300 group-hover:scale-105" />}
        {hasVideo && <><video src={post.mediaUrl} muted playsInline preload="metadata" className="absolute inset-0 h-full w-full bg-[#191a32] object-cover" /><span className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full border border-white/70 bg-black/50 text-white"><Play size={16} fill="currentColor" /></span></>}
        {hasPdf && <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[#fff3b7] p-4 text-center"><span className="flex h-14 w-14 items-center justify-center rounded-2xl border-2 border-[#191a32] bg-white text-[#6f56d9] shadow-[2px_3px_0_#191a32]"><FileText size={27} /></span><span className="line-clamp-3 text-sm font-bold">{post.mediaName || "Document"}</span><span className="text-[10px] font-bold uppercase tracking-wider text-[#6e6a7b]">PDF post</span></div>}
        {!hasMedia && <div className={`absolute inset-0 flex items-end p-4 pb-12 sm:p-5 sm:pb-14 ${post.category === "Project" ? "bg-[#eee9ff]" : "bg-[#fff9e8]"}`}><p className="line-clamp-7 whitespace-pre-wrap break-words text-sm font-semibold leading-6 text-[#343247]">{post.text || "Shared an update"}</p></div>}
        {hasMedia && <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/45 to-transparent px-3 pb-3 pr-24 pt-12 text-white sm:px-4 sm:pb-4 sm:pr-28"><span className="line-clamp-2 text-xs font-semibold leading-5 sm:text-sm">{post.text || post.mediaName || post.category || "Shared post"}</span></div>}
        <span className="absolute left-2 top-2 rounded-full bg-white/90 px-2 py-1 text-[9px] font-bold uppercase tracking-wide text-[#514e62] shadow-sm sm:left-3 sm:top-3">{post.category || "Post"}</span>
        <span className="absolute bottom-2 right-2 inline-flex items-center gap-2 rounded-full border border-white/50 bg-black/55 px-2.5 py-1.5 text-[10px] font-semibold text-white backdrop-blur-sm sm:bottom-3 sm:right-3 sm:text-xs"><span className="inline-flex items-center gap-1"><Heart size={12} />{post.likes || 0}</span><span className="inline-flex items-center gap-1"><MessageCircle size={12} />{post.comments?.length || 0}</span></span>
      </Link>;
    })}
  </div>;
}

export default ProfilePostGrid;
