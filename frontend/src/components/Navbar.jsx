import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  Home,
  Bell,
  MessageCircle,
  Search,
  UserRound,
  LogOut,
  ChevronDown,
  Plus,
} from "lucide-react";
import { useConnectlyStore } from "../store/useConnectlyStore";
import { api } from "../utils/api";
import { useAuth } from "../context/useAuth";

const navItems = [
  { label: "Home", path: "/home", icon: Home },
  { label: "Explore", path: "/explore", icon: Search },
  { label: "Messages", path: "/messages", icon: MessageCircle },
  { label: "Notifications", path: "/notifications", icon: Bell },
];

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, setUser } = useAuth();
  const [profileMenu, setProfileMenu] = useState(false);
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);
  const profileMenuRef = useRef(null);
  const mobileProfileMenuRef = useRef(null);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [incomingRequests, setIncomingRequests] = useState(0);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [activityToast, setActivityToast] = useState(null);
  const [loggingOut, setLoggingOut] = useState(false);
  const [logoutError, setLogoutError] = useState("");

  useEffect(() => {
    if (!profileMenu) return undefined;
    const closeOnOutsideClick = (event) => {
      if (!profileMenuRef.current?.contains(event.target) && !mobileProfileMenuRef.current?.contains(event.target)) setProfileMenu(false);
    };
    const closeOnEscape = (event) => {
      if (event.key === "Escape") setProfileMenu(false);
    };
    document.addEventListener("pointerdown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [profileMenu]);

  useEffect(() => {
    let active = true;
    let hasBaseline = false;
    let previousRequests = 0;
    let previousUnreadMessages = 0;
    let toastTimer;
    const refreshUnread = async () => {
      try {
        const store = useConnectlyStore.getState();
        const [notifications, network, inbox] = await Promise.all([store.loadNotifications(), store.loadConnections(), store.loadInbox()]);
        const requestCount = network.incoming.length;
        const messageCount = inbox.reduce((total, chat) => total + chat.unreadCount, 0);
        const notificationCount = notifications.filter((item) => !item.read).length;
        if (!active) return;
        if (hasBaseline && requestCount > previousRequests) {
          const requester = network.incoming[0]?.name;
          setActivityToast({ path: "/explore", text: requester ? `${requester} sent you a connection request` : "You have a new connection request" });
        } else if (hasBaseline && messageCount > previousUnreadMessages) {
          const sender = inbox.find((chat) => chat.unreadCount > 0)?.name;
          setActivityToast({ path: "/messages", text: sender ? `New message from ${sender}` : "You have a new message" });
        }
        previousRequests = requestCount;
        previousUnreadMessages = messageCount;
        hasBaseline = true;
        setIncomingRequests(requestCount);
        setUnreadMessages(messageCount);
        setUnreadNotifications(notificationCount);
        if (toastTimer) window.clearTimeout(toastTimer);
        toastTimer = window.setTimeout(() => setActivityToast(null), 8000);
      } catch {
        if (active) {
          setIncomingRequests(0);
          setUnreadMessages(0);
          setUnreadNotifications(0);
        }
      }
    };
    refreshUnread();
    const interval = window.setInterval(refreshUnread, 15000);
    window.addEventListener("connectly:backend-update", refreshUnread);
    return () => {
      active = false;
      window.clearInterval(interval);
      if (toastTimer) window.clearTimeout(toastTimer);
      window.removeEventListener("connectly:backend-update", refreshUnread);
    };
  }, []);
  async function handleLogout() {
    setLoggingOut(true);
    setLogoutError("");
    try {
      await api.logout();
      setUser(null);
      setProfileMenu(false);
      setLogoutConfirmOpen(false);
      navigate("/", { replace: true });
    } catch (error) {
      setLogoutError(error.message);
    } finally {
      setLoggingOut(false);
    }
  }

  const linkClass = (path) => ({ isActive }) => {
    const active = isActive || (path === "/explore" && location.pathname === "/connections");
    return `flex flex-col items-center gap-1 text-xs transition ${active ? "text-[#6f56d9]" : "text-[#6e6a7b] hover:text-[#17182d]"}`;
  };

  const badgeCount = (path) => path === "/explore" ? incomingRequests : path === "/messages" ? unreadMessages : path === "/notifications" ? unreadNotifications : 0;
  const displayName = user?.name || user?.fullName || "OrbitU member";
  const initials = displayName.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase();
  const showMobileAppNavigation = true;

  return (
    <>
    <header className="sticky top-0 z-30 border-b border-[#d8d0c1] orbit-nav-bg text-[#17182d] backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <button onClick={() => navigate("/home")} aria-label="OrbitU home" className="shrink-0">
          <span className="flex items-center gap-2.5">
            <svg aria-hidden="true" viewBox="0 0 40 40" className="h-9 w-9 drop-shadow-sm sm:h-10 sm:w-10">
              <rect x="1" y="1" width="38" height="38" rx="12" fill="#191a32" />
              <ellipse cx="20" cy="20" rx="13" ry="7" transform="rotate(-35 20 20)" fill="none" stroke="#c9bcff" strokeWidth="2.2" />
              <ellipse cx="20" cy="20" rx="13" ry="7" transform="rotate(52 20 20)" fill="none" stroke="#ffe35b" strokeWidth="1.7" />
              <circle cx="20" cy="20" r="4" fill="#fffdf9" />
              <circle cx="30.6" cy="10.8" r="2.7" fill="#ffe35b" />
            </svg>
            <span className="text-[26px] font-black leading-none tracking-[-0.075em] text-[#191a32] sm:text-[29px]">Orbit<span className="text-[#6f56d9]">U</span></span>
          </span>
        </button>

        <div className="flex items-center gap-3 sm:gap-5">
        <nav className="hidden items-center gap-7 sm:flex">
          {navItems.map(({ label, path, icon: Icon }) => (
            <NavLink key={path} to={path} className={linkClass(path)}>
              <span className="relative">
                <Icon size={21} />
                {badgeCount(path) > 0 && (
                  <span className="absolute -right-2 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#ffe35b] px-1 text-[9px] font-bold leading-none text-black">
                    {badgeCount(path) > 9 ? "9+" : badgeCount(path)}
                  </span>
                )}
              </span>
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="relative z-40 hidden shrink-0 sm:block" ref={profileMenuRef}>
          <button
            type="button"
            onClick={() => setProfileMenu((open) => !open)}
            aria-label="Open account menu"
            aria-haspopup="menu"
            aria-expanded={profileMenu}
            className="flex items-center gap-1.5 rounded-full border-2 border-[#191a32] bg-white p-1 shadow-[0_2px_0_#c9bcff] transition hover:-translate-y-0.5"
          >
              <span className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-[#c9bcff] text-sm font-bold text-[#5947a8]">
              {user?.photo ? <img src={user.photo} alt="" className="h-full w-full object-cover" /> : initials || <UserRound size={17} />}
            </span>
            <ChevronDown size={15} className={`mr-1 text-[#514e62] transition-transform ${profileMenu ? "rotate-180" : ""}`} />
          </button>
          {profileMenu && (
            <div role="menu" aria-label="Account menu" className="absolute right-0 top-full mt-3 w-60 overflow-hidden rounded-2xl border-2 border-[#191a32] bg-white shadow-[4px_5px_0_#191a32]">
              <div className="border-b border-[#e7dfd0] bg-[#fffdf9] px-4 py-3">
                <p className="truncate text-sm font-bold text-[#17182d]">{displayName}</p>
                {user?.email && <p className="truncate text-xs text-[#6e6a7b]">{user.email}</p>}
              </div>
              <button type="button" role="menuitem" onClick={() => { setProfileMenu(false); navigate("/profile"); }} className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-medium text-[#343247] transition hover:bg-[#eee9ff]">
                <UserRound size={17} className="text-[#6f56d9]" /> Profile
              </button>
              <button type="button" role="menuitem" onClick={() => { setProfileMenu(false); setLogoutConfirmOpen(true); setLogoutError(""); }} className="flex w-full items-center gap-3 border-t border-[#e7dfd0] px-4 py-3 text-left text-sm font-medium text-[#a33b48] transition hover:bg-[#fff1ed]">
                <LogOut size={17} /> Logout
              </button>
            </div>
          )}
        </div>

        {showMobileAppNavigation && <Link to="/messages" aria-label="Open messages" className="relative flex h-11 w-11 items-center justify-center rounded-full border-2 border-[#191a32] bg-white text-[#5947a8] shadow-[0_2px_0_#c9bcff] sm:hidden">
          <MessageCircle size={20} />{unreadMessages > 0 && <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full border border-white bg-[#ffe35b] px-1 text-[10px] font-bold text-[#17182d]">{unreadMessages > 9 ? "9+" : unreadMessages}</span>}
        </Link>}
        </div>
      </div>

      {activityToast && <button type="button" onClick={() => { navigate(activityToast.path); setActivityToast(null); }} role="status" className="flex w-full items-center justify-center gap-2 border-t border-[#d9cffb] bg-[#eee9ff] px-4 py-2.5 text-sm text-[#5947a8] transition hover:bg-[#eee9ff]"><Bell size={15} className="shrink-0 text-[#6f56d9]" /><span>{activityToast.text}</span><span className="text-xs text-[#6f56d9]">View</span></button>}
      {logoutError && <p role="alert" className="border-t border-red-400/20 px-4 py-2 text-center text-xs text-[#a33b48]">{logoutError}</p>}
    </header>
    {logoutConfirmOpen && <div className="fixed inset-0 z-[60] flex items-center justify-center bg-[#17182d]/45 p-4" onMouseDown={(event) => {
      if (event.target === event.currentTarget && !loggingOut) setLogoutConfirmOpen(false);
    }}>
      <section role="alertdialog" aria-modal="true" aria-labelledby="logout-confirm-title" aria-describedby="logout-confirm-description" className="w-full max-w-sm rounded-[24px] border-2 border-[#191a32] bg-white p-5 text-[#17182d] shadow-[5px_6px_0_#c9bcff] sm:p-6">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl border-2 border-[#191a32] bg-[#fff3b7] text-[#5947a8]"><LogOut size={20} /></div>
        <h2 id="logout-confirm-title" className="mt-4 text-lg font-extrabold">Log out of OrbitU?</h2>
        <p id="logout-confirm-description" className="mt-2 text-sm leading-6 text-[#6e6a7b]">You’ll need to sign in again to continue using your account.</p>
        {logoutError && <p role="alert" className="mt-3 text-sm text-[#a33b48]">{logoutError}</p>}
        <div className="mt-6 flex justify-end gap-3">
          <button type="button" disabled={loggingOut} onClick={() => setLogoutConfirmOpen(false)} className="rounded-xl border-2 border-[#e7dfd0] px-4 py-2.5 text-sm font-semibold text-[#514e62] transition hover:bg-[#f4f0e8] disabled:opacity-50">Cancel</button>
          <button type="button" disabled={loggingOut} onClick={handleLogout} className="rounded-xl border-2 border-[#191a32] bg-[#ffe35b] px-4 py-2.5 text-sm font-bold text-[#17182d] shadow-[0_3px_0_#191a32] transition hover:-translate-y-0.5 disabled:cursor-wait disabled:opacity-50">{loggingOut ? "Logging out…" : "Log out"}</button>
        </div>
      </section>
    </div>}
    {showMobileAppNavigation && <nav aria-label="App navigation" className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t-2 border-[#191a32] orbit-nav-bg px-1 pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] shadow-[0_-3px_12px_rgba(25,26,50,0.08)] sm:hidden">
      <NavLink to="/home" className={({ isActive }) => `flex flex-col items-center gap-1 py-1 text-[10px] font-medium ${isActive ? "text-[#6f56d9]" : "text-[#6e6a7b]"}`}><Home size={20} /><span>Home</span></NavLink>
      <NavLink to="/explore" className={({ isActive }) => `flex flex-col items-center gap-1 py-1 text-[10px] font-medium ${isActive ? "text-[#6f56d9]" : "text-[#6e6a7b]"}`}><Search size={20} /><span>Explore</span></NavLink>
      <NavLink to="/create-post" className={({ isActive }) => `flex flex-col items-center gap-1 py-1 text-[10px] font-medium ${isActive ? "text-[#6f56d9]" : "text-[#6e6a7b]"}`}><span className="flex h-7 w-7 items-center justify-center rounded-lg border-2 border-[#191a32] bg-[#ffe35b] text-[#17182d] shadow-[0_2px_0_#191a32]"><Plus size={18} /></span><span>Add post</span></NavLink>
      <NavLink to="/notifications" className={({ isActive }) => `relative flex flex-col items-center gap-1 py-1 text-[10px] font-medium ${isActive ? "text-[#6f56d9]" : "text-[#6e6a7b]"}`}><span className="relative"><Bell size={20} />{unreadNotifications > 0 && <span className="absolute -right-2 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#ffe35b] px-1 text-[9px] font-bold leading-none text-[#17182d]">{unreadNotifications > 9 ? "9+" : unreadNotifications}</span>}</span><span>Alerts</span></NavLink>
      <div className="relative flex justify-center" ref={mobileProfileMenuRef}>
        <button type="button" onClick={() => setProfileMenu((open) => !open)} aria-label="Open profile menu" aria-haspopup="menu" aria-expanded={profileMenu} className={`flex flex-col items-center gap-1 py-1 text-[10px] font-medium ${location.pathname.startsWith("/profile") || profileMenu ? "text-[#6f56d9]" : "text-[#6e6a7b]"}`}>
          <span className="flex h-7 w-7 items-center justify-center overflow-hidden rounded-full border-2 border-[#191a32] bg-[#c9bcff] text-[10px] font-bold text-[#5947a8] shadow-[0_2px_0_#c9bcff]">
            {user?.photo ? <img src={user.photo} alt="" className="h-full w-full object-cover" /> : initials || <UserRound size={15} />}
          </span>
          <span>Profile</span>
        </button>
        {profileMenu && <div role="menu" aria-label="Profile options" className="absolute bottom-full right-0 mb-3 w-56 overflow-hidden rounded-2xl border-2 border-[#191a32] bg-white text-[#17182d] shadow-[4px_5px_0_#191a32]">
          <div className="border-b border-[#e7dfd0] bg-[#fffdf9] px-4 py-3">
            <p className="truncate text-sm font-bold">{displayName}</p>
            {user?.email && <p className="truncate text-xs text-[#6e6a7b]">{user.email}</p>}
          </div>
          <button type="button" role="menuitem" onClick={() => { setProfileMenu(false); navigate("/profile"); }} className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-medium transition hover:bg-[#eee9ff]"><UserRound size={17} className="text-[#6f56d9]" /> Profile</button>
          <button type="button" role="menuitem" onClick={() => { setProfileMenu(false); setLogoutConfirmOpen(true); setLogoutError(""); }} className="flex w-full items-center gap-3 border-t border-[#e7dfd0] px-4 py-3 text-left text-sm font-medium text-[#a33b48] transition hover:bg-[#fff1ed]"><LogOut size={17} /> Logout</button>
        </div>}
      </div>
    </nav>}
    </>
  );
}





