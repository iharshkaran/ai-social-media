
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    GraduationCap,
    Eye,
    EyeOff,
    ArrowRight,
    Users,
    Code2,
    BriefcaseBusiness,
    CheckCircle2,
    UserRound,
    Search,
    Sparkles,
    ArrowLeft,
} from "lucide-react";

const courses = [
    "B.Tech",
    "B.E.",
    "BCA",
    "B.Sc",
    "BBA",
    "B.Com",
    "BA",
    "M.Tech",
    "MCA",
    "MBA",
    "M.Sc",
    "PhD",
    "Other",
];

const years = [
    "1st Year",
    "2nd Year",
    "3rd Year",
    "4th Year",
    "5th Year",
    "Graduate",
    "Postgraduate",
    "Other",
];

const popularSkills = [
    "JavaScript",
    "React",
    "Python",
    "Java",
    "C++",
    "UI/UX",
    "Data Analytics",
    "Node.js",
    "Machine Learning",
    "Communication",
];

function AuthPage() {
    const navigate = useNavigate();
    const [mode, setMode] = useState("login");
    const [step, setStep] = useState("auth");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [error, setError] = useState("");
    const [notice, setNotice] = useState("");
    const [remember, setRemember] = useState(true);
    const [selectedSkills, setSelectedSkills] = useState([]);

    const [form, setForm] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        university: "",
        course: "",
        year: "",
        bio: "",
    });

    function updateField(event) {
        const { name, value } = event.target;

        setForm((current) => ({
            ...current,
            [name]: value,
        }));

        setError("");
        setNotice("");
    }

    function changeMode(nextMode) {
        setMode(nextMode);
        setStep("auth");
        setError("");
        setNotice("");
        setShowPassword(false);
        setShowConfirmPassword(false);
    }

    function validateEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    function handleSubmit(event) {
        event.preventDefault();
        setError("");
        setNotice("");

        if (!form.email.trim() || !form.password) {
            setError("Please enter your email and password.");
            return;
        }

        if (!validateEmail(form.email)) {
            setError("Please enter a valid email address.");
            return;
        }

        if (mode === "signup") {
            if (!form.name.trim()) {
                setError("Please enter your full name.");
                return;
            }

            if (form.password.length < 8) {
                setError("Password must contain at least 8 characters.");
                return;
            }

            if (form.password !== form.confirmPassword) {
                setError("Your passwords do not match.");
                return;
            }

            // Frontend demo only: no account is created or stored.
            setStep("profile");
            return;
        }

        setNotice("Demo sign-in complete. Opening your community...");
        window.setTimeout(() => navigate("/home"), 350);
    }

    function toggleSkill(skill) {
        setSelectedSkills((current) =>
            current.includes(skill)
                ? current.filter((item) => item !== skill)
                : [...current, skill]
        );
    }

    function finishProfile(skip = false) {
        const profile = {
            name: form.name.trim() || "Your Name",
            headline: [form.course, form.year, "Student"].filter(Boolean).join(" · ") || "Student | Learning and building",
            university: form.university.trim(),
            course: form.course,
            year: form.year,
            bio: form.bio.trim(),
            skills: selectedSkills,
            location: "",
        };
        localStorage.setItem("connectly-profile", JSON.stringify(profile));
        localStorage.setItem("connectly-demo-session", JSON.stringify({ name: profile.name, email: form.email.trim() }));
        if (skip) localStorage.setItem("connectly-profile", JSON.stringify({ ...profile, skills: [] }));
        navigate("/home");
    }

    function returnToAuth() {
        setStep("auth");
        setError("");
        setNotice("");
    }

    const inputClass =
        "w-full rounded-xl border border-white/10 bg-[#202020] px-4 py-3 text-sm text-white outline-none transition placeholder:text-gray-500 focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400/20";

    const labelClass = "mb-2 block text-sm font-medium text-gray-300";

    return (
        <main className="min-h-screen w-full bg-[#111111] text-white">
            <div className="grid min-h-screen w-full grid-cols-1 lg:grid-cols-2">
                {/* LEFT BRAND PANEL */}
                <section className="relative hidden min-h-screen flex-col justify-between overflow-hidden bg-[#202018] p-10 xl:p-14 lg:flex">
                    <div className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-yellow-400/10 blur-3xl" />
                    <div className="pointer-events-none absolute -bottom-24 right-0 h-80 w-80 rounded-full bg-yellow-400/[0.08] blur-3xl" />

                    <a href="/" className="relative inline-flex w-fit items-center gap-3">
                        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-yellow-400 text-black">
                            <GraduationCap size={29} />
                        </span>
                        <span className="text-2xl font-bold tracking-tight">
                            Connect<span className="text-yellow-400">ly</span>
                        </span>
                    </a>

                    <div className="relative my-10 max-w-xl">
                        <span className="inline-flex rounded-full border border-yellow-400/30 bg-yellow-400/10 px-4 py-2 text-xs font-semibold tracking-wide text-yellow-300">
                            YOUR CAMPUS. YOUR COMMUNITY.
                        </span>

                        <h1 className="mt-7 text-4xl font-bold leading-tight xl:text-6xl">
                            Your next big
                            <br />
                            <span className="text-yellow-400">opportunity</span>
                            <br />
                            starts here.
                        </h1>

                        <p className="mt-6 max-w-lg text-base leading-8 text-gray-400">
                            Meet ambitious students, share what you are building, discover
                            new opportunities and grow together.
                        </p>

                        {/* Decorative student network illustration */}
                        <div className="relative mt-9 flex max-w-md items-center justify-between rounded-3xl border border-white/10 bg-black/20 p-5">
                            <div className="absolute left-[22%] right-[22%] top-1/2 border-t border-dashed border-yellow-400/40" />

                            {[
                                { icon: Code2, label: "Build", color: "text-yellow-400" },
                                { icon: Users, label: "Connect", color: "text-white" },
                                {
                                    icon: BriefcaseBusiness,
                                    label: "Grow",
                                    color: "text-yellow-400",
                                },
                            ].map(({ icon: Icon, label, color }) => (
                                <div
                                    key={label}
                                    className="relative z-10 flex flex-col items-center gap-3"
                                >
                                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-[#29291f]">
                                        <Icon size={25} className={color} />
                                    </div>
                                    <span className="text-xs font-medium text-gray-300">
                                        {label}
                                    </span>
                                </div>
                            ))}
                        </div>

                        <div className="mt-8 space-y-4">
                            {[
                                "Connect with students who share your interests.",
                                "Showcase projects, skills and achievements.",
                                "Discover internships and campus activities.",
                            ].map((text) => (
                                <div key={text} className="flex items-center gap-3">
                                    <CheckCircle2
                                        size={18}
                                        className="shrink-0 text-yellow-400"
                                    />
                                    <p className="text-sm text-gray-300">{text}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <p className="relative text-xs text-gray-500">
                        Built for students. Designed for what comes next.
                    </p>
                </section>

                {/* RIGHT PANEL */}
                <section className="flex min-h-screen items-center justify-center bg-[#171717] px-5 py-8 sm:px-10 lg:px-12 xl:px-16">
                    <div className="w-full max-w-lg">
                        {/* Mobile brand */}
                        <a
                            href="/"
                            className="mb-9 inline-flex items-center gap-3 lg:hidden"
                        >
                            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-yellow-400 text-black">
                                <GraduationCap size={26} />
                            </span>
                            <span className="text-xl font-bold">
                                Connect<span className="text-yellow-400">ly</span>
                            </span>
                        </a>

                        {/* LOGIN / SIGNUP */}
                        {step === "auth" && (
                            <>
                                <div className="mb-7">
                                    <p className="text-sm font-semibold tracking-wider text-yellow-400">
                                        {mode === "login" ? "WELCOME BACK" : "JOIN THE COMMUNITY"}
                                    </p>

                                    <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
                                        {mode === "login" ? "Sign in" : "Create your account"}
                                    </h2>

                                    <p className="mt-3 text-sm leading-6 text-gray-400">
                                        {mode === "login"
                                            ? "Continue connecting with your student community."
                                            : "Start building your student network today."}
                                    </p>
                                </div>

                                <div className="mb-7 grid grid-cols-2 rounded-xl bg-[#0e0e0e] p-1">
                                    <button
                                        type="button"
                                        onClick={() => changeMode("login")}
                                        className={`rounded-lg py-3 text-sm font-semibold transition ${mode === "login"
                                            ? "bg-yellow-400 text-black"
                                            : "text-gray-400 hover:text-white"
                                            }`}
                                    >
                                        Login
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => changeMode("signup")}
                                        className={`rounded-lg py-3 text-sm font-semibold transition ${mode === "signup"
                                            ? "bg-yellow-400 text-black"
                                            : "text-gray-400 hover:text-white"
                                            }`}
                                    >
                                        Sign up
                                    </button>
                                </div>

                                <form onSubmit={handleSubmit} className="space-y-4">
                                    {mode === "signup" && (
                                        <div>
                                            <label className={labelClass} htmlFor="name">
                                                Full name
                                            </label>
                                            <input
                                                id="name"
                                                name="name"
                                                value={form.name}
                                                onChange={updateField}
                                                placeholder="Enter your full name"
                                                autoComplete="name"
                                                className={inputClass}
                                                required
                                            />
                                        </div>
                                    )}

                                    <div>
                                        <label className={labelClass} htmlFor="email">
                                            Email address
                                        </label>
                                        <input
                                            id="email"
                                            type="email"
                                            name="email"
                                            value={form.email}
                                            onChange={updateField}
                                            placeholder="you@example.com"
                                            autoComplete="email"
                                            className={inputClass}
                                            required
                                        />
                                    </div>

                                    <div>
                                        <div className="mb-2 flex items-center justify-between gap-3">
                                            <label className={labelClass + " mb-0"} htmlFor="password">
                                                Password
                                            </label>

                                            {mode === "login" && (
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setNotice(
                                                            "Password recovery will be available when authentication is implemented."
                                                        )
                                                    }
                                                    className="text-xs font-medium text-yellow-400 hover:text-yellow-300"
                                                >
                                                    Forgot password?
                                                </button>
                                            )}
                                        </div>

                                        <div className="relative">
                                            <input
                                                id="password"
                                                type={showPassword ? "text" : "password"}
                                                name="password"
                                                value={form.password}
                                                onChange={updateField}
                                                placeholder={
                                                    mode === "login"
                                                        ? "Enter your password"
                                                        : "At least 8 characters"
                                                }
                                                autoComplete={
                                                    mode === "login" ? "current-password" : "new-password"
                                                }
                                                minLength={mode === "signup" ? 8 : undefined}
                                                className={inputClass + " pr-12"}
                                                required
                                            />

                                            <button
                                                type="button"
                                                aria-label={
                                                    showPassword ? "Hide password" : "Show password"
                                                }
                                                onClick={() => setShowPassword((value) => !value)}
                                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                                            >
                                                {showPassword ? (
                                                    <EyeOff size={19} />
                                                ) : (
                                                    <Eye size={19} />
                                                )}
                                            </button>
                                        </div>
                                    </div>

                                    {mode === "signup" && (
                                        <div>
                                            <label
                                                className={labelClass}
                                                htmlFor="confirmPassword"
                                            >
                                                Confirm password
                                            </label>

                                            <div className="relative">
                                                <input
                                                    id="confirmPassword"
                                                    type={showConfirmPassword ? "text" : "password"}
                                                    name="confirmPassword"
                                                    value={form.confirmPassword}
                                                    onChange={updateField}
                                                    placeholder="Re-enter your password"
                                                    autoComplete="new-password"
                                                    className={inputClass + " pr-12"}
                                                    required
                                                />

                                                <button
                                                    type="button"
                                                    aria-label={
                                                        showConfirmPassword
                                                            ? "Hide password"
                                                            : "Show password"
                                                    }
                                                    onClick={() =>
                                                        setShowConfirmPassword((value) => !value)
                                                    }
                                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                                                >
                                                    {showConfirmPassword ? (
                                                        <EyeOff size={19} />
                                                    ) : (
                                                        <Eye size={19} />
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {mode === "login" && (
                                        <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-400">
                                            <input
                                                type="checkbox"
                                                checked={remember}
                                                onChange={(event) => setRemember(event.target.checked)}
                                                className="h-4 w-4 accent-yellow-400"
                                            />
                                            Remember me
                                        </label>
                                    )}

                                    {error && (
                                        <p
                                            role="alert"
                                            className="rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-300"
                                        >
                                            {error}
                                        </p>
                                    )}

                                    {notice && (
                                        <p
                                            role="status"
                                            className="rounded-xl border border-yellow-400/20 bg-yellow-400/10 p-3 text-sm leading-5 text-yellow-200"
                                        >
                                            {notice}
                                        </p>
                                    )}

                                    <button
                                        type="submit"
                                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-yellow-400 py-3.5 font-semibold text-black transition hover:bg-yellow-300"
                                    >
                                        {mode === "login" ? "Login to Connectly" : "Create account"}
                                        <ArrowRight size={18} />
                                    </button>
                                </form>

                                <p className="mt-7 text-center text-sm text-gray-400">
                                    {mode === "login"
                                        ? "New to Connectly?"
                                        : "Already have an account?"}{" "}
                                    <button
                                        type="button"
                                        onClick={() =>
                                            changeMode(mode === "login" ? "signup" : "login")
                                        }
                                        className="font-semibold text-yellow-400 hover:text-yellow-300"
                                    >
                                        {mode === "login" ? "Create account" : "Log in"}
                                    </button>
                                </p>

                                <p className="mt-6 text-center text-xs leading-5 text-gray-500">
                                    By continuing, you agree to Connectly's Terms of Service and
                                    Privacy Policy.
                                </p>
                            </>
                        )}

                        {/* OPTIONAL PROFILE SETUP */}
                        {step === "profile" && (
                            <div>
                                <button
                                    type="button"
                                    onClick={returnToAuth}
                                    className="mb-6 flex items-center gap-2 text-sm text-gray-400 hover:text-white"
                                >
                                    <ArrowLeft size={17} />
                                    Back
                                </button>

                                <div className="mb-7 flex h-14 w-14 items-center justify-center rounded-2xl bg-yellow-400/10 text-yellow-400">
                                    <Sparkles size={28} />
                                </div>

                                <p className="text-sm font-semibold tracking-wider text-yellow-400">
                                    ONE LAST THING
                                </p>

                                <h2 className="mt-3 text-3xl font-bold">
                                    Build your profile
                                </h2>

                                <p className="mt-3 text-sm leading-6 text-gray-400">
                                    Help other students discover you. These details are optional
                                    and you can add them later.
                                </p>

                                <form
                                    onSubmit={(event) => {
                                        event.preventDefault();
                                        finishProfile(false);
                                    }}
                                    className="mt-7 space-y-5"
                                >
                                    <div>
                                        <label className={labelClass} htmlFor="university">
                                            University / College
                                        </label>

                                        <div className="relative">
                                            <Search
                                                size={18}
                                                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
                                            />
                                            <input
                                                id="university"
                                                name="university"
                                                value={form.university}
                                                onChange={updateField}
                                                placeholder="Search or enter your college"
                                                className={inputClass + " pl-11"}
                                            />
                                        </div>
                                        <p className="mt-2 text-xs text-gray-500">
                                            Start typing to enter your college name. Suggestions can
                                            be added later.
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                        <div>
                                            <label className={labelClass} htmlFor="course">
                                                Course / Degree
                                            </label>
                                            <select
                                                id="course"
                                                name="course"
                                                value={form.course}
                                                onChange={updateField}
                                                className={inputClass}
                                            >
                                                <option value="">Select course</option>
                                                {courses.map((course) => (
                                                    <option key={course} value={course}>
                                                        {course}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        <div>
                                            <label className={labelClass} htmlFor="year">
                                                Study year
                                            </label>
                                            <select
                                                id="year"
                                                name="year"
                                                value={form.year}
                                                onChange={updateField}
                                                className={inputClass}
                                            >
                                                <option value="">Select year</option>
                                                {years.map((year) => (
                                                    <option key={year} value={year}>
                                                        {year}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    <div>
                                        <label className={labelClass} htmlFor="bio">
                                            Short introduction
                                        </label>
                                        <textarea
                                            id="bio"
                                            name="bio"
                                            value={form.bio}
                                            onChange={updateField}
                                            placeholder="Tell the community a little about yourself..."
                                            rows={3}
                                            className={inputClass + " resize-y"}
                                        />
                                    </div>

                                    <div>
                                        <label className={labelClass}>Your interests & skills</label>
                                        <div className="flex flex-wrap gap-2">
                                            {popularSkills.map((skill) => {
                                                const selected = selectedSkills.includes(skill);

                                                return (
                                                    <button
                                                        key={skill}
                                                        type="button"
                                                        onClick={() => toggleSkill(skill)}
                                                        className={`rounded-full border px-3 py-2 text-xs transition ${selected
                                                            ? "border-yellow-400 bg-yellow-400/10 text-yellow-300"
                                                            : "border-white/10 bg-white/[0.03] text-gray-400 hover:border-white/30 hover:text-white"
                                                            }`}
                                                    >
                                                        {selected ? "✓ " : "+ "}
                                                        {skill}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-yellow-400 py-3.5 font-semibold text-black transition hover:bg-yellow-300"
                                    >
                                        Complete profile
                                        <ArrowRight size={18} />
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => finishProfile(true)}
                                        className="w-full rounded-xl border border-white/10 py-3 text-sm font-medium text-gray-300 transition hover:border-yellow-400/50 hover:text-white"
                                    >
                                        Skip for now
                                    </button>

                                    <p className="text-center text-xs text-gray-500">
                                        You can update your profile at any time.
                                    </p>
                                </form>
                            </div>
                        )}

                        {/* FRONTEND DEMO WELCOME SCREEN */}
                        {step === "welcome" && (
                            <div className="py-8 text-center">
                                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-yellow-400 text-black">
                                    <CheckCircle2 size={42} />
                                </div>

                                <p className="mt-7 text-sm font-semibold tracking-wider text-yellow-400">
                                    WELCOME TO CONNECTLY
                                </p>

                                <h2 className="mt-3 text-3xl font-bold">
                                    You're ready to explore!
                                </h2>

                                <p className="mx-auto mt-4 max-w-sm text-sm leading-6 text-gray-400">
                                    {form.name
                                        ? `Welcome, ${form.name}! `
                                        : "Welcome! "}
                                    Your profile setup demo is complete. Your student community
                                    is waiting for you.
                                </p>

                                {notice && (
                                    <p className="mt-4 text-sm text-yellow-200">{notice}</p>
                                )}

                                <div className="mt-7 rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-left">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-yellow-400/10 text-yellow-400">
                                            <UserRound size={24} />
                                        </div>
                                        <div>
                                            <p className="font-semibold">
                                                {form.name || "Student"}
                                            </p>
                                            <p className="mt-1 text-xs text-gray-400">
                                                {form.course || "Student"}{" "}
                                                {form.year ? `· ${form.year}` : ""}
                                            </p>
                                        </div>
                                    </div>

                                    {form.university && (
                                        <p className="mt-4 text-sm text-gray-300">
                                            {form.university}
                                        </p>
                                    )}

                                    {selectedSkills.length > 0 && (
                                        <div className="mt-4 flex flex-wrap gap-2">
                                            {selectedSkills.map((skill) => (
                                                <span
                                                    key={skill}
                                                    className="rounded-full bg-white/[0.06] px-3 py-1.5 text-xs text-gray-300"
                                                >
                                                    {skill}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <button
                                    type="button"
                                    onClick={() => navigate("/home")}
                                    className="mt-7 flex w-full items-center justify-center gap-2 rounded-xl bg-yellow-400 py-3.5 font-semibold text-black transition hover:bg-yellow-300"
                                >
                                    Explore Connectly
                                    <ArrowRight size={18} />
                                </button>

                                <button
                                    type="button"
                                    onClick={() => changeMode("login")}
                                    className="mt-4 text-sm text-gray-400 hover:text-white"
                                >
                                    Back to login screen
                                </button>
                            </div>
                        )}
                    </div>
                </section>
            </div>
        </main>
    );
}

export default AuthPage;
