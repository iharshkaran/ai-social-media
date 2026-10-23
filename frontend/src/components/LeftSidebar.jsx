
import { MapPin, GraduationCap, Code2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

function LeftSidebar() {
    const navigate = useNavigate();
    let profile = {};
    let posts = [];
    let connectionCount = 0;
    try {
        profile = JSON.parse(localStorage.getItem("connectly-profile") || "{}");
        posts = JSON.parse(localStorage.getItem("connectly-posts") || "[]");
        const connections = JSON.parse(localStorage.getItem("connectly-connections") || "{}");
        connectionCount = Array.isArray(connections.connected) ? connections.connected.length : 0;
    } catch {
        // Use the demo profile when browser storage is unavailable.
    }
    const name = profile.name || "Your Name";
    const skills = Array.isArray(profile.skills) ? profile.skills : ["React", "JavaScript", "C++"];
    return (
        <div className="space-y-4">
            <section className="overflow-hidden rounded-2xl border border-white/10 bg-[#1b1b1b]">
                <div className="h-20 bg-gradient-to-r from-yellow-500/30 via-yellow-400/10 to-transparent" />

                <div className="-mt-10 px-5 pb-5">
                    <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl border-4 border-[#1b1b1b] bg-[#303030] text-yellow-400">
                        {profile.photo ? <img src={profile.photo} alt={`${name}'s profile`} className="h-full w-full object-cover" /> : <GraduationCap size={30} />}
                    </div>

                    <h2 className="mt-3 text-lg font-semibold">{name}</h2>
                    <p className="text-sm text-gray-400">{profile.headline || "Student · B.Tech CSE"}</p>

                    <div className="mt-3 flex items-center gap-2 text-xs text-gray-400">
                        <MapPin size={14} />
                        <span>{[profile.university, profile.location].filter(Boolean).join(" · ") || "Your College · Your City"}</span>
                    </div>

                    <div className="my-4 border-t border-white/10" />

                    <div className="grid grid-cols-2 gap-3 text-center">
                        <div className="rounded-xl bg-white/[0.04] p-3">
                            <p className="text-lg font-bold text-yellow-400">{connectionCount}</p>
                            <p className="text-xs text-gray-400">Connections</p>
                        </div>

                        <div className="rounded-xl bg-white/[0.04] p-3">
                            <p className="text-lg font-bold text-yellow-400">{posts.length}</p>
                            <p className="text-xs text-gray-400">Posts</p>
                        </div>
                    </div>


                    <button
                        onClick={() => navigate("/profile")}
                        className="mt-4 w-full rounded-xl border border-white/10 py-2 text-sm transition hover:border-yellow-400 hover:text-yellow-400"
                    >
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
                    {skills.map((skill) => (
                        <span
                            key={skill}
                            className="rounded-lg bg-white/[0.06] px-3 py-1.5 text-xs text-gray-300"
                        >
                            {skill}
                        </span>
                    ))}
                    {skills.length === 0 && <p className="text-xs text-gray-500">Add skills to complete your profile.</p>}
                </div>

                <button onClick={() => navigate("/profile")} className="mt-4 text-sm text-yellow-400 hover:text-yellow-300">
                    + Add skills
                </button>
            </section>
        </div>
    );
}

export default LeftSidebar;
