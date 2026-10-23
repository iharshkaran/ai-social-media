
import { useEffect, useRef, useState } from "react";
import {
  ImagePlus,
  ThumbsUp,
  MessageCircle,
  Share2,
  Send,
  X,
  Trash2,
  Code2,
  Trophy,
  BookOpen,
  Award,
} from "lucide-react";
import { addNotification } from "../utils/socialStore";

const initialPosts = [
  {
    id: 1,
    name: "Aarav Sharma",
    role: "B.Tech CSE · 3rd Year",
    time: "2 hours ago",
    category: "Project",
    text: "Just completed a new React project! Learning by building is the best way to grow. 🚀",
    image: "",
    likes: 12,
    comments: [
      { id: 101, name: "Riya", text: "Looks great! Keep building 🚀" },
    ],
  },
  {
    id: 2,
    name: "Priya Verma",
    role: "Computer Science Student",
    time: "5 hours ago",
    category: "Learning",
    text: "Consistency beats motivation. One DSA problem and one new concept every day. Let's grow together! 💛",
    image: "",
    likes: 24,
    comments: [],
  },
];

const categories = [
  { name: "General", icon: BookOpen },
  { name: "Project", icon: Code2 },
  { name: "Hackathon", icon: Trophy },
  { name: "Learning", icon: BookOpen },
  { name: "Achievement", icon: Award },
];

const categoryColors = {
  General: "text-gray-300 bg-white/[0.06]",
  Project: "text-blue-300 bg-blue-400/10",
  Hackathon: "text-purple-300 bg-purple-400/10",
  Learning: "text-yellow-300 bg-yellow-400/10",
  Achievement: "text-green-300 bg-green-400/10",
};

function loadPosts() {
  try {
    const saved = localStorage.getItem("connectly-posts");
    return saved ? JSON.parse(saved) : initialPosts;
  } catch {
    return initialPosts;
  }
}

function Feed() {
  const [posts, setPosts] = useState(loadPosts);
  const [postText, setPostText] = useState("");
  const [category, setCategory] = useState("General");
  const [image, setImage] = useState("");
  const [openComments, setOpenComments] = useState([]);
  const [commentDrafts, setCommentDrafts] = useState({});
  const [likedPosts, setLikedPosts] = useState([]);
  const [error, setError] = useState("");
  const imageInputRef = useRef(null);

  useEffect(() => {
    try {
      localStorage.setItem("connectly-posts", JSON.stringify(posts));
    } catch {
      // Keep the current session usable if browser storage has reached its limit.
    }
  }, [posts]);

  function handleImageChange(event) {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select an image file.");
      event.target.value = "";
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setError("Choose an image smaller than 2 MB for this demo.");
      event.target.value = "";
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      setImage(String(reader.result));
      setError("");
    };

    reader.onerror = () => {
      setError("Could not read that image. Please try another.");
    };

    reader.readAsDataURL(file);
  }

  function createPost() {
    if (!postText.trim() && !image) {
      setError("Write something or add an image before posting.");
      return;
    }

    let profile = {};
    try { profile = JSON.parse(localStorage.getItem("connectly-profile") || "{}"); } catch { /* Use demo defaults. */ }
    const newPost = {
      id: Date.now(),
      name: profile.name || "Your Name",
      role: [profile.course, profile.year, profile.university].filter(Boolean).join(" · ") || "Student · Connectly member",
      avatar: profile.photo || "",
      time: "Just now",
      category,
      text: postText.trim(),
      image,
      likes: 0,
      comments: [],
    };

    setPosts((current) => [newPost, ...current]);
    setPostText("");
    setCategory("General");
    setImage("");
    setError("");
    addNotification({ type: "post", title: "Post shared", message: `You shared a ${category.toLowerCase()} update.` });

    if (imageInputRef.current) {
      imageInputRef.current.value = "";
    }
  }

  function deletePost(postId) {
    const confirmed = window.confirm("Delete this post?");
    if (!confirmed) return;

    setPosts((current) => current.filter((post) => post.id !== postId));
    setLikedPosts((current) => current.filter((id) => id !== postId));
  }

  function toggleLike(postId) {
    const alreadyLiked = likedPosts.includes(postId);
    const post = posts.find((item) => item.id === postId);

    setLikedPosts((current) =>
      alreadyLiked
        ? current.filter((id) => id !== postId)
        : [...current, postId]
    );

    setPosts((current) =>
      current.map((post) =>
        post.id === postId
          ? { ...post, likes: Math.max(0, post.likes + (alreadyLiked ? -1 : 1)) }
          : post
      )
    );
    if (!alreadyLiked && post) {
      addNotification({ type: "like", title: "You liked a post", message: `You reacted to ${post.name}'s update.` });
    }
  }

  function toggleComments(postId) {
    setOpenComments((current) =>
      current.includes(postId)
        ? current.filter((id) => id !== postId)
        : [...current, postId]
    );
  }

  function addComment(event, postId) {
    event.preventDefault();
    const text = (commentDrafts[postId] || "").trim();

    if (!text) return;

    setPosts((current) =>
      current.map((post) =>
        post.id === postId
          ? {
              ...post,
              comments: [
                ...post.comments,
                {
                  id: Date.now(),
                  name: "You",
                  text,
                },
              ],
            }
          : post
      )
    );

    const post = posts.find((item) => item.id === postId);
    if (post) addNotification({ type: "comment", title: "You commented on a post", message: `You joined the conversation on ${post.name}'s update.` });

    setCommentDrafts((current) => ({ ...current, [postId]: "" }));
  }

  async function sharePost(post) {
    const shareText = `${post.name} on Connectly:\n${post.text}`;

    try {
      if (navigator.share) {
        await navigator.share({ title: "Connectly post", text: shareText });
      } else if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareText);
        window.alert("Post text copied!");
      } else {
        window.alert(shareText);
      }
    } catch (error) {
      if (error.name !== "AbortError") {
        window.alert("Unable to share this post right now.");
      }
    }
  }

  return (
    <div className="space-y-5">
      {/* CREATE POST */}
      <section className="rounded-2xl border border-white/10 bg-[#1b1b1b] p-4 sm:p-5">
        <h2 className="font-semibold">Share with your community</h2>
        <p className="mt-1 text-xs text-gray-500">
          Share a project, learning milestone or achievement.
        </p>

        <textarea
          value={postText}
          onChange={(event) => setPostText(event.target.value)}
          placeholder="What are you learning or building today?"
          rows={4}
          maxLength={3000}
          className="mt-4 w-full resize-y rounded-xl border border-white/10 bg-[#202020] p-4 text-sm leading-6 text-white outline-none placeholder:text-gray-500 focus:border-yellow-400"
        />

        {image && (
          <div className="relative mt-3">
            <img
              src={image}
              alt="Post preview"
              className="max-h-80 w-full rounded-xl border border-white/10 object-contain"
            />
            <button
              type="button"
              onClick={() => {
                setImage("");
                if (imageInputRef.current) imageInputRef.current.value = "";
              }}
              aria-label="Remove selected image"
              className="absolute right-2 top-2 rounded-full bg-black/80 p-2 text-white hover:bg-black"
            >
              <X size={17} />
            </button>
          </div>
        )}

        <div className="mt-4">
          <p className="mb-2 text-xs font-medium text-gray-400">
            Choose a post category
          </p>
          <div className="flex flex-wrap gap-2">
            {categories.map(({ name, icon: Icon }) => (
              <button
                key={name}
                type="button"
                onClick={() => setCategory(name)}
                className={`flex items-center gap-1.5 rounded-full border px-3 py-2 text-xs transition ${
                  category === name
                    ? "border-yellow-400 bg-yellow-400/10 text-yellow-300"
                    : "border-white/10 text-gray-400 hover:border-white/30"
                }`}
              >
                <Icon size={14} />
                {name}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-4">
          <div>
            <input
              ref={imageInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
              id="post-image"
            />
            <label
              htmlFor="post-image"
              className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-2 text-sm text-gray-400 hover:bg-white/[0.05] hover:text-yellow-400"
            >
              <ImagePlus size={18} />
              Add photo
            </label>
          </div>

          <button
            type="button"
            onClick={createPost}
            disabled={!postText.trim() && !image}
            className="flex items-center gap-2 rounded-xl bg-yellow-400 px-5 py-2.5 text-sm font-semibold text-black transition hover:bg-yellow-300 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Send size={16} />
            Post
          </button>
        </div>

        {error && (
          <p role="alert" className="mt-3 text-sm text-red-300">
            {error}
          </p>
        )}
      </section>

      {/* FEED POSTS */}
      {posts.length === 0 && (
        <section className="rounded-2xl border border-white/10 bg-[#1b1b1b] px-5 py-12 text-center">
          <BookOpen size={32} className="mx-auto text-yellow-400" />
          <h3 className="mt-4 font-semibold">Your feed is waiting</h3>
          <p className="mt-2 text-sm text-gray-400">
            Share your first update with the community.
          </p>
        </section>
      )}

      {posts.map((post) => {
        const liked = likedPosts.includes(post.id);
        const comments = Array.isArray(post.comments) ? post.comments : [];

        return (
          <article
            key={post.id}
            className="rounded-2xl border border-white/10 bg-[#1b1b1b] p-4 sm:p-5"
          >
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-yellow-400/10 font-semibold text-yellow-400">
                {post.avatar ? <img src={post.avatar} alt={`${post.name}'s profile`} className="h-full w-full object-cover" /> : post.name.charAt(0)}
              </div>

              <div className="min-w-0 flex-1">
                <h3 className="truncate text-sm font-semibold">{post.name}</h3>
                <p className="mt-1 text-xs text-gray-400">{post.role}</p>
                <p className="mt-1 text-xs text-gray-500">{post.time}</p>
              </div>

              <div className="flex flex-col items-end gap-2">
                <span
                  className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${
                    categoryColors[post.category] || categoryColors.General
                  }`}
                >
                  {post.category || "General"}
                </span>

                {(post.name === "Your Name" || post.name === (() => { try { return JSON.parse(localStorage.getItem("connectly-profile") || "{}").name; } catch { return ""; } })()) && (
                  <button
                    type="button"
                    aria-label="Delete post"
                    title="Delete post"
                    onClick={() => deletePost(post.id)}
                    className="rounded-lg p-1.5 text-gray-500 hover:bg-red-400/10 hover:text-red-300"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            </div>

            {post.text && (
              <p className="mt-4 whitespace-pre-wrap break-words text-sm leading-7 text-gray-200">
                {post.text}
              </p>
            )}

            {post.image && (
              <img
                src={post.image}
                alt="Shared by a student"
                className="mt-4 max-h-[480px] w-full rounded-xl border border-white/10 object-contain"
              />
            )}

            <div className="mt-4 flex items-center justify-between border-b border-white/10 pb-3 text-xs text-gray-400">
              <span>{post.likes} likes</span>
              <button
                type="button"
                onClick={() => toggleComments(post.id)}
                className="hover:text-yellow-400"
              >
                {comments.length} comments
              </button>
            </div>

            <div className="grid grid-cols-3 gap-1 pt-3 sm:gap-2">
              <button
                type="button"
                onClick={() => toggleLike(post.id)}
                className={`flex items-center justify-center gap-2 rounded-lg py-2.5 text-xs transition hover:bg-white/[0.06] sm:text-sm ${
                  liked ? "text-yellow-400" : "text-gray-400"
                }`}
              >
                <ThumbsUp size={17} />
                Like
              </button>

              <button
                type="button"
                onClick={() => toggleComments(post.id)}
                className="flex items-center justify-center gap-2 rounded-lg py-2.5 text-xs text-gray-400 transition hover:bg-white/[0.06] hover:text-white sm:text-sm"
              >
                <MessageCircle size={17} />
                Comment
              </button>

              <button
                type="button"
                onClick={() => sharePost(post)}
                className="flex items-center justify-center gap-2 rounded-lg py-2.5 text-xs text-gray-400 transition hover:bg-white/[0.06] hover:text-white sm:text-sm"
              >
                <Share2 size={17} />
                Share
              </button>
            </div>

            {/* COMMENTS */}
            {openComments.includes(post.id) && (
              <div className="mt-3 border-t border-white/10 pt-4">
                <div className="space-y-3">
                  {comments.map((comment) => (
                    <div
                      key={comment.id}
                      className="flex items-start gap-2.5"
                    >
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/[0.08] text-xs font-semibold text-yellow-400">
                        {comment.name.charAt(0)}
                      </div>

                      <div className="min-w-0 flex-1 rounded-xl bg-white/[0.04] px-3 py-2">
                        <p className="text-xs font-semibold">{comment.name}</p>
                        <p className="mt-1 break-words text-sm text-gray-300">
                          {comment.text}
                        </p>
                      </div>
                    </div>
                  ))}

                  {comments.length === 0 && (
                    <p className="text-xs text-gray-500">
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
                    className="min-w-0 flex-1 rounded-xl border border-white/10 bg-[#202020] px-3 py-2.5 text-sm outline-none placeholder:text-gray-500 focus:border-yellow-400"
                  />
                  <button
                    type="submit"
                    aria-label="Send comment"
                    className="rounded-xl bg-yellow-400 px-3 text-black hover:bg-yellow-300"
                  >
                    <Send size={17} />
                  </button>
                </form>
              </div>
            )}
          </article>
        );
      })}
    </div>
  );
}

export default Feed;
