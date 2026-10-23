
import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import { addNotification, readConnections, saveConnections } from "../utils/socialStore";
import students from "../data/students";
import {
  Search,
  MapPin,
  GraduationCap,
  UserPlus,
  UserCheck,
  Code2,
  Users,
} from "lucide-react";

const filters = ["All", "B.Tech CSE", "B.Tech IT", "BCA", "B.Tech AI/ML"];

export default function Explore() {
  const [searchParams] = useSearchParams();
  const [search, setSearch] = useState(() => searchParams.get("q") || "");
  const [selectedCourse, setSelectedCourse] = useState("All");
  const [connections, setConnections] = useState(readConnections);
  const connectedPeople = connections.connected.map((connection) => {
    if (typeof connection === "object") return connection;
    return students.find((student) => student.id === connection);
  }).filter(Boolean);

  const filteredStudents = useMemo(() => {
    const term = search.trim().toLowerCase();

    return students.filter((student) => {
      const matchesSearch =
        !term ||
        student.name.toLowerCase().includes(term) ||
        student.college.toLowerCase().includes(term) ||
        student.skills.some((skill) =>
          skill.toLowerCase().includes(term)
        );

      const matchesCourse =
        selectedCourse === "All" ||
        student.course === selectedCourse;

      return matchesSearch && matchesCourse;
    });
  }, [search, selectedCourse]);

  function toggleConnection(studentId) {
    const nextOutgoing = { ...connections.outgoing };
    const wasPending = nextOutgoing[studentId] === "pending";
    if (wasPending) delete nextOutgoing[studentId];
    else nextOutgoing[studentId] = "pending";

    const next = { ...connections, outgoing: nextOutgoing };
    setConnections(next);
    saveConnections(next);
    if (!wasPending) {
      const student = students.find((item) => item.id === studentId);
      addNotification({ type: "connection", title: "Connection request sent", message: `You sent a connection request to ${student?.name || "a student"}.` });
    }
  }

  function respondToRequest(request, accept) {
    const acceptedPerson = {
      id: request.studentId ?? request.id,
      name: request.name,
      role: request.role,
      initials: request.initials || request.name.slice(0, 1),
    };
    const next = {
      ...connections,
      incoming: connections.incoming.filter((item) => item.id !== request.id),
      connected: accept && !connections.connected.some((item) => (typeof item === "object" ? item.id : item) === acceptedPerson.id)
        ? [...connections.connected, acceptedPerson]
        : connections.connected,
    };
    setConnections(next);
    saveConnections(next);
    if (accept) {
      addNotification({ type: "connection", title: "You're connected", message: `You and ${request.name} are now connected.` });
    }
  }

  return (
    <div className="min-h-screen bg-[#111111] text-white">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <section className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-2 text-sm font-medium text-yellow-400">YOUR STUDENT COMMUNITY</p>
            <h1 className="text-3xl font-bold sm:text-4xl">Explore Students</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-400 sm:text-base">
              Discover students, explore their skills and connect with people who share your interests.
            </p>
          </div>
          <Link to="/connections" className="inline-flex w-fit items-center gap-2 rounded-xl border border-white/10 px-4 py-2.5 text-sm font-medium text-gray-300 transition hover:border-yellow-400 hover:text-yellow-300">
            <Users size={16} /> Manage connections
          </Link>
        </section>

        {connections.incoming.length > 0 && (
          <section className="mb-8 rounded-2xl border border-white/10 bg-[#1b1b1b] p-5">
            <div className="mb-4 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold">Connection requests</h2>
                <p className="mt-1 text-sm text-gray-400">People who would like to join your network.</p>
              </div>
              <span className="rounded-full bg-yellow-400/10 px-3 py-1 text-xs font-medium text-yellow-300">{connections.incoming.length} pending</span>
            </div>
            <div className="divide-y divide-white/[0.06]">
              {connections.incoming.map((request) => (
                <div key={request.id} className="flex flex-wrap items-center gap-3 py-4 first:pt-0 last:pb-0">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-pink-400/15 font-semibold text-pink-300">{request.initials || request.name.slice(0, 1)}</div>
                  <div className="min-w-0 flex-1"><p className="font-medium">{request.name}</p><p className="text-sm text-gray-400">{request.role}</p></div>
                  {request.sample && <span className="text-xs text-gray-500">Preview request</span>}
                  <div className="flex gap-2">
                    <button onClick={() => respondToRequest(request, true)} className="rounded-lg bg-yellow-400 px-3 py-2 text-xs font-semibold text-black hover:bg-yellow-300">Accept</button>
                    <button onClick={() => respondToRequest(request, false)} className="rounded-lg border border-white/10 px-3 py-2 text-xs text-gray-300 hover:bg-white/5">Decline</button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {connectedPeople.length > 0 && (
          <section className="mb-8 rounded-2xl border border-white/10 bg-[#1b1b1b] p-5">
            <div className="mb-4 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold">Your connections</h2>
                <p className="mt-1 text-sm text-gray-400">Students in your growing network.</p>
              </div>
              <span className="text-sm text-gray-500">{connectedPeople.length}</span>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {connectedPeople.map((person) => (
                <div key={person.id} className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-400/10 font-semibold text-green-300">{person.initials || person.name.slice(0, 1)}</div>
                  <div className="min-w-0"><p className="truncate text-sm font-medium">{person.name}</p><p className="truncate text-xs text-gray-400">{person.role}</p></div>
                  <UserCheck size={17} className="ml-auto shrink-0 text-green-300" />
                </div>
              ))}
            </div>
          </section>
        )}

        <section className="mb-8 rounded-2xl border border-white/10 bg-[#1b1b1b] p-4 sm:p-5">
          <div className="relative">
            <Search
              size={19}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
            />

            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search students, colleges or skills..."
              className="w-full rounded-xl border border-white/10 bg-[#202020] py-3 pl-12 pr-4 text-sm outline-none transition placeholder:text-gray-600 focus:border-yellow-400"
            />
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {filters.map((filter) => (
              <button
                key={filter}
                onClick={() => setSelectedCourse(filter)}
                className={`rounded-full border px-4 py-2 text-sm transition ${
                  selectedCourse === filter
                    ? "border-yellow-400 bg-yellow-400 text-black"
                    : "border-white/10 bg-[#202020] text-gray-400 hover:border-yellow-400/50 hover:text-white"
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </section>

        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Students you may know</h2>
          <span className="text-sm text-gray-500">
            {filteredStudents.length} students
          </span>
        </div>

        {filteredStudents.length > 0 ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filteredStudents.map((student) => {
              const isPending = connections.outgoing[student.id] === "pending";
              const isConnected = connections.connected.some((item) => (typeof item === "object" ? item.id : item) === student.id);

              return (
                <article
                  key={student.id}
                  className="rounded-2xl border border-white/10 bg-[#1b1b1b] p-5 transition duration-200 hover:-translate-y-1 hover:border-yellow-400/40"
                >
                  <div className="flex items-start justify-between">
                    <div
                      className={`flex h-14 w-14 items-center justify-center rounded-2xl text-lg font-bold ${student.color}`}
                    >
                      {student.initials}
                    </div>

                    <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-gray-400">
                      {student.year}
                    </span>
                  </div>

                  <h3 className="mt-4 text-lg font-semibold">
                    {student.name}
                  </h3>

                  <p className="mt-1 text-sm text-gray-400">
                    {student.course}
                  </p>

                  <div className="mt-4 space-y-3 text-sm text-gray-400">
                    <p className="flex items-start gap-2">
                      <GraduationCap
                        size={17}
                        className="mt-0.5 shrink-0 text-yellow-400"
                      />
                      <span>{student.college}</span>
                    </p>

                    <p className="flex items-center gap-2">
                      <MapPin size={16} className="text-yellow-400" />
                      {student.location}
                    </p>
                  </div>

                  <div className="mt-5">
                    <p className="mb-3 flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-gray-500">
                      <Code2 size={15} />
                      Skills
                    </p>

                    <div className="flex min-h-14 flex-wrap content-start gap-2">
                      {student.skills.map((skill) => (
                        <span
                          key={skill}
                          className="rounded-lg bg-[#242424] px-2.5 py-1.5 text-xs text-gray-300"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={() => toggleConnection(student.id)}
                    disabled={isConnected}
                    className={`mt-5 flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition ${
                      isConnected
                        ? "cursor-default border border-green-400/20 bg-green-400/10 text-green-300"
                        : isPending
                        ? "border border-yellow-400/40 bg-yellow-400/10 text-yellow-400 hover:bg-red-400/10 hover:text-red-400"
                        : "bg-yellow-400 text-black hover:bg-yellow-300"
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
          <div className="rounded-2xl border border-white/10 bg-[#1b1b1b] px-5 py-16 text-center">
            <Users
              size={36}
              className="mx-auto mb-4 text-gray-600"
            />
            <h3 className="text-lg font-semibold">No students found</h3>
            <p className="mt-2 text-sm text-gray-500">
              Try another name, college or skill.
            </p>
            <button
              onClick={() => {
                setSearch("");
                setSelectedCourse("All");
              }}
              className="mt-5 text-sm font-medium text-yellow-400 hover:text-yellow-300"
            >
              Clear filters
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
