
import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import { api } from "../utils/api";
import { useConnectlyStore } from "../store/useConnectlyStore";

import {
  Search,
  MapPin,
  GraduationCap,
  UserPlus,
  UserCheck,
  Code2,
  Users,
  School,
} from "lucide-react";

const filters = ["All", "B.Tech", "B.E.", "BCA", "B.Sc", "BBA", "M.Tech", "MCA"];
const colors = ["bg-[#c9bcff] text-[#5947a8]", "bg-[#ffafd0] text-[#843454]", "bg-[#87d4f4] text-[#245a70]", "bg-[#fff3b7] text-[#5947a8]", "bg-[#b9e7c8] text-[#28734d]", "bg-[#ffd2a6] text-[#80501f]"];
const emptyConnections = { incoming: [], outgoing: [], connected: [] };

async function loadExploreData(query = "", force = false, page = 1) {
  const [result, network] = await Promise.all([
    useConnectlyStore.getState().loadStudents(query, force, page),
    page === 1 ? useConnectlyStore.getState().loadConnections(force) : Promise.resolve(useConnectlyStore.getState().connections || emptyConnections),
  ]);
  const students = result.data.map((person, index) => ({ ...person, id: String(person.id), initials: person.name.split(/\s+/).map((part) => part[0]).join("").slice(0, 2), college: person.university || "University not added", course: person.course || "Course not added", headline: person.headline || "OrbitU student", year: person.year || "", location: person.location || "", skills: person.skills || [], color: colors[((page - 1) * 12 + index) % colors.length] }));
  return { students, network, page: result.page, hasMore: result.hasMore };
}

export default function Explore() {
  const [searchParams] = useSearchParams();
  const [search, setSearch] = useState(() => searchParams.get("q") || "");
  const [selectedCourse, setSelectedCourse] = useState("All");
  const [students, setStudents] = useState([]);
  const [connections, setConnections] = useState({ incoming: [], outgoing: [], connected: [] });
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [busyId, setBusyId] = useState("");
  const [error, setError] = useState("");

  async function refreshConnections() {
    try {
      const network = await useConnectlyStore.getState().loadConnections(true);
      setConnections(network);
      setError("");
    } catch (requestError) { setError(requestError.message); }
  }

  useEffect(() => {
    let active = true;
    setPage(1);
    setLoading(true);
    setLoadingMore(false);
    setStudents([]);
    setHasMore(false);
    const load = () => {
      loadExploreData(search, false, 1).then(({ students: people, network, hasMore: more, page: loadedPage }) => { if (active) { setStudents(people); setConnections(network); setHasMore(more); setPage(loadedPage); setError(""); } }).catch((requestError) => { if (active) setError(requestError.message); }).finally(() => { if (active) setLoading(false); });
    };
    const initialTimer = window.setTimeout(load, 250);
    const refreshTimer = window.setInterval(() => {
      useConnectlyStore.getState().loadConnections(true).then((network) => { if (active) setConnections(network); }).catch(() => {});
    }, 20000);
    return () => { active = false; window.clearTimeout(initialTimer); window.clearInterval(refreshTimer); };
  }, [search]);

  async function loadMoreStudents() {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    setError("");
    try {
      const requestedPage = page + 1;
      const { students: nextStudents, hasMore: more, page: loadedPage } = await loadExploreData(search, false, requestedPage);
      setStudents((current) => {
        const existingIds = new Set(current.map((student) => student.id));
        return [...current, ...nextStudents.filter((student) => !existingIds.has(student.id))];
      });
      setPage(loadedPage || requestedPage);
      setHasMore(more);
    } catch (requestError) { setError(requestError.message); }
    finally { setLoadingMore(false); }
  }

  const filteredStudents = useMemo(() => {
    const term = search.trim().toLowerCase();
    return students.filter((student) => {
      const matchesSearch = !term || student.name.toLowerCase().includes(term) || student.college.toLowerCase().includes(term) || student.skills.some((skill) => skill.toLowerCase().includes(term));
      const matchesCourse = selectedCourse === "All" || student.course === selectedCourse;
      return matchesSearch && matchesCourse;
    });
  }, [students, search, selectedCourse]);

  async function toggleConnection(studentId) {
    setBusyId(studentId);
    setError("");
    try {
      const existing = connections.outgoing.find((request) => request.studentId === studentId);
      if (existing) await api.removeConnection(existing.id);
      else await api.requestConnection(studentId);
      await refreshConnections();
      window.dispatchEvent(new Event("connectly:backend-update"));
    } catch (requestError) { setError(requestError.message); }
    finally { setBusyId(""); }
  }

  async function respondToRequest(request, accept) {
    setBusyId(request.id);
    setError("");
    try {
      await api.respondConnection(request.id, accept ? "accept" : "reject");
      await refreshConnections();
      window.dispatchEvent(new Event("connectly:backend-update"));
    } catch (requestError) { setError(requestError.message); }
    finally { setBusyId(""); }
  }
  return (
    <div className="min-h-screen orbit-pattern-bg text-[#17182d]">
      <Navbar />
      {error && <p role="alert" className="mx-auto max-w-7xl px-4 pt-4 text-sm text-[#a33b48] sm:px-6 lg:px-8">{error}</p>}

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <section className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-3xl font-black tracking-[-0.04em] sm:text-4xl">Find your kind of people.</h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-[#656174]">
                Discover students, share what you are building, and meet people who make your next idea better.
              </p>
            </div>
            <Link to="/connections" className="inline-flex w-fit shrink-0 items-center gap-2 rounded-xl border-2 border-[#191a32] bg-white px-4 py-2.5 text-sm font-semibold text-[#17182d] shadow-[0_3px_0_#c9bcff] transition hover:-translate-y-0.5">
              <Users size={16} /> Manage connections
            </Link>
        </section>

        {connections.incoming.length > 0 && (
          <section className="mb-8 rounded-[26px] border-2 border-[#191a32] bg-white p-5 shadow-[4px_5px_0_#ffafd0]">
            <div className="mb-4 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold">Connection requests</h2>
                <p className="mt-1 text-sm text-[#6e6a7b]">People who would like to join your network.</p>
              </div>
              <span className="rounded-full bg-[#eee9ff] px-3 py-1 text-xs font-medium text-[#5947a8]">{connections.incoming.length} pending</span>
            </div>
            <div className="divide-y divide-[#e7dfd0]">
              {connections.incoming.map((request) => (
                <div key={request.id} className="flex flex-wrap items-center gap-3 py-4 first:pt-0 last:pb-0">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border-2 border-[#191a32] bg-[#ffafd0] font-bold text-[#843454]">{request.initials || request.name.slice(0, 1)}</div>
                  <div className="min-w-0 flex-1"><p className="font-medium">{request.name}</p><p className="text-sm text-[#6e6a7b]">{request.role}</p></div>
                  <div className="flex gap-2">
                    <button disabled={busyId === request.id} onClick={() => respondToRequest(request, true)} className="rounded-lg border-2 border-[#191a32] bg-[#ffe35b] px-3 py-2 text-xs font-bold text-black shadow-[0_2px_0_#191a32] hover:-translate-y-0.5 disabled:opacity-50">Accept</button>
                    <button disabled={busyId === request.id} onClick={() => respondToRequest(request, false)} className="rounded-lg border border-[#e7dfd0] px-3 py-2 text-xs text-[#514e62] hover:bg-[#f4f0e8] disabled:opacity-50">Decline</button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        <section className="mb-8 rounded-[26px] border-2 border-[#191a32] bg-white p-4 shadow-[4px_5px_0_#c9bcff] sm:p-5">
          <div className="relative">
            <Search
              size={19}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-[#858191]"
            />

            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setLoading(true);
                setStudents([]);
                setPage(1);
                setHasMore(false);
              }}
              placeholder="Search students, colleges or skills..."
              className="w-full rounded-2xl border-2 border-[#e7dfd0] bg-[#fffdf9] py-3.5 pl-12 pr-4 text-sm outline-none transition placeholder:text-[#a29eac] focus:border-[#7660dc]"
            />
          </div>

          <div className="mt-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[#858191]">Course</p>
          <div className="flex flex-wrap gap-2">
            {filters.map((filter) => (
              <button
                key={filter}
                onClick={() => setSelectedCourse(filter)}
                className={`rounded-full border px-4 py-2 text-sm transition ${
                  selectedCourse === filter
                    ? "border-[#191a32] bg-[#ffe35b] font-semibold text-black shadow-[0_2px_0_#191a32]"
                    : "border-[#e7dfd0] bg-[#fffdf9] text-[#6e6a7b] hover:border-[#d9cffb] hover:text-[#17182d]"
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
          </div>
        </section>

        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Students you may know</h2>
          <span className="text-sm text-[#858191]">
            {filteredStudents.length} students shown
          </span>
        </div>

        {loading ? <p className="rounded-2xl border border-[#e7dfd0] bg-white px-5 py-14 text-center text-sm text-[#6e6a7b]">Loading students...</p> : filteredStudents.length > 0 ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filteredStudents.map((student) => {
              const isPending = connections.outgoing.some((request) => request.studentId === student.id);
              const isConnected = connections.connected.some((item) => item.studentId === student.id);

              return (
                <article
                  key={student.id}
                  className="rounded-[26px] border-2 border-[#191a32] bg-white p-5 shadow-[3px_4px_0_#e7dfd0] transition duration-200 hover:-translate-y-1 hover:shadow-[5px_6px_0_#c9bcff]"
                >
                  <div className="flex items-start justify-between">
                    <div
                      className={`flex h-14 w-14 items-center justify-center rounded-2xl border-2 border-[#191a32] text-lg font-black ${student.color}`}
                    >
                      {student.initials}
                    </div>

                    <span className="rounded-full border border-[#e7dfd0] bg-[#fffdf9] px-3 py-1 text-xs text-[#6e6a7b]">
                      {student.year}
                    </span>
                  </div>

                  <h3 className="mt-4 text-lg font-semibold">
                    <Link to={`/profile/${student.id}`} className="transition hover:text-[#5947a8]">{student.name}</Link>
                  </h3>

                  <p className="mt-1 line-clamp-2 text-sm text-[#6e6a7b]">
                    {student.headline}
                  </p>

                  <div className="mt-4 space-y-3 text-sm text-[#6e6a7b]">
                    <p className="flex items-center gap-2">
                      <GraduationCap size={17} className="shrink-0 text-[#6f56d9]" />
                      <span>{student.course}</span>
                    </p>
                    <p className="flex items-start gap-2">
                      <School
                        size={17}
                        className="mt-0.5 shrink-0 text-[#6f56d9]"
                      />
                      <span>{student.college}</span>
                    </p>

                    <p className="flex items-center gap-2">
                      <MapPin size={16} className="text-[#6f56d9]" />
                      {student.location}
                    </p>
                  </div>

                  <div className="mt-5">
                    <p className="mb-3 flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-[#858191]">
                      <Code2 size={15} />
                      Skills
                    </p>

                    <div className="flex min-h-14 flex-wrap content-start gap-2">
                      {student.skills.map((skill) => (
                        <span
                          key={skill}
                          className="rounded-lg border border-[#e7dfd0] bg-[#f4f0e8] px-2.5 py-1.5 text-xs text-[#514e62]"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={() => toggleConnection(student.id)}
                    disabled={isConnected || busyId === student.id || loading}
                    className={`mt-5 flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition ${
                      isConnected
                        ? "cursor-default border-2 border-[#28734d]/20 bg-[#b9e7c8] text-[#205b3c]"
                        : isPending
                        ? "border-2 border-[#d9cffb] bg-[#eee9ff] text-[#6f56d9] hover:bg-red-400/10 hover:text-red-500"
                        : "border-2 border-[#191a32] bg-[#ffe35b] text-black shadow-[0_3px_0_#191a32] hover:-translate-y-0.5"
                    }`}
                  >
                    {isConnected ? (
                      <><UserCheck size={17} /> Connected</>
                    ) : isPending ? (
                      <>
                        <UserCheck size={17} />
                        Request Sent · Cancel
                      </>
                    ) : (
                      <>
                        <UserPlus size={17} />
                        Connect
                      </>
                    )}
                  </button>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="rounded-[26px] border-2 border-[#191a32] bg-white px-5 py-16 text-center shadow-[4px_5px_0_#87d4f4]">
            <Users
              size={36}
              className="mx-auto mb-4 text-[#a29eac]"
            />
            <h3 className="text-lg font-semibold">{hasMore ? "No matches in this batch" : "No students found"}</h3>
            <p className="mt-2 text-sm text-[#858191]">
              {hasMore ? "Load more students or try another filter." : "Try another name, college or skill."}
            </p>
            <button
              onClick={() => {
                setSearch("");
                setSelectedCourse("All");
              }}
              className="mt-5 text-sm font-medium text-[#6f56d9] hover:text-[#5947a8]"
            >
              Clear filters
            </button>
          </div>
        )}

        {!loading && hasMore && (
          <div className="mt-7 flex justify-center">
            <button
              type="button"
              onClick={loadMoreStudents}
              disabled={loadingMore}
              className="rounded-xl border-2 border-[#191a32] bg-[#ffe35b] px-5 py-3 text-sm font-semibold text-black shadow-[0_3px_0_#191a32] transition hover:-translate-y-0.5 hover:bg-[#f3d446] disabled:cursor-wait disabled:opacity-60"
            >
              {loadingMore ? "Loading students…" : "Load more students"}
            </button>
          </div>
        )}
      </main>
    </div>
  );
}




