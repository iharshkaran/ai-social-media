
import { useEffect, useState } from "react";
import { MapPin, GraduationCap, Code2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import { useConnectlyStore } from "../store/useConnectlyStore";

function LeftSidebar() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [postCount, setPostCount] = useState(0);
    const [connectionCount, setConnectionCount] = useState(0);
    const profile = user || {};
    const name = profile.name || "Student";
    const skills = Array.isArray(profile.skills) ? profile.skills : [];

    useEffect(() => {
        let active = true;
        const refresh = async () => {
            try {
                const [posts, network] = await Promise.all([useConnectlyStore.getState().loadPosts(), useConnectlyStore.getState().loadConnections()]);
                if (active) {
                    setPostCount(useConnectlyStore.getState().ownPostCount ?? posts.filter((post) => post.authorId === user?.id).length);
                    setConnectionCount(network.connected.length);
                }
            } catch {
                // The feed remains usable when sidebar counts cannot be refreshed.
            }
        };
        refresh();
        window.addEventListener("connectly:backend-update", refresh);
        return () => {
            active = false;
            window.removeEventListener("connectly:backend-update", refresh);
        };
    }, [user?.id]);
    return (
        <div className="space-y-4">
            <section className="overflow-hidden rounded-2xl border border-white/10 bg-[#1b1b1b]">
                <div className="h-20 bg-gradient-to-r from-yellow-500/30 via-yellow-400/10 to-transparent" />

                <div className="-mt-10 px-5 pb-5">
                    <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl border-4 border-[#1b1b1b] bg-[#303030] text-yellow-400">
                        {profile.photo ? <img src={profile.photo} alt={`${name}'s profile`} decoding="async" className="h-full w-full object-cover" /> : <GraduationCap size={30} />}
                    </div>

                    <h2 className="mt-3 text-lg font-semibold">{name}</h2>
                    <p className="text-sm text-gray-400">{profile.headline || "Add a headline to your profile"}</p>

                    <div className="mt-3 flex items-center gap-2 text-xs text-gray-400">
                        <MapPin size={14} />
                        <span>{[profile.university, profile.location].filter(Boolean).join(" · ") || "Add your college and city"}</span>
                    </div>

                    <div className="my-4 border-t border-white/10" />

                    <div className="grid grid-cols-2 gap-3 text-center">
                        <div className="rounded-xl bg-white/[0.04] p-3">
                            <p className="text-lg font-bold text-yellow-400">{connectionCount}</p>
                            <p className="text-xs text-gray-400">Connections</p>
                        </div>

                        <div className="rounded-xl bg-white/[0.04] p-3">
                            <p className="text-lg font-bold text-yellow-400">{postCount}</p>
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
