import { ArrowLeft, Plus } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Feed from "../components/Feed";

export default function CreatePost() {
  const navigate = useNavigate();

  return <div className="min-h-screen orbit-pattern-bg text-[#17182d]">
    <Navbar />
    <main className="mx-auto max-w-2xl px-4 pb-28 pt-5 sm:px-6 sm:pt-8">
      <Link to="/home" className="mb-5 inline-flex items-center gap-2 rounded-lg px-2 py-2 text-sm font-semibold text-[#514e62] hover:bg-white/70 hover:text-[#5947a8]"><ArrowLeft size={17} /> Back to feed</Link>
      <header className="mb-5">
        <p className="inline-flex items-center gap-1.5 rounded-full bg-[#eee9ff] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-[#5947a8]"><Plus size={13} /> Your community</p>
        <h1 className="mt-3 text-2xl font-black tracking-[-0.03em] sm:text-3xl">Create a post</h1>
        <p className="mt-1 text-sm text-[#6e6a7b]">Share a project, a new skill, or a small win.</p>
      </header>
      <Feed composerOnly onPostCreated={() => navigate("/home", { replace: true })} />
    </main>
  </div>;
}
