
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
      <section className="rounded-[26px] border-2 border-[#191a32] bg-white p-5 shadow-[4px_5px_0_#ffafd0]">
        <h2 className="font-semibold">People you may know</h2>

        <div className="mt-4 space-y-4">
          {students.map((student) => (
            <div key={student.id} className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-2xl border-2 border-[#191a32] bg-[#c9bcff] font-semibold text-[#5947a8]">
                {student.photo ? <img src={student.photo} alt="" loading="lazy" decoding="async" className="h-full w-full rounded-full object-cover" /> : student.name.charAt(0)}
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{student.name}</p>
                <p className="truncate text-xs text-[#6e6a7b]">{student.headline || student.course || "OrbitU student"}</p>
              </div>

              <button
                aria-label={`Connect with ${student.name}`}
                title="Connect"
                onClick={() => navigate("/explore")}
                className="rounded-lg p-2 text-[#6f56d9] hover:bg-[#eee9ff]"
              >
                <UserPlus size={17} />
              </button>
            </div>
          ))}
        </div>

        {students.length === 0 && <p className="mt-4 text-xs text-[#858191]">More students will appear here as they join OrbitU.</p>}

        <button onClick={() => navigate("/explore")} className="mt-5 flex items-center gap-1 text-sm text-[#6f56d9] hover:text-[#5947a8]">
          Discover students <ArrowUpRight size={15} />
        </button>
      </section>

      <section className="rounded-[26px] border-2 border-[#191a32] bg-[#fffdf9] p-5 shadow-[4px_5px_0_#87d4f4]">
        <h2 className="flex items-center gap-2 font-semibold">
          <TrendingUp size={18} className="text-[#6f56d9]" />
          Trending on campus
        </h2>

        <div className="mt-4 space-y-4">
          {topics.map((topic, index) => (
            <div key={topic}>
              <p className="text-xs text-[#858191]">#{index + 1} · Student community</p>
              <p className="mt-1 text-sm font-medium">{topic}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="px-2 text-xs leading-6 text-[#858191]">
        About · Community Guidelines · Privacy
        <p>© 2026 OrbitU · Built for students</p>
      </footer>
    </div>
  );
}

export default RightSidebar;
