
import { useState } from "react";
import {
  ImagePlus,
  Smile,
  ThumbsUp,
  MessageCircle,
  Share2,
  Send,
} from "lucide-react";

const initialPosts = [
  {
    id: 1,
    name: "Aarav Sharma",
    role: "B.Tech CSE · 3rd Year",
    time: "2 hours ago",
    text: "Just completed a new React project! Learning by building is the best way to grow. 🚀",
    likes: 12,
    comments: 3,
  },
  {
    id: 2,
    name: "Priya Verma",
    role: "Computer Science Student",
    time: "5 hours ago",
    text: "Consistency beats motivation. One DSA problem and one new concept every day. Let's grow together! 💛",
    likes: 24,
    comments: 6,
  },
];

function Feed() {
  const [postText, setPostText] = useState("");
  const [posts, setPosts] = useState(initialPosts);
  const [likedPosts, setLikedPosts] = useState([]);

  function createPost() {
    if (!postText.trim()) return;

    const newPost = {
      id: Date.now(),
      name: "Your Name",
      role: "Student · B.Tech CSE",
      time: "Just now",
      text: postText.trim(),
      likes: 0,
      comments: 0,
    };

    setPosts((currentPosts) => [newPost, ...currentPosts]);
    setPostText("");
  }

  function toggleLike(postId) {
    const alreadyLiked = likedPosts.includes(postId);

    setLikedPosts((current) =>
      alreadyLiked
        ? current.filter((id) => id !== postId)
        : [...current, postId]
    );

    setPosts((currentPosts) =>
      currentPosts.map((post) =>
        post.id === postId
          ? { ...post, likes: post.likes + (alreadyLiked ? -1 : 1) }
          : post
      )
    );
  }

  return (
    <div className="space-y-5">
      {/* Create post */}
      <section className="rounded-2xl border border-white/10 bg-[#1b1b1b] p-4 sm:p-5">
        <h2 className="mb-4 font-semibold">Share with your community</h2>

        <textarea
          value={postText}
          onChange={(event) => setPostText(event.target.value)}
          placeholder="What are you learning or building today?"
          rows={3}
          className="w-full resize-y rounded-xl border border-white/10 bg-[#242424] p-4 text-sm outline-none placeholder:text-gray-500 focus:border-yellow-400"
        />

        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex gap-3 text-sm text-gray-400">
            <span className="flex items-center gap-1.5">
              <ImagePlus size={17} />
              Photo (soon)
            </span>
            <span className="flex items-center gap-1.5">
              <Smile size={17} />
              Update
            </span>
          </div>

          <button
            onClick={createPost}
            disabled={!postText.trim()}
            className="flex items-center gap-2 rounded-xl bg-yellow-400 px-4 py-2 text-sm font-semibold text-black transition hover:bg-yellow-300 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Send size={15} />
            Post
          </button>
        </div>
      </section>

      {/* Feed posts */}
      {posts.map((post) => {
        const liked = likedPosts.includes(post.id);

        return (
          <article
            key={post.id}
            className="rounded-2xl border border-white/10 bg-[#1b1b1b] p-4 sm:p-5"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-yellow-400/10 font-semibold text-yellow-400">
                {post.name.charAt(0)}
              </div>

              <div className="min-w-0 flex-1">
                <h3 className="truncate text-sm font-semibold">{post.name}</h3>
                <p className="text-xs text-gray-400">{post.role}</p>
                <p className="mt-1 text-xs text-gray-500">{post.time}</p>
              </div>
            </div>

            <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-gray-200">
              {post.text}
            </p>

            <div className="mt-4 flex items-center justify-between border-b border-white/10 pb-3 text-xs text-gray-400">
              <span>{post.likes} likes</span>
              <span>{post.comments} comments</span>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-3">
              <button
                onClick={() => toggleLike(post.id)}
                className={`flex items-center justify-center gap-2 rounded-lg py-2 text-sm transition hover:bg-white/[0.06] ${
                  liked ? "text-yellow-400" : "text-gray-400"
                }`}
              >
                <ThumbsUp size={17} />
                Like
              </button>

              <button className="flex items-center justify-center gap-2 rounded-lg py-2 text-sm text-gray-400 hover:bg-white/[0.06]">
                <MessageCircle size={17} />
                Comment
              </button>

              <button className="flex items-center justify-center gap-2 rounded-lg py-2 text-sm text-gray-400 hover:bg-white/[0.06]">
                <Share2 size={17} />
                Share
              </button>
            </div>
          </article>
        );
      })}
    </div>
  );
}

export default Feed;
