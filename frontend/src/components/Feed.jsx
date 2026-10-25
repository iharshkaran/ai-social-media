
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import {
  ImagePlus,
  ThumbsUp,
  MessageCircle,
  Share2,
  Send,
  X,
  Trash2,
  BookOpen,
  Video,
  FileText,
  ChevronDown,
} from "lucide-react";
import { api } from "../utils/api";
import { useConnectlyStore } from "../store/useConnectlyStore";
import { uploadFileToImageKit } from "../utils/imagekitUpload";
import { notificationTime } from "../utils/socialStore";
import PostCaption from "./PostCaption";

const categories = [
  "General",
  "Project",
  "Hackathon",
  "Learning",
  "Achievement",
];

const categoryColors = {
  General: "text-[#514e62] bg-[#f4f0e8]",
  Project: "text-[#315c9d] bg-blue-400/10",
  Hackathon: "text-[#6743a7] bg-purple-400/10",
  Learning: "text-[#5947a8] bg-[#eee9ff]",
  Achievement: "text-[#28734d] bg-green-400/10",
};

function Feed({ composerOnly = false, hideComposerOnMobile = false, onPostCreated }) {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [postText, setPostText] = useState("");
  const [category, setCategory] = useState("General");
  const [image, setImage] = useState("");
  const [imagePreview, setImagePreview] = useState("");
  const [imageUploading, setImageUploading] = useState(false);
  const [imageProgress, setImageProgress] = useState(0);
  const [media, setMedia] = useState(null);
  const [mediaPreview, setMediaPreview] = useState("");
  const [openComments, setOpenComments] = useState([]);
  const [commentDrafts, setCommentDrafts] = useState({});
  const [likedPosts, setLikedPosts] = useState([]);
  const [error, setError] = useState("");
  const [shareFeedback, setShareFeedback] = useState("");
  const [pendingDeleteId, setPendingDeleteId] = useState(null);
  const [deletingPost, setDeletingPost] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const imageInputRef = useRef(null);
  const videoInputRef = useRef(null);
  const pdfInputRef = useRef(null);
  const postTextareaRef = useRef(null);
  const categoryMenuRef = useRef(null);
  const [categoryOpen, setCategoryOpen] = useState(false);
  const shareFeedbackTimer = useRef(null);

  useEffect(() => () => {
    if (shareFeedbackTimer.current) window.clearTimeout(shareFeedbackTimer.current);
  }, []);

  useEffect(() => {
    if (!categoryOpen) return undefined;
    const closeOnOutsideClick = (event) => {
      if (!categoryMenuRef.current?.contains(event.target)) setCategoryOpen(false);
    };
    const closeOnEscape = (event) => {
      if (event.key === "Escape") setCategoryOpen(false);
    };
    document.addEventListener("pointerdown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [categoryOpen]);

  function showShareFeedback(message) {
    setShareFeedback(message);
    if (shareFeedbackTimer.current) window.clearTimeout(shareFeedbackTimer.current);
    shareFeedbackTimer.current = window.setTimeout(() => setShareFeedback(""), 4000);
  }

  useEffect(() => {
    if (composerOnly) {
      setLoading(false);
      return undefined;
    }
    let active = true;
    useConnectlyStore.getState().loadPosts()
      .then((items) => { if (active) { setPosts(items); setHasMore(useConnectlyStore.getState().postsHasMore); setLikedPosts(items.filter((post) => post.liked).map((post) => post.id)); } })
      .catch((requestError) => { if (active) setError(requestError.message); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [composerOnly]);

  async function loadMorePosts() {
    setLoadingMore(true);
    setError("");
    try {
      const nextPosts = await useConnectlyStore.getState().loadMorePosts();
      if (nextPosts.length) {
        setPosts(useConnectlyStore.getState().posts || []);
        setHasMore(useConnectlyStore.getState().postsHasMore);
        setLikedPosts((current) => Array.from(new Set([
          ...current,
          ...nextPosts.filter((post) => post.liked).map((post) => post.id),
        ])));
      } else {
        setHasMore(false);
      }
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoadingMore(false);
    }
  }

  function updatePosts(update) {
    setPosts((current) => {
      const next = update(current);
      useConnectlyStore.getState().updateCachedPosts(next);
      return next;
    });
  }

  function updatePostText(event) {
    setPostText(event.target.value);
    const textarea = event.target;
    textarea.style.height = "auto";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 268)}px`;
    textarea.style.overflowY = textarea.scrollHeight > 268 ? "auto" : "hidden";
  }

  async function handleMediaChange(event, mediaType) {
    const file = event.target.files?.[0];

    if (!file) return;

    const validType = mediaType === "image"
      ? file.type.startsWith("image/")
      : mediaType === "video"
        ? file.type.startsWith("video/")
        : file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
    if (!validType) {
      setError(mediaType === "image" ? "Choose an image file." : mediaType === "video" ? "Choose a video file." : "Choose a PDF file.");
      event.target.value = "";
      return;
    }

    const sizeLimit = mediaType === "video" ? 50 * 1024 * 1024 : mediaType === "pdf" ? 10 * 1024 * 1024 : 2 * 1024 * 1024;
    const sizeLabel = mediaType === "video" ? "50 MB" : mediaType === "pdf" ? "10 MB" : "2 MB";
    if (file.size > sizeLimit) {
      setError(`Choose a ${mediaType} smaller than ${sizeLabel}.`);
      event.target.value = "";
      return;
    }

    if (imagePreview.startsWith("blob:")) URL.revokeObjectURL(imagePreview);
    if (mediaPreview.startsWith("blob:")) URL.revokeObjectURL(mediaPreview);
    const preview = mediaType === "image" || mediaType === "video" ? URL.createObjectURL(file) : "";
    setImagePreview(mediaType === "image" ? preview : "");
    setMediaPreview(mediaType === "video" ? preview : "");
    setImage("");
    setMedia({ url: "", type: mediaType === "image" ? "" : mediaType, name: file.name, mimeType: file.type });
    setImageUploading(true);
    setImageProgress(0);
    setError("");
    try {
      const uploaded = await uploadFileToImageKit(file, "/connectly/posts", setImageProgress);
      if (mediaType === "image") setImage(uploaded.url);
      else setMedia({ url: uploaded.url, type: mediaType, name: file.name, mimeType: file.type });
    } catch (uploadError) {
      if (preview) URL.revokeObjectURL(preview);
      if (mediaType === "image") setImagePreview("");
      else setMediaPreview("");
      setMedia(null);
      setError(uploadError.message);
      event.target.value = "";
    } finally {
      setImageUploading(false);
    }
  }

  async function createPost() {
    if (imageUploading) return;
    if (!postText.trim() && !image && !media?.url) {
      setError("Write something or attach a file before posting.");
      return;
    }

    try {
      const saved = await api.createPost({ text: postText.trim(), image, mediaUrl: media?.url || "", mediaType: media?.url ? media.type : "", mediaName: media?.url ? media.name : "", category });
      if (composerOnly) {
        const cachedPosts = useConnectlyStore.getState().posts || [];
        useConnectlyStore.getState().updateCachedPosts([saved, ...cachedPosts.filter((post) => post.id !== saved.id)]);
      } else updatePosts((current) => [saved, ...current]);
      window.dispatchEvent(new Event("connectly:backend-update"));
    } catch (requestError) { setError(requestError.message); return; }
    setPostText("");
    if (postTextareaRef.current) {
      postTextareaRef.current.style.height = "56px";
      postTextareaRef.current.style.overflowY = "hidden";
    }
    setCategory("General");
    setImage("");
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    if (mediaPreview) URL.revokeObjectURL(mediaPreview);
    setImagePreview("");
    setMediaPreview("");
    setMedia(null);
    setImageProgress(0);
    setError("");

    if (imageInputRef.current) {
      imageInputRef.current.value = "";
    }
    if (videoInputRef.current) videoInputRef.current.value = "";
    if (pdfInputRef.current) pdfInputRef.current.value = "";
    onPostCreated?.();
  }

  async function deletePost(postId) {
    setPendingDeleteId(postId);
  }

  async function confirmDeletePost() {
    if (!pendingDeleteId || deletingPost) return;
    setDeletingPost(true);
    const postId = pendingDeleteId;
    try { await api.deletePost(postId); } catch (requestError) {
      setError(requestError.message);
      setDeletingPost(false);
      return;
    }
    updatePosts((current) => current.filter((post) => post.id !== postId));
    setLikedPosts((current) => current.filter((id) => id !== postId));
    setPendingDeleteId(null);
    setDeletingPost(false);
    window.dispatchEvent(new Event("connectly:backend-update"));
  }

  async function toggleLike(postId) {
    const alreadyLiked = likedPosts.includes(postId);
    let result;
    try { result = await api.toggleLike(postId); } catch (requestError) { setError(requestError.message); return; }
    setLikedPosts((current) =>
      alreadyLiked
        ? current.filter((id) => id !== postId)
        : [...current, postId]
    );

    updatePosts((current) =>
      current.map((post) =>
        post.id === postId
          ? { ...post, likes: result.likes, liked: result.liked }
          : post
      )
    );
    window.dispatchEvent(new Event("connectly:backend-update"));
  }

  function toggleComments(postId) {
    setOpenComments((current) =>
      current.includes(postId)
        ? current.filter((id) => id !== postId)
        : [...current, postId]
    );
  }

  async function addComment(event, postId) {
    event.preventDefault();
    const text = (commentDrafts[postId] || "").trim();

    if (!text) return;

    let savedComment;
    try { savedComment = await api.comment(postId, text); } catch (requestError) { setError(requestError.message); return; }
    updatePosts((current) =>
      current.map((post) =>
        post.id === postId
          ? {
              ...post,
              comments: [
                ...post.comments,
                savedComment,
              ],
            }
          : post
      )
    );

    setCommentDrafts((current) => ({ ...current, [postId]: "" }));
    window.dispatchEvent(new Event("connectly:backend-update"));
  }

  async function sharePost(post) {
    const shareText = `${post.name} on OrbitU:\n${post.text}`;

    try {
      if (navigator.share) {
        await navigator.share({ title: "OrbitU post", text: shareText });
        showShareFeedback("Post shared successfully.");
      } else if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareText);
        showShareFeedback("Post text copied to clipboard.");
      } else {
        showShareFeedback("Sharing is not available in this browser.");
      }
    } catch (error) {
      if (error.name !== "AbortError") {
        showShareFeedback("Unable to share this post right now.");
      }
    }
  }

  return (
    <div className="space-y-5">
      {!composerOnly && shareFeedback && (
        <p
          role="status"
          aria-live="polite"
          className="fixed bottom-5 left-1/2 z-50 w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 rounded-xl border border-[#e7dfd0] bg-white px-4 py-3 text-center text-sm text-[#17182d] shadow-2xl"
        >
          {shareFeedback}
        </p>
      )}
      {!composerOnly && pendingDeleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onMouseDown={(event) => {
          if (event.target === event.currentTarget && !deletingPost) setPendingDeleteId(null);
        }}>
          <section
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="delete-post-title"
            aria-describedby="delete-post-description"
            className="w-full max-w-sm rounded-2xl border border-[#e7dfd0] bg-white p-5 shadow-2xl"
          >
            <h2 id="delete-post-title" className="text-lg font-semibold">Delete this post?</h2>
            <p id="delete-post-description" className="mt-2 text-sm leading-6 text-[#6e6a7b]">This post will be removed from your feed. This action cannot be undone.</p>
            <div className="mt-6 flex justify-end gap-3">
              <button type="button" disabled={deletingPost} onClick={() => setPendingDeleteId(null)} className="rounded-xl border border-[#e7dfd0] px-4 py-2.5 text-sm text-[#514e62] transition hover:bg-[#f4f0e8] disabled:opacity-50">Cancel</button>
              <button type="button" disabled={deletingPost} onClick={confirmDeletePost} className="rounded-xl bg-red-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-400 disabled:cursor-wait disabled:opacity-50">{deletingPost ? "Deleting…" : "Delete post"}</button>
            </div>
          </section>
        </div>
      )}
      {/* CREATE POST */}
      <section id="feed-composer" className={`${hideComposerOnMobile ? "hidden sm:block " : ""}scroll-mt-24 rounded-[26px] border-2 border-[#191a32] bg-white p-3 shadow-[4px_5px_0_#191a32] sm:p-4`}>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-2xl border-2 border-[#191a32] bg-[#ffe35b] text-[#5947a8]">
            {user?.photo ? <img src={user.photo} alt="" className="h-full w-full object-cover" /> : <BookOpen size={20} />}
          </div>
          <div>
            <h2 className="font-extrabold">Share with your community</h2>
            <p className="text-xs text-[#858191]">A project, a new skill, or a small win?</p>
          </div>
        </div>

        <textarea
          id="feed-post-text"
          ref={postTextareaRef}
          value={postText}
          onChange={updatePostText}
          placeholder="What are you learning or building today?"
          rows={1}
          maxLength={3000}
          className="mt-3 max-h-[268px] min-h-14 w-full resize-none overflow-y-hidden rounded-2xl border-2 border-[#e7dfd0] bg-[#fffdf9] p-3 text-sm leading-6 text-[#17182d] outline-none placeholder:text-[#858191] focus:border-[#7660dc]"
        />

        {imagePreview && (
          <div className="relative mt-3">
            <img
              src={imagePreview}
              alt="Post preview"
              className="max-h-36 w-full rounded-xl border border-[#e7dfd0] object-contain"
            />
            <button
              type="button"
              onClick={() => {
                if (imagePreview.startsWith("blob:")) URL.revokeObjectURL(imagePreview);
                if (mediaPreview.startsWith("blob:")) URL.revokeObjectURL(mediaPreview);
                setImage("");
                setImagePreview("");
                setMediaPreview("");
                setMedia(null);
                if (imageInputRef.current) imageInputRef.current.value = "";
                if (videoInputRef.current) videoInputRef.current.value = "";
                if (pdfInputRef.current) pdfInputRef.current.value = "";
              }}
              disabled={imageUploading}
              aria-label="Remove selected image"
              className="absolute right-2 top-2 rounded-full bg-black/80 p-2 text-white hover:bg-black"
            >
              <X size={17} />
            </button>
          </div>
        )}
        {media?.type === "video" && mediaPreview && (
          <div className="relative mt-3">
            <video src={mediaPreview} controls className="max-h-40 w-full rounded-xl border border-[#e7dfd0] bg-[#191a32]" />
            <button type="button" onClick={() => { URL.revokeObjectURL(mediaPreview); setMedia(null); setMediaPreview(""); if (videoInputRef.current) videoInputRef.current.value = ""; }} disabled={imageUploading} aria-label="Remove selected video" className="absolute right-2 top-2 rounded-full bg-black/80 p-2 text-white hover:bg-black disabled:opacity-50"><X size={17} /></button>
          </div>
        )}
        {media?.type === "pdf" && (
          <div className="mt-3 flex items-center gap-3 rounded-xl border-2 border-[#191a32] bg-[#fff3b7] px-3 py-2.5 shadow-[2px_3px_0_#191a32]">
            <FileText size={20} className="shrink-0 text-[#6f56d9]" />
            <span className="min-w-0 flex-1 truncate text-sm font-semibold">{media.name}</span>
            {!imageUploading && media.url && <a href={media.url} target="_blank" rel="noreferrer" className="text-xs font-bold text-[#5947a8] underline">Preview</a>}
            <button type="button" onClick={() => { setMedia(null); if (pdfInputRef.current) pdfInputRef.current.value = ""; }} disabled={imageUploading} aria-label="Remove selected PDF" className="rounded-lg p-1 text-[#514e62] hover:bg-white/60 disabled:opacity-50"><X size={17} /></button>
          </div>
        )}
        {imageUploading && <p className="mt-2 text-xs text-[#6e6a7b]">Uploading {media?.type || "image"} to ImageKit… {imageProgress}%</p>}

        <div className="mt-2">
          <div className="flex w-fit items-center gap-2 text-xs font-medium text-[#6e6a7b]">
            Category
            <div className="relative" ref={categoryMenuRef}>
              <button type="button" aria-haspopup="listbox" aria-expanded={categoryOpen} onClick={() => setCategoryOpen((open) => !open)} className="flex min-w-32 items-center justify-between gap-3 rounded-lg border border-[#e7dfd0] bg-[#fffdf9] px-2.5 py-1.5 text-xs font-semibold text-[#514e62] outline-none transition hover:border-[#7660dc] focus-visible:border-[#7660dc]">
                {category}<ChevronDown size={14} className={`transition-transform ${categoryOpen ? "rotate-180" : ""}`} />
              </button>
              {categoryOpen && <div role="listbox" aria-label="Post category" className="absolute left-0 top-full z-20 mt-2 w-40 overflow-hidden rounded-xl border-2 border-[#191a32] bg-white p-1 shadow-[3px_4px_0_#191a32]">
                {categories.map((name) => <button key={name} type="button" role="option" aria-selected={category === name} onClick={() => { setCategory(name); setCategoryOpen(false); }} className={`block w-full rounded-lg px-3 py-2 text-left text-xs transition ${category === name ? "bg-[#eee9ff] font-bold text-[#5947a8]" : "text-[#514e62] hover:bg-[#f4f0e8]"}`}>{name}</button>)}
              </div>}
            </div>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-[#e7dfd0] pt-2">
          <div className="flex flex-wrap items-center gap-1">
            <input
              ref={imageInputRef}
              type="file"
              accept="image/*"
              onChange={(event) => handleMediaChange(event, "image")}
              disabled={imageUploading}
              className="hidden"
              id="post-image"
            />
            <input ref={videoInputRef} type="file" accept="video/*" onChange={(event) => handleMediaChange(event, "video")} disabled={imageUploading} className="hidden" id="post-video" />
            <input ref={pdfInputRef} type="file" accept="application/pdf,.pdf" onChange={(event) => handleMediaChange(event, "pdf")} disabled={imageUploading} className="hidden" id="post-pdf" />
            <label
              htmlFor="post-image"
              className="flex cursor-pointer items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs text-[#6e6a7b] hover:bg-[#f4f0e8] hover:text-[#6f56d9]"
            >
              <ImagePlus size={16} />
              {imageUploading ? "Uploading photo…" : image ? "Photo uploaded" : "Add photo"}
            </label>
            <label htmlFor="post-video" className={`flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs text-[#6e6a7b] hover:bg-[#f4f0e8] hover:text-[#6f56d9] ${imageUploading ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}><Video size={16} /> Add video</label>
            <label htmlFor="post-pdf" className={`flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs text-[#6e6a7b] hover:bg-[#f4f0e8] hover:text-[#6f56d9] ${imageUploading ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}><FileText size={16} /> Add PDF</label>
          </div>

          <button
            type="button"
            onClick={createPost}
            disabled={imageUploading || (!postText.trim() && !image && !media?.url)}
            className="flex items-center gap-2 rounded-xl bg-[#ffe35b] px-4 py-2 text-sm font-semibold text-black transition hover:bg-[#f3d446] disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Send size={16} />
            {imageUploading ? "Uploading…" : "Post"}
          </button>
        </div>

        {error && (
          <p role="alert" className="mt-3 text-sm text-[#a33b48]">
            {error}
          </p>
        )}
      </section>

      {/* FEED POSTS */}
      {!composerOnly && <>
      {loading && <section className="rounded-[26px] border-2 border-[#191a32] bg-white px-5 py-12 text-center text-sm text-[#6e6a7b] shadow-[3px_4px_0_#e7dfd0]">Loading your feed...</section>}
      {!loading && posts.length === 0 && !error && (
        <section className="rounded-[26px] border-2 border-[#191a32] bg-[#fffdf9] px-5 py-12 text-center shadow-[3px_4px_0_#e7dfd0]">
          <BookOpen size={32} className="mx-auto text-[#6f56d9]" />
          <h3 className="mt-4 font-semibold">Your feed is waiting</h3>
          <p className="mt-2 text-sm text-[#6e6a7b]">
            Share your first update with the community.
          </p>
        </section>
      )}

      {posts.map((post) => {
        const liked = likedPosts.includes(post.id) || post.liked;
        const comments = Array.isArray(post.comments) ? post.comments : [];

        return (
          <article
            key={post.id}
            className="rounded-[26px] border-2 border-[#191a32] bg-white p-4 shadow-[3px_4px_0_#e7dfd0] sm:p-5"
          >
            <div className="flex items-start gap-3">
              <Link to={post.authorId === user?.id ? "/profile" : `/profile/${post.authorId}`} aria-label={`Open ${post.name}'s profile`} className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#eee9ff] font-semibold text-[#6f56d9] transition hover:ring-2 hover:ring-[#7660dc]">
                {post.avatar ? <img src={post.avatar} alt={`${post.name}'s profile`} loading="lazy" decoding="async" className="h-full w-full object-cover" /> : post.name.charAt(0)}
              </Link>

              <div className="min-w-0 flex-1">
                <h3 className="truncate text-sm font-semibold"><Link to={post.authorId === user?.id ? "/profile" : `/profile/${post.authorId}`} className="hover:text-[#5947a8]">{post.name}</Link></h3>
                <p className="mt-1 text-xs text-[#6e6a7b]">{post.role}</p>
                <p className="mt-1 text-xs text-[#858191]">{post.time ? notificationTime(post.time) : "Just now"}</p>
              </div>

              <div className="flex flex-col items-end gap-2">
                <span
                  className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${
                    categoryColors[post.category] || categoryColors.General
                  }`}
                >
                  {post.category || "General"}
                </span>

                {post.authorId === user?.id && (
                  <button
                    type="button"
                    aria-label="Delete post"
                    title="Delete post"
                    onClick={() => deletePost(post.id)}
                    className="rounded-lg p-1.5 text-[#858191] hover:bg-red-400/10 hover:text-[#a33b48]"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            </div>

            {post.text && <PostCaption text={post.text} />}

            {post.image && (
              <img
                src={post.image}
                alt="Shared by a student"
                loading="lazy"
                decoding="async"
                className="mt-4 max-h-[560px] w-full rounded-xl border border-[#e7dfd0] object-contain sm:max-h-[620px]"
              />
            )}

            {post.mediaType === "video" && post.mediaUrl && (
              <video src={post.mediaUrl} controls preload="metadata" className="mt-4 max-h-[560px] w-full rounded-xl border-2 border-[#191a32] bg-[#191a32] sm:max-h-[620px]" />
            )}

            {post.mediaType === "pdf" && post.mediaUrl && (
              <a href={post.mediaUrl} target="_blank" rel="noreferrer" className="mt-4 flex items-center gap-3 rounded-2xl border-2 border-[#191a32] bg-[#fff3b7] p-4 text-sm font-semibold text-[#17182d] shadow-[3px_4px_0_#191a32] transition hover:-translate-y-0.5">
                <FileText size={22} className="shrink-0 text-[#6f56d9]" />
                <span className="min-w-0 flex-1 truncate">{post.mediaName || "Open attached PDF"}</span>
                <span className="text-xs text-[#5947a8]">View PDF ↗</span>
              </a>
            )}

            <div className="mt-4 flex items-center justify-between border-b border-[#e7dfd0] pb-3 text-xs text-[#6e6a7b]">
              <span>{post.likes} likes</span>
              <button
                type="button"
                onClick={() => toggleComments(post.id)}
                className="hover:text-[#6f56d9]"
              >
                {comments.length} comments
              </button>
            </div>

            <div className="grid grid-cols-3 gap-1 pt-3 sm:gap-2">
              <button
                type="button"
                onClick={() => toggleLike(post.id)}
                className={`flex items-center justify-center gap-2 rounded-lg py-2.5 text-xs transition hover:bg-[#f4f0e8] sm:text-sm ${
                  liked ? "text-[#6f56d9]" : "text-[#6e6a7b]"
                }`}
              >
                <ThumbsUp size={17} />
                Like
              </button>

              <button
                type="button"
                onClick={() => toggleComments(post.id)}
                className="flex items-center justify-center gap-2 rounded-lg py-2.5 text-xs text-[#6e6a7b] transition hover:bg-[#f4f0e8] hover:text-[#17182d] sm:text-sm"
              >
                <MessageCircle size={17} />
                Comment
              </button>

              <button
                type="button"
                onClick={() => sharePost(post)}
                className="flex items-center justify-center gap-2 rounded-lg py-2.5 text-xs text-[#6e6a7b] transition hover:bg-[#f4f0e8] hover:text-[#17182d] sm:text-sm"
              >
                <Share2 size={17} />
                Share
              </button>
            </div>

            {/* COMMENTS */}
            {openComments.includes(post.id) && (
              <div className="mt-3 border-t border-[#e7dfd0] pt-4">
                <div className="space-y-3">
                  {comments.map((comment) => (
                    <div
                      key={comment.id}
                      className="flex items-start gap-2.5"
                    >
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full border border-[#d8d0c1] bg-[#c9bcff] text-xs font-semibold text-[#5947a8]">
                        {comment.photo ? <img src={comment.photo} alt={`${comment.name}'s profile`} loading="lazy" decoding="async" className="h-full w-full object-cover" /> : comment.name.charAt(0)}
                      </div>

                      <div className="min-w-0 flex-1 rounded-xl bg-[#f4f0e8] px-3 py-2">
                        <p className="text-xs font-semibold">{comment.name}</p>
                        <p className="mt-1 break-words text-sm text-[#514e62]">
                          {comment.text}
                        </p>
                      </div>
                    </div>
                  ))}

                  {comments.length === 0 && (
                    <p className="text-xs text-[#858191]">
                      No comments yet. Start the conversation!
                    </p>
                  )}
                </div>

                <form
                  onSubmit={(event) => addComment(event, post.id)}
                  className="mt-4 flex gap-2"
                >
                  <input
                    value={commentDrafts[post.id] || ""}
                    onChange={(event) =>
                      setCommentDrafts((current) => ({
                        ...current,
                        [post.id]: event.target.value,
                      }))
                    }
                    placeholder="Write a comment..."
                    maxLength={500}
                    className="min-w-0 flex-1 rounded-xl border border-[#e7dfd0] bg-[#fffdf9] px-3 py-2.5 text-sm outline-none placeholder:text-[#858191] focus:border-[#7660dc]"
                  />
                  <button
                    type="submit"
                    aria-label="Send comment"
                    className="rounded-xl bg-[#ffe35b] px-3 text-black hover:bg-[#f3d446]"
                  >
                    <Send size={17} />
                  </button>
                </form>
              </div>
            )}
          </article>
        );
      })}

      {!loading && posts.length > 0 && hasMore && (
        <div className="flex justify-center pb-2">
          <button
            type="button"
            onClick={loadMorePosts}
            disabled={loadingMore}
            className="rounded-xl border border-[#e7dfd0] px-5 py-2.5 text-sm text-[#514e62] transition hover:border-[#7660dc] hover:text-[#5947a8] disabled:cursor-wait disabled:opacity-50"
          >
            {loadingMore ? "Loading posts…" : "Load more posts"}
          </button>
        </div>
      )}
      </>}
    </div>
  );
}

export default Feed;

