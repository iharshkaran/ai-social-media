
import { MapPin, GraduationCap, Code2 } from "lucide-react";

function LeftSidebar() {
  return (
    <div className="space-y-4">
      <section className="overflow-hidden rounded-2xl border border-white/10 bg-[#1b1b1b]">
        <div className="h-20 bg-gradient-to-r from-yellow-500/30 via-yellow-400/10 to-transparent" />

        <div className="-mt-10 px-5 pb-5">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl border-4 border-[#1b1b1b] bg-[#303030] text-yellow-400">
            <GraduationCap size={30} />
          </div>

          <h2 className="mt-3 text-lg font-semibold">Your Name</h2>
          <p className="text-sm text-gray-400">Student · B.Tech CSE</p>

          <div className="mt-3 flex items-center gap-2 text-xs text-gray-400">
            <MapPin size={14} />
            <span>Your College · Your City</span>
          </div>

          <div className="my-4 border-t border-white/10" />

          <div className="grid grid-cols-2 gap-3 text-center">
            <div className="rounded-xl bg-white/[0.04] p-3">
              <p className="text-lg font-bold text-yellow-400">0</p>
              <p className="text-xs text-gray-400">Connections</p>
            </div>

            <div className="rounded-xl bg-white/[0.04] p-3">
              <p className="text-lg font-bold text-yellow-400">0</p>
              <p className="text-xs text-gray-400">Posts</p>
            </div>
          </div>

          <button className="mt-4 w-full rounded-xl border border-white/10 py-2 text-sm hover:border-yellow-400 hover:text-yellow-400">
            View Profile
          </button>
        </div>
      </section>

      <section className="rounded-2xl border border-white/10 bg-[#1b1b1b] p-5">
        <h3 className="flex items-center gap-2 font-semibold">
          <Code2 size={18} className="text-yellow-400" />
          Your Skills
        </h3>

        <div className="mt-4 flex flex-wrap gap-2">
          {["React", "JavaScript", "C++", "Node.js", "DSA"].map((skill) => (
            <span
              key={skill}
              className="rounded-lg bg-white/[0.06] px-3 py-1.5 text-xs text-gray-300"
            >
              {skill}
            </span>
          ))}
        </div>

        <button className="mt-4 text-sm text-yellow-400 hover:text-yellow-300">
          + Add skills
        </button>
      </section>
    </div>
  );
}

export default LeftSidebar;
