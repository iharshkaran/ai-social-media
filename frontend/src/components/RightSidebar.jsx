
import { useEffect, useState } from "react";
import { UserPlus, TrendingUp, ArrowUpRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useConnectlyStore } from "../store/useConnectlyStore";

const topics = ["Web Development", "Hackathons", "Data Structures", "Internships"];

function RightSidebar() {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  useEffect(() => {
    let active = true;
    const load = () => useConnectlyStore.getState().loadStudents().then((people) => { if (active) setStudents(people.slice(0, 3)); }).catch(() => {});
    load();
    window.addEventListener("connectly:backend-update", load);
    return () => { active = false; window.removeEventListener("connectly:backend-update", load); };
  }, []);
  return (
    <div className="space-y-5">
      <section className="rounded-2xl border border-white/10 bg-[#1b1b1b] p-5">
        <h2 className="font-semibold">People you may know</h2>

        <div className="mt-4 space-y-4">
          {students.map((student) => (
            <div key={student.id} className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/[0.08] font-semibold text-yellow-400">
                {student.photo ? <img src={student.photo} alt="" className="h-full w-full rounded-full object-cover" /> : student.name.charAt(0)}
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{student.name}</p>
                <p className="truncate text-xs text-gray-400">{student.headline || student.course || "Connectly student"}</p>
              </div>

              <button
                aria-label={`Connect with ${student.name}`}
                title="Connect"
                onClick={() => navigate("/explore")}
                className="rounded-lg p-2 text-yellow-400 hover:bg-yellow-400/10"
              >
                <UserPlus size={17} />
              </button>
            </div>
          ))}
        </div>

        {students.length === 0 && <p className="mt-4 text-xs text-gray-500">More students will appear here as they join Connectly.</p>}

        <button onClick={() => navigate("/explore")} className="mt-5 flex items-center gap-1 text-sm text-yellow-400 hover:text-yellow-300">
          Discover students <ArrowUpRight size={15} />
        </button>
      </section>

      <section className="rounded-2xl border border-white/10 bg-[#1b1b1b] p-5">
        <h2 className="flex items-center gap-2 font-semibold">
          <TrendingUp size={18} className="text-yellow-400" />
          Trending on campus
        </h2>

        <div className="mt-4 space-y-4">
          {topics.map((topic, index) => (
            <div key={topic}>
              <p className="text-xs text-gray-500">#{index + 1} · Student community</p>
              <p className="mt-1 text-sm font-medium">{topic}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="px-2 text-xs leading-6 text-gray-500">
        About · Community Guidelines · Privacy
        <p>© 2026 Connectly · Built for students</p>
      </footer>
    </div>
  );
}

export default RightSidebar;
