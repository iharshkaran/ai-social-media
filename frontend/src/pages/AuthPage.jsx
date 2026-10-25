
import { useEffect, useState } from "react";
import { api } from "../utils/api";
import { useAuth } from "../context/useAuth";
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
    const { user, setUser } = useAuth();
    useEffect(() => { if (user) navigate("/home", { replace: true }); }, [user, navigate]);
    const [mode, setMode] = useState("login");
    const [step, setStep] = useState("auth");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [error, setError] = useState("");
    const [notice, setNotice] = useState("");
    const [remember, setRemember] = useState(true);
    const [busy, setBusy] = useState(false);
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

    async function handleSubmit(event) {
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

            // Continue to the profile details step before creating the account.
            setStep("profile");
            return;
        }

        setBusy(true);
        try {
            const result = await api.login({ email: form.email.trim(), password: form.password, remember });
            setUser(result.user);
            navigate("/home");
        } catch (requestError) { setError(requestError.message); }
        finally { setBusy(false); }
    }

    function toggleSkill(skill) {
        setSelectedSkills((current) =>
            current.includes(skill)
                ? current.filter((item) => item !== skill)
                : [...current, skill]
        );
    }

    async function finishProfile(skip = false) {
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
        setBusy(true);
        try {
            const result = await api.register({ name: profile.name, email: form.email.trim(), password: form.password, university: profile.university, course: profile.course, year: profile.year, bio: profile.bio, skills: skip ? [] : selectedSkills });
            setUser(result.user);
            navigate("/home");
        } catch (requestError) { setError(requestError.message); setStep("auth"); }
        finally { setBusy(false); }
    }

    function returnToAuth() {
        setStep("auth");
        setError("");
        setNotice("");
    }

    const inputClass =
        "w-full rounded-xl border border-[#e7dfd0] bg-[#fffdf9] px-4 py-3 text-sm text-[#17182d] outline-none transition placeholder:text-[#858191] focus:border-[#7660dc] focus:ring-1 focus:ring-[#7660dc]/20";

    const labelClass = "mb-2 block text-sm font-medium text-[#514e62]";

    if (step === "auth" && mode === "login") {
        return (
            <main className="min-h-screen overflow-hidden orbit-pattern-bg text-[#17182d]">
                <div className="pointer-events-none fixed -left-40 top-32 h-80 w-80 rounded-full bg-[#ffc5d5]/50 blur-3xl" />
                <div className="pointer-events-none fixed -bottom-40 right-0 h-96 w-96 rounded-full bg-[#c9bcff]/50 blur-3xl" />

                <header className="relative z-10 mx-auto flex w-full max-w-7xl items-center justify-between px-5 py-5 sm:px-8 lg:px-12">
                    <a href="/" className="inline-flex items-center gap-2.5" aria-label="OrbitU home">
                        <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#191a32] text-[#ffe35b] shadow-[0_5px_0_#d9cba9]">
                            <svg aria-hidden="true" viewBox="0 0 32 32" className="h-7 w-7">
                                <ellipse cx="16" cy="16" rx="12" ry="6" transform="rotate(-32 16 16)" fill="none" stroke="currentColor" strokeWidth="2" />
                                <circle cx="16" cy="16" r="3.5" fill="currentColor" />
                                <circle cx="26" cy="9" r="2" fill="white" />
                            </svg>
                        </span>
                        <span className="text-xl font-extrabold tracking-tight">Orbit<span className="text-[#6f56d9]">U</span></span>
                    </a>
                    <div className="flex items-center gap-3 text-sm">
                        <span className="hidden text-[#6c687a] sm:inline">New to OrbitU?</span>
                        <button type="button" onClick={() => changeMode("signup")} className="rounded-full border-2 border-[#191a32] bg-white px-4 py-2 font-semibold shadow-[0_3px_0_#191a32] transition hover:-translate-y-0.5 hover:shadow-[0_5px_0_#191a32]">Create account</button>
                    </div>
                </header>

                <div className="relative mx-auto grid min-h-[calc(100vh-80px)] w-full max-w-7xl items-center gap-10 px-5 pb-10 pt-5 sm:px-8 lg:grid-cols-[minmax(0,1fr)_440px] lg:gap-16 lg:px-12 lg:pb-16">
                    <section className="order-2 mx-auto w-full max-w-2xl py-2 lg:order-1 lg:py-12">
                        <span className="inline-flex items-center gap-2 rounded-full border border-[#ded5c3] bg-white/80 px-4 py-2 text-xs font-bold uppercase tracking-[0.13em] text-[#514878] shadow-sm">
                            <Sparkles size={15} className="text-[#765fe0]" />
                            Made for student builders
                        </span>
                        <h1 className="mt-6 max-w-2xl text-4xl font-black leading-[0.98] tracking-[-0.055em] sm:text-6xl lg:text-7xl">
                            Learn out loud.
                            <br />
                            <span className="relative inline-block">
                                <span className="relative z-10">Build together.</span>
                                <span aria-hidden="true" className="absolute -bottom-1 left-0 -z-0 h-4 w-full -rotate-1 rounded-full bg-[#ffe35b] sm:h-5" />
                            </span>
                        </h1>
                        <p className="mt-6 max-w-xl text-base leading-7 text-[#656174] sm:text-lg sm:leading-8">
                            Find your people, share the things you are learning, and turn campus ideas into real projects.
                        </p>

                        <div className="relative mt-9 min-h-[218px] max-w-xl sm:mt-11 sm:min-h-[230px]">
                            <div className="absolute left-3 top-2 h-40 w-40 rounded-full border border-dashed border-[#aa9de5] sm:left-8 sm:h-48 sm:w-48" />
                            <div className="absolute left-10 top-9 h-28 w-28 rounded-full border border-dashed border-[#f1a4bb] sm:left-16 sm:top-12 sm:h-36 sm:w-36" />
                            <div className="absolute left-[6.4rem] top-[4.8rem] flex h-14 w-14 items-center justify-center rounded-full border-4 border-[#fbf6ec] bg-[#191a32] text-[#ffe35b] shadow-lg sm:left-[8.2rem] sm:top-[6.3rem] sm:h-16 sm:w-16">
                                <GraduationCap size={27} />
                            </div>
                            <div className="absolute left-[8rem] top-0 w-[min(56%,210px)] rotate-2 rounded-2xl border-2 border-[#191a32] bg-[#c9bcff] p-4 shadow-[4px_5px_0_#191a32] sm:left-[14rem] sm:w-[250px]">
                                <div className="flex items-center justify-between gap-2">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#4d407b]">Project in progress</span>
                                    <Code2 size={16} className="text-[#4d407b]" />
                                </div>
                                <p className="mt-3 text-sm font-extrabold">Campus Project Match</p>
                                <div className="mt-3 flex gap-1.5"><span className="rounded-full bg-white/70 px-2 py-1 text-[10px] font-semibold">React</span><span className="rounded-full bg-white/70 px-2 py-1 text-[10px] font-semibold">UI/UX</span></div>
                            </div>
                            <div className="absolute bottom-3 left-[6.7rem] w-[min(56%,200px)] -rotate-3 rounded-2xl border-2 border-[#191a32] bg-[#ffafd0] p-4 shadow-[4px_5px_0_#191a32] sm:bottom-1 sm:left-[12rem] sm:w-[230px]">
                                <div className="flex items-center gap-2"><Users size={16} className="text-[#713d5b]" /><span className="text-[10px] font-bold uppercase tracking-wider text-[#713d5b]">Looking for teammates</span></div>
                                <p className="mt-2 text-sm font-extrabold">Good ideas grow together.</p>
                            </div>
                            <div className="absolute bottom-1 left-1 rounded-xl border-2 border-[#191a32] bg-[#ffe35b] px-3 py-2 text-xs font-bold shadow-[3px_3px_0_#191a32] sm:left-4">Share what you make ↗</div>
                        </div>

                        <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-sm font-semibold text-[#514878]">
                            <span className="inline-flex items-center gap-2"><CheckCircle2 size={16} className="text-[#6f56d9]" />Show your projects</span>
                            <span className="inline-flex items-center gap-2"><CheckCircle2 size={16} className="text-[#6f56d9]" />Find collaborators</span>
                        </div>
                    </section>

                    <section className="order-1 mx-auto w-full max-w-[440px] rounded-[28px] border-2 border-[#191a32] bg-white p-6 shadow-[8px_9px_0_#191a32] sm:p-8 lg:order-2 lg:justify-self-end" aria-labelledby="login-heading">
                        <div className="mb-7 flex items-center gap-2">
                            <span className="rounded-full bg-[#e8e2ff] px-3 py-1.5 text-xs font-bold text-[#5947a8]">WELCOME BACK</span>
                            <span className="h-2 w-2 rounded-full bg-[#ffafd0]" />
                            <span className="h-2 w-2 rounded-full bg-[#ffe35b]" />
                            <span className="h-2 w-2 rounded-full bg-[#87d4f4]" />
                        </div>
                        <h2 id="login-heading" className="text-3xl font-black tracking-tight sm:text-4xl">Your orbit awaits.</h2>
                        <p className="mt-2 text-sm leading-6 text-[#777386]">Sign in and pick up where your community left off.</p>

                        <form onSubmit={handleSubmit} className="mt-7 space-y-5">
                            <div>
                                <label htmlFor="email" className="mb-2 block text-sm font-bold text-[#25243a]">Email address</label>
                                <input id="email" type="email" name="email" value={form.email} onChange={updateField} placeholder="you@example.com" autoComplete="email" className="w-full rounded-xl border-2 border-[#e6e2dc] bg-[#fffdf9] px-4 py-3.5 text-sm text-[#191a32] outline-none transition placeholder:text-[#aaa6b1] focus:border-[#7660dc] focus:ring-4 focus:ring-[#7660dc]/10" required />
                            </div>
                            <div>
                                <div className="mb-2 flex items-center justify-between gap-3">
                                    <label htmlFor="password" className="text-sm font-bold text-[#25243a]">Password</label>
                                    <button type="button" onClick={() => setNotice("Password recovery will be available when authentication is implemented.")} className="text-xs font-bold text-[#6f56d9] hover:text-[#4e3ba8]">Forgot password?</button>
                                </div>
                                <div className="relative">
                                    <input id="password" type={showPassword ? "text" : "password"} name="password" value={form.password} onChange={updateField} placeholder="Enter your password" autoComplete="current-password" className="w-full rounded-xl border-2 border-[#e6e2dc] bg-[#fffdf9] px-4 py-3.5 pr-12 text-sm text-[#191a32] outline-none transition placeholder:text-[#aaa6b1] focus:border-[#7660dc] focus:ring-4 focus:ring-[#7660dc]/10" required />
                                    <button type="button" aria-label={showPassword ? "Hide password" : "Show password"} onClick={() => setShowPassword((value) => !value)} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#898598] hover:text-[#302b4b]">{showPassword ? <EyeOff size={19} /> : <Eye size={19} />}</button>
                                </div>
                            </div>

                            <label className="flex cursor-pointer items-center gap-2.5 text-sm text-[#666276]">
                                <input type="checkbox" checked={remember} onChange={(event) => setRemember(event.target.checked)} className="h-4 w-4 rounded accent-[#6f56d9]" />
                                Keep me signed in
                            </label>

                            {error && <p role="alert" className="rounded-xl border border-[#f0b6bd] bg-[#fff0f1] p-3 text-sm text-[#a33b48]">{error}</p>}
                            {notice && <p role="status" className="rounded-xl border border-[#d9cffb] bg-[#f5f1ff] p-3 text-sm leading-5 text-[#5947a8]">{notice}</p>}

                            <button type="submit" disabled={busy} className="group flex w-full items-center justify-center gap-2 rounded-xl border-2 border-[#191a32] bg-[#191a32] py-3.5 font-bold text-white shadow-[0_4px_0_#c9bcff] transition hover:-translate-y-0.5 hover:shadow-[0_6px_0_#c9bcff] disabled:cursor-wait disabled:opacity-60">
                                {busy ? "Signing in…" : "Sign in to OrbitU"}
                                <ArrowRight size={18} className="transition group-hover:translate-x-1" />
                            </button>
                        </form>

                        <p className="mt-6 text-center text-sm text-[#777386]">New to OrbitU? <button type="button" onClick={() => changeMode("signup")} className="font-extrabold text-[#6f56d9] hover:text-[#4e3ba8]">Create account</button></p>
                        <p className="mt-5 text-center text-xs leading-5 text-[#9995a3]">By continuing, you agree to OrbitU's Terms of Service and Privacy Policy.</p>
                    </section>
                </div>
                <footer className="relative mx-auto max-w-7xl px-5 pb-5 text-xs text-[#888394] sm:px-8 lg:px-12">OrbitU · Built for students who make things.</footer>
            </main>
        );
    }

    if (mode === "signup") {
        const profileStep = step === "profile";
        const registerInputClass = `${inputClass} rounded-2xl border-2 px-4 py-3.5`;

        return (
            <main className="min-h-screen overflow-hidden orbit-pattern-bg text-[#17182d]">
                <div className="pointer-events-none fixed -left-40 top-32 h-80 w-80 rounded-full bg-[#ffc5d5]/50 blur-3xl" />
                <div className="pointer-events-none fixed -bottom-40 right-0 h-96 w-96 rounded-full bg-[#c9bcff]/50 blur-3xl" />

                <header className="relative z-10 mx-auto flex w-full max-w-7xl items-center justify-between px-5 py-5 sm:px-8 lg:px-12">
                    <a href="/" className="inline-flex items-center gap-2.5" aria-label="OrbitU home">
                        <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#191a32] text-[#ffe35b] shadow-[0_5px_0_#d9cba9]">
                            <svg aria-hidden="true" viewBox="0 0 32 32" className="h-7 w-7">
                                <ellipse cx="16" cy="16" rx="12" ry="6" transform="rotate(-32 16 16)" fill="none" stroke="currentColor" strokeWidth="2" />
                                <circle cx="16" cy="16" r="3.5" fill="currentColor" />
                                <circle cx="26" cy="9" r="2" fill="white" />
                            </svg>
                        </span>
                        <span className="text-xl font-extrabold tracking-tight">Orbit<span className="text-[#6f56d9]">U</span></span>
                    </a>
                    <div className="flex items-center gap-3 text-sm">
                        <span className="hidden text-[#6c687a] sm:inline">Already part of OrbitU?</span>
                        <button type="button" onClick={() => changeMode("login")} className="rounded-full border-2 border-[#191a32] bg-white px-4 py-2 font-semibold shadow-[0_3px_0_#191a32] transition hover:-translate-y-0.5 hover:shadow-[0_5px_0_#191a32]">Log in</button>
                    </div>
                </header>

                <div className="relative mx-auto grid min-h-[calc(100vh-80px)] w-full max-w-7xl items-center gap-10 px-5 pb-10 pt-5 sm:px-8 lg:grid-cols-[minmax(0,1fr)_520px] lg:gap-14 lg:px-12 lg:pb-16">
                    <section className="order-2 mx-auto w-full max-w-2xl py-2 lg:order-1 lg:py-12">
                        <span className="inline-flex items-center gap-2 rounded-full border border-[#ded5c3] bg-white/80 px-4 py-2 text-xs font-bold uppercase tracking-[0.13em] text-[#514878] shadow-sm">
                            <Sparkles size={15} className="text-[#765fe0]" />
                            Your next chapter starts here
                        </span>
                        <h1 className="mt-6 max-w-2xl text-4xl font-black leading-[0.98] tracking-[-0.055em] sm:text-6xl lg:text-7xl">
                            Make room for
                            <br />
                            <span className="relative inline-block">
                                <span className="relative z-10">big ideas.</span>
                                <span aria-hidden="true" className="absolute -bottom-1 left-0 -z-0 h-4 w-full -rotate-1 rounded-full bg-[#ffe35b] sm:h-5" />
                            </span>
                        </h1>
                        <p className="mt-6 max-w-xl text-base leading-7 text-[#656174] sm:text-lg sm:leading-8">
                            Meet students who get curious, make things, and are ready to build the next idea with you.
                        </p>

                        <div className="relative mt-9 min-h-[208px] max-w-xl sm:mt-11 sm:min-h-[230px]">
                            <div className="absolute left-3 top-2 h-40 w-40 rounded-full border border-dashed border-[#aa9de5] sm:left-8 sm:h-48 sm:w-48" />
                            <div className="absolute left-10 top-9 h-28 w-28 rounded-full border border-dashed border-[#f1a4bb] sm:left-16 sm:top-12 sm:h-36 sm:w-36" />
                            <div className="absolute left-[6.4rem] top-[4.8rem] flex h-14 w-14 items-center justify-center rounded-full border-4 border-[#fbf6ec] bg-[#191a32] text-[#ffe35b] shadow-lg sm:left-[8.2rem] sm:top-[6.3rem] sm:h-16 sm:w-16">
                                <Users size={24} />
                            </div>
                            <div className="absolute left-[8rem] top-0 w-[min(56%,210px)] rotate-2 rounded-2xl border-2 border-[#191a32] bg-[#c9bcff] p-4 shadow-[4px_5px_0_#191a32] sm:left-[14rem] sm:w-[250px]">
                                <div className="flex items-center justify-between gap-2"><span className="text-[10px] font-bold uppercase tracking-wider text-[#4d407b]">Find your people</span><GraduationCap size={16} className="text-[#4d407b]" /></div>
                                <p className="mt-3 text-sm font-extrabold">Same campus. New possibilities.</p>
                            </div>
                            <div className="absolute bottom-3 left-[6.7rem] w-[min(56%,200px)] -rotate-3 rounded-2xl border-2 border-[#191a32] bg-[#ffafd0] p-4 shadow-[4px_5px_0_#191a32] sm:bottom-1 sm:left-[12rem] sm:w-[230px]">
                                <div className="flex items-center gap-2"><Code2 size={16} className="text-[#713d5b]" /><span className="text-[10px] font-bold uppercase tracking-wider text-[#713d5b]">Show what you make</span></div>
                                <p className="mt-2 text-sm font-extrabold">Small steps become big projects.</p>
                            </div>
                            <div className="absolute bottom-1 left-1 rounded-xl border-2 border-[#191a32] bg-[#ffe35b] px-3 py-2 text-xs font-bold shadow-[3px_3px_0_#191a32] sm:left-4">Start with your story ↗</div>
                        </div>

                        <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-sm font-semibold text-[#514878]">
                            <span className="inline-flex items-center gap-2"><CheckCircle2 size={16} className="text-[#6f56d9]" />Make a student profile</span>
                            <span className="inline-flex items-center gap-2"><CheckCircle2 size={16} className="text-[#6f56d9]" />Find project teammates</span>
                        </div>
                    </section>

                    <section className="order-1 mx-auto w-full max-w-[520px] rounded-[28px] border-2 border-[#191a32] bg-white p-5 shadow-[8px_9px_0_#191a32] sm:p-8 lg:order-2 lg:justify-self-end" aria-labelledby="register-heading">
                        <div className="mb-6 flex items-center justify-between gap-3">
                            <div>
                                <p className="text-xs font-bold uppercase tracking-[0.13em] text-[#6f56d9]">JOIN THE COMMUNITY</p>
                                <h2 id="register-heading" className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">{profileStep ? "Build your profile." : "Create your orbit."}</h2>
                            </div>
                            <span className="shrink-0 rounded-full bg-[#eee9ff] px-3 py-1.5 text-xs font-bold text-[#5947a8]">Step {profileStep ? "2" : "1"} of 2</span>
                        </div>

                        <div className="mb-6 grid grid-cols-2 gap-2" aria-label="Registration progress">
                            <div className={`rounded-xl px-3 py-2.5 text-xs font-bold ${profileStep ? "bg-[#e9f7ef] text-[#28734d]" : "bg-[#eee9ff] text-[#5947a8]"}`}><span className="mr-2">{profileStep ? "✓" : "01"}</span>Account</div>
                            <div className={`rounded-xl px-3 py-2.5 text-xs font-bold ${profileStep ? "bg-[#eee9ff] text-[#5947a8]" : "bg-[#f4f0e8] text-[#858191]"}`}><span className="mr-2">02</span>Your campus</div>
                        </div>

                        {step === "auth" ? (
                            <>
                                <p className="mb-5 text-sm leading-6 text-[#777386]">A few details to get your student profile started.</p>
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div>
                                        <label className="mb-2 block text-sm font-bold text-[#25243a]" htmlFor="name">Full name</label>
                                        <input id="name" name="name" value={form.name} onChange={updateField} placeholder="Enter your full name" autoComplete="name" className={registerInputClass} required />
                                    </div>
                                    <div>
                                        <label className="mb-2 block text-sm font-bold text-[#25243a]" htmlFor="email">Email address</label>
                                        <input id="email" type="email" name="email" value={form.email} onChange={updateField} placeholder="you@example.com" autoComplete="email" className={registerInputClass} required />
                                    </div>
                                    <div>
                                        <label className="mb-2 block text-sm font-bold text-[#25243a]" htmlFor="password">Password</label>
                                        <div className="relative">
                                            <input id="password" type={showPassword ? "text" : "password"} name="password" value={form.password} onChange={updateField} placeholder="At least 8 characters" autoComplete="new-password" minLength={8} className={`${registerInputClass} pr-12`} required />
                                            <button type="button" aria-label={showPassword ? "Hide password" : "Show password"} onClick={() => setShowPassword((value) => !value)} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#898598] hover:text-[#302b4b]">{showPassword ? <EyeOff size={19} /> : <Eye size={19} />}</button>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="mb-2 block text-sm font-bold text-[#25243a]" htmlFor="confirmPassword">Confirm password</label>
                                        <div className="relative">
                                            <input id="confirmPassword" type={showConfirmPassword ? "text" : "password"} name="confirmPassword" value={form.confirmPassword} onChange={updateField} placeholder="Re-enter your password" autoComplete="new-password" className={`${registerInputClass} pr-12`} required />
                                            <button type="button" aria-label={showConfirmPassword ? "Hide password" : "Show password"} onClick={() => setShowConfirmPassword((value) => !value)} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#898598] hover:text-[#302b4b]">{showConfirmPassword ? <EyeOff size={19} /> : <Eye size={19} />}</button>
                                        </div>
                                    </div>
                                    {error && <p role="alert" className="rounded-xl border border-[#f0b6bd] bg-[#fff0f1] p-3 text-sm text-[#a33b48]">{error}</p>}
                                    <button type="submit" disabled={busy} className="group flex w-full items-center justify-center gap-2 rounded-xl border-2 border-[#191a32] bg-[#191a32] py-3.5 font-bold text-white shadow-[0_4px_0_#c9bcff] transition hover:-translate-y-0.5 hover:shadow-[0_6px_0_#c9bcff] disabled:cursor-wait disabled:opacity-60">
                                        Continue to your campus <ArrowRight size={18} className="transition group-hover:translate-x-1" />
                                    </button>
                                </form>
                                <p className="mt-5 text-center text-xs leading-5 text-[#9995a3]">By continuing, you agree to OrbitU's Terms of Service and Privacy Policy.</p>
                                <p className="mt-5 text-center text-sm text-[#777386]">Already have an account? <button type="button" onClick={() => changeMode("login")} className="font-extrabold text-[#6f56d9] hover:text-[#4e3ba8]">Log in</button></p>
                            </>
                        ) : (
                            <>
                                <button type="button" onClick={returnToAuth} className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-[#6f56d9] hover:text-[#4e3ba8]"><ArrowLeft size={16} /> Back to account details</button>
                                <p className="mb-5 text-sm leading-6 text-[#777386]">These details are optional. They help classmates find you and your interests.</p>
                                <form onSubmit={(event) => { event.preventDefault(); finishProfile(false); }} className="space-y-4">
                                    <div>
                                        <label className="mb-2 block text-sm font-bold text-[#25243a]" htmlFor="university">University / College</label>
                                        <div className="relative"><Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#858191]" /><input id="university" name="university" value={form.university} onChange={updateField} placeholder="Search or enter your college" className={`${registerInputClass} pl-11`} /></div>
                                    </div>
                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                        <div><label className="mb-2 block text-sm font-bold text-[#25243a]" htmlFor="course">Course / Degree</label><select id="course" name="course" value={form.course} onChange={updateField} className={registerInputClass}><option value="">Select course</option>{courses.map((course) => <option key={course} value={course}>{course}</option>)}</select></div>
                                        <div><label className="mb-2 block text-sm font-bold text-[#25243a]" htmlFor="year">Study year</label><select id="year" name="year" value={form.year} onChange={updateField} className={registerInputClass}><option value="">Select year</option>{years.map((year) => <option key={year} value={year}>{year}</option>)}</select></div>
                                    </div>
                                    <div><label className="mb-2 block text-sm font-bold text-[#25243a]" htmlFor="bio">Short introduction</label><textarea id="bio" name="bio" value={form.bio} onChange={updateField} placeholder="Tell the community a little about yourself..." rows={3} className={`${registerInputClass} resize-y`} /></div>
                                    <div>
                                        <label className="mb-2 block text-sm font-bold text-[#25243a]">Your interests & skills</label>
                                        <div className="flex flex-wrap gap-2">{popularSkills.map((skill) => { const selected = selectedSkills.includes(skill); return <button key={skill} type="button" onClick={() => toggleSkill(skill)} className={`rounded-full border px-3 py-2 text-xs font-semibold transition ${selected ? "border-[#d9cffb] bg-[#eee9ff] text-[#5947a8]" : "border-[#e7dfd0] bg-[#fffdf9] text-[#6e6a7b] hover:border-[#cfc7df] hover:text-[#17182d]"}`}>{selected ? "✓ " : "+ "}{skill}</button>; })}</div>
                                    </div>
                                    {error && <p role="alert" className="rounded-xl border border-[#f0b6bd] bg-[#fff0f1] p-3 text-sm text-[#a33b48]">{error}</p>}
                                    <button type="submit" disabled={busy} className="group flex w-full items-center justify-center gap-2 rounded-xl border-2 border-[#191a32] bg-[#191a32] py-3.5 font-bold text-white shadow-[0_4px_0_#c9bcff] transition hover:-translate-y-0.5 hover:shadow-[0_6px_0_#c9bcff] disabled:cursor-wait disabled:opacity-60">{busy ? "Creating your account…" : "Create my OrbitU account"}<ArrowRight size={18} className="transition group-hover:translate-x-1" /></button>
                                    <button type="button" onClick={() => finishProfile(true)} disabled={busy} className="w-full rounded-xl border-2 border-[#e7dfd0] bg-white py-3 text-sm font-semibold text-[#514e62] transition hover:border-[#cfc7df] hover:bg-[#f4f0e8] disabled:opacity-50">{busy ? "Creating your account…" : "Skip for now"}</button>
                                </form>
                            </>
                        )}
                    </section>
                </div>
                <footer className="relative mx-auto max-w-7xl px-5 pb-5 text-xs text-[#888394] sm:px-8 lg:px-12">OrbitU · Built for students who make things.</footer>
            </main>
        );
    }

    return (
        <main className="min-h-screen w-full orbit-pattern-bg text-[#17182d]">
            <div className="grid min-h-screen w-full grid-cols-1 lg:grid-cols-2">
                {/* LEFT BRAND PANEL */}
                <section className="relative hidden min-h-screen flex-col justify-between overflow-hidden bg-[#f4e8e9] p-10 xl:p-14 lg:flex">
                    <div className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-[#eee9ff] blur-3xl" />
                    <div className="pointer-events-none absolute -bottom-24 right-0 h-80 w-80 rounded-full bg-[#eee9ff] blur-3xl" />

                    <a href="/" className="relative inline-flex w-fit items-center gap-3">
                        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#ffe35b] text-black">
                            <GraduationCap size={29} />
                        </span>
                        <span className="text-2xl font-bold tracking-tight">
                            Orbit<span className="text-[#6f56d9]">U</span>
                        </span>
                    </a>

                    <div className="relative my-10 max-w-xl">
                        <span className="inline-flex rounded-full border border-[#d9cffb] bg-[#eee9ff] px-4 py-2 text-xs font-semibold tracking-wide text-[#5947a8]">
                            YOUR CAMPUS. YOUR COMMUNITY.
                        </span>

                        <h1 className="mt-7 text-4xl font-bold leading-tight xl:text-6xl">
                            Your next big
                            <br />
                            <span className="text-[#6f56d9]">opportunity</span>
                            <br />
                            starts here.
                        </h1>

                        <p className="mt-6 max-w-lg text-base leading-8 text-[#6e6a7b]">
                            Meet ambitious students, share what you are building, discover
                            new opportunities and grow together.
                        </p>

                        {/* Decorative student network illustration */}
                        <div className="relative mt-9 flex max-w-md items-center justify-between rounded-3xl border border-[#e7dfd0] bg-white/70 p-5">
                            <div className="absolute left-[22%] right-[22%] top-1/2 border-t border-dashed border-[#d9cffb]" />

                            {[
                                { icon: Code2, label: "Build", color: "text-[#6f56d9]" },
                                { icon: Users, label: "Connect", color: "text-[#514e62]" },
                                {
                                    icon: BriefcaseBusiness,
                                    label: "Grow",
                                    color: "text-[#6f56d9]",
                                },
                            ].map(({ icon: Icon, label, color }) => (
                                <div
                                    key={label}
                                    className="relative z-10 flex flex-col items-center gap-3"
                                >
                                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-[#e7dfd0] bg-[#fff3b7]">
                                        <Icon size={25} className={color} />
                                    </div>
                                    <span className="text-xs font-medium text-[#514e62]">
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
                                        className="shrink-0 text-[#6f56d9]"
                                    />
                                    <p className="text-sm text-[#514e62]">{text}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <p className="relative text-xs text-[#858191]">
                        Built for students. Designed for what comes next.
                    </p>
                </section>

                {/* RIGHT PANEL */}
                <section className="flex min-h-screen items-center justify-center bg-white px-5 py-8 sm:px-10 lg:px-12 xl:px-16">
                    <div className="w-full max-w-lg">
                        {/* Mobile brand */}
                        <a
                            href="/"
                            className="mb-9 inline-flex items-center gap-3 lg:hidden"
                        >
                            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#ffe35b] text-black">
                                <GraduationCap size={26} />
                            </span>
                            <span className="text-xl font-bold">
                                Orbit<span className="text-[#6f56d9]">U</span>
                            </span>
                        </a>

                        {/* LOGIN / SIGNUP */}
                        {step === "auth" && (
                            <>
                                <div className="mb-7">
                                    <p className="text-sm font-semibold tracking-wider text-[#6f56d9]">
                                        {mode === "login" ? "WELCOME BACK" : "JOIN THE COMMUNITY"}
                                    </p>

                                    <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
                                        {mode === "login" ? "Sign in" : "Create your account"}
                                    </h2>

                                    <p className="mt-3 text-sm leading-6 text-[#6e6a7b]">
                                        {mode === "login"
                                            ? "Continue connecting with your student community."
                                            : "Start building your student network today."}
                                    </p>
                                </div>

                                <div className="mb-7 grid grid-cols-2 rounded-xl bg-[#f1ecdf] p-1">
                                    <button
                                        type="button"
                                        onClick={() => changeMode("login")}
                                        className={`rounded-lg py-3 text-sm font-semibold transition ${mode === "login"
                                            ? "bg-[#ffe35b] text-black"
                                            : "text-[#6e6a7b] hover:text-[#17182d]"
                                            }`}
                                    >
                                        Login
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => changeMode("signup")}
                                        className={`rounded-lg py-3 text-sm font-semibold transition ${mode === "signup"
                                            ? "bg-[#ffe35b] text-black"
                                            : "text-[#6e6a7b] hover:text-[#17182d]"
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
                                                    className="text-xs font-medium text-[#6f56d9] hover:text-[#5947a8]"
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
                                                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#6e6a7b] hover:text-[#17182d]"
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
                                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#6e6a7b] hover:text-[#17182d]"
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
                                        <label className="flex cursor-pointer items-center gap-2 text-sm text-[#6e6a7b]">
                                            <input
                                                type="checkbox"
                                                checked={remember}
                                                onChange={(event) => setRemember(event.target.checked)}
                                                className="h-4 w-4 accent-[#6f56d9]"
                                            />
                                            Remember me
                                        </label>
                                    )}

                                    {error && (
                                        <p
                                            role="alert"
                                            className="rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-[#a33b48]"
                                        >
                                            {error}
                                        </p>
                                    )}

                                    {notice && (
                                        <p
                                            role="status"
                                            className="rounded-xl border border-[#d9cffb] bg-[#eee9ff] p-3 text-sm leading-5 text-[#5947a8]"
                                        >
                                            {notice}
                                        </p>
                                    )}

                                    <button
                                        type="submit"
                                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#ffe35b] py-3.5 font-semibold text-black transition hover:bg-[#f3d446]"
                                    >
                                        {mode === "login" ? "Login to OrbitU" : "Create account"}
                                        <ArrowRight size={18} />
                                    </button>
                                </form>

                                <p className="mt-7 text-center text-sm text-[#6e6a7b]">
                                    {mode === "login"
                                        ? "New to OrbitU?"
                                        : "Already have an account?"}{" "}
                                    <button
                                        type="button"
                                        onClick={() =>
                                            changeMode(mode === "login" ? "signup" : "login")
                                        }
                                        className="font-semibold text-[#6f56d9] hover:text-[#5947a8]"
                                    >
                                        {mode === "login" ? "Create account" : "Log in"}
                                    </button>
                                </p>

                                <p className="mt-6 text-center text-xs leading-5 text-[#858191]">
                                    By continuing, you agree to OrbitU's Terms of Service and
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
                                    className="mb-6 flex items-center gap-2 text-sm text-[#6e6a7b] hover:text-[#17182d]"
                                >
                                    <ArrowLeft size={17} />
                                    Back
                                </button>

                                <div className="mb-7 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#eee9ff] text-[#6f56d9]">
                                    <Sparkles size={28} />
                                </div>

                                <p className="text-sm font-semibold tracking-wider text-[#6f56d9]">
                                    ONE LAST THING
                                </p>

                                <h2 className="mt-3 text-3xl font-bold">
                                    Build your profile
                                </h2>

                                <p className="mt-3 text-sm leading-6 text-[#6e6a7b]">
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
                                                className="absolute left-4 top-1/2 -translate-y-1/2 text-[#858191]"
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
                                        <p className="mt-2 text-xs text-[#858191]">
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
                                                            ? "border-[#d9cffb] bg-[#eee9ff] text-[#5947a8]"
                                                            : "border-[#e7dfd0] bg-[#fffdf9] text-[#6e6a7b] hover:border-[#cfc7df] hover:text-[#17182d]"
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
                                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#ffe35b] py-3.5 font-semibold text-black transition hover:bg-[#f3d446]"
                                    >
                                        Complete profile
                                        <ArrowRight size={18} />
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => finishProfile(true)} disabled={busy}
                                        className="w-full rounded-xl border border-[#e7dfd0] py-3 text-sm font-medium text-[#514e62] transition hover:border-[#d9cffb] hover:text-[#17182d]"
                                    >
                                        Skip for now
                                    </button>

                                    <p className="text-center text-xs text-[#858191]">
                                        You can update your profile at any time.
                                    </p>
                                </form>
                            </div>
                        )}

                        {/* FRONTEND DEMO WELCOME SCREEN */}
                        {step === "welcome" && (
                            <div className="py-8 text-center">
                                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-[#ffe35b] text-black">
                                    <CheckCircle2 size={42} />
                                </div>

                                <p className="mt-7 text-sm font-semibold tracking-wider text-[#6f56d9]">
                                    WELCOME TO ORBITU
                                </p>

                                <h2 className="mt-3 text-3xl font-bold">
                                    You're ready to explore!
                                </h2>

                                <p className="mx-auto mt-4 max-w-sm text-sm leading-6 text-[#6e6a7b]">
                                    {form.name
                                        ? `Welcome, ${form.name}! `
                                        : "Welcome! "}
                                    Your profile setup is ready. Your student community is
                                    waiting for you.
                                </p>

                                {notice && (
                                    <p className="mt-4 text-sm text-[#5947a8]">{notice}</p>
                                )}

                                <div className="mt-7 rounded-2xl border border-[#e7dfd0] bg-[#fffdf9] p-4 text-left">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#eee9ff] text-[#6f56d9]">
                                            <UserRound size={24} />
                                        </div>
                                        <div>
                                            <p className="font-semibold">
                                                {form.name || "Student"}
                                            </p>
                                            <p className="mt-1 text-xs text-[#6e6a7b]">
                                                {form.course || "Student"}{" "}
                                                {form.year ? `· ${form.year}` : ""}
                                            </p>
                                        </div>
                                    </div>

                                    {form.university && (
                                        <p className="mt-4 text-sm text-[#514e62]">
                                            {form.university}
                                        </p>
                                    )}

                                    {selectedSkills.length > 0 && (
                                        <div className="mt-4 flex flex-wrap gap-2">
                                            {selectedSkills.map((skill) => (
                                                <span
                                                    key={skill}
                                                    className="rounded-full bg-[#f4f0e8] px-3 py-1.5 text-xs text-[#514e62]"
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
                                    className="mt-7 flex w-full items-center justify-center gap-2 rounded-xl bg-[#ffe35b] py-3.5 font-semibold text-black transition hover:bg-[#f3d446]"
                                >
                                    Explore OrbitU
                                    <ArrowRight size={18} />
                                </button>

                                <button
                                    type="button"
                                    onClick={() => changeMode("login")}
                                    className="mt-4 text-sm text-[#6e6a7b] hover:text-[#17182d]"
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






