
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
            <section className="overflow-hidden rounded-[26px] border-2 border-[#191a32] bg-white shadow-[4px_5px_0_#191a32]">
                <div className="relative h-20 overflow-hidden bg-gradient-to-r from-[#c9bcff] via-[#ffafd0] to-[#87d4f4]">
                    {profile.banner && <img src={profile.banner} alt={`${name}'s profile banner`} decoding="async" className="absolute inset-0 h-full w-full object-cover" />}
                </div>

                <div className="-mt-10 px-5 pb-5">
                    <button type="button" onClick={() => navigate("/profile")} aria-label="Open your profile" className="relative z-10 flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl border-4 border-white bg-[#f0ebdf] text-[#6f56d9] transition hover:scale-[1.03]">
                        {profile.photo ? <img src={profile.photo} alt={`${name}'s profile`} decoding="async" className="h-full w-full object-cover" /> : <GraduationCap size={30} />}
                    </button>

                    <h2 className="mt-3"><button type="button" onClick={() => navigate("/profile")} className="text-left text-lg font-semibold hover:text-[#5947a8]">{name}</button></h2>
                    <p className="text-sm text-[#6e6a7b]">{profile.headline || "Add a headline to your profile"}</p>

                    <div className="mt-3 flex items-center gap-2 text-xs text-[#6e6a7b]">
                        <MapPin size={14} />
                        <span>{[profile.university, profile.location].filter(Boolean).join(" · ") || "Add your college and city"}</span>
                    </div>

                    <div className="my-3 border-t border-[#e7dfd0]" />

                    <div className="grid grid-cols-2 gap-2 text-center">
                        <div className="rounded-xl border border-[#e7dfd0] bg-[#fff3b7] px-2 py-1.5">
                            <p className="text-base font-bold leading-5 text-[#6f56d9]">{connectionCount}</p>
                            <p className="whitespace-nowrap text-[10px] leading-4 text-[#6e6a7b]">Connections</p>
                        </div>

                        <div className="rounded-xl border border-[#e7dfd0] bg-[#c9bcff]/55 px-2 py-1.5">
                            <p className="text-base font-bold leading-5 text-[#6f56d9]">{postCount}</p>
                            <p className="whitespace-nowrap text-[10px] leading-4 text-[#6e6a7b]">Posts</p>
                        </div>
                    </div>


                    <button
                        onClick={() => navigate("/profile")}
                        className="mt-4 w-full rounded-xl border-2 border-[#191a32] bg-white py-2 text-sm font-semibold shadow-[0_3px_0_#c9bcff] transition hover:-translate-y-0.5"
                    >
                        View Profile
                    </button>
                </div>
            </section>

            <section className="rounded-[26px] border-2 border-[#191a32] bg-white p-5 shadow-[4px_5px_0_#c9bcff]">
                <h3 className="flex items-center gap-2 font-semibold">
                    <Code2 size={18} className="text-[#6f56d9]" />
                    Your Skills
                </h3>

                <div className="mt-4 flex flex-wrap gap-2">
                    {skills.map((skill) => (
                        <span
                            key={skill}
                            className="rounded-lg bg-[#f4f0e8] px-3 py-1.5 text-xs text-[#514e62]"
                        >
                            {skill}
                        </span>
                    ))}
                    {skills.length === 0 && <p className="text-xs text-[#858191]">Add skills to complete your profile.</p>}
                </div>

                <button onClick={() => navigate("/profile")} className="mt-4 text-sm text-[#6f56d9] hover:text-[#5947a8]">
                    + Add skills
                </button>
            </section>
        </div>
    );
}

export default LeftSidebar;
