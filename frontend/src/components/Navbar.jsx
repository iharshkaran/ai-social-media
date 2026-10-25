import { useEffect, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  Home,
  Users,
  Bell,
  MessageCircle,
  Search,
  Menu,
  X,
  UserRound,
  LogOut,
} from "lucide-react";
import { useConnectlyStore } from "../store/useConnectlyStore";
import { api } from "../utils/api";
import { useAuth } from "../context/useAuth";

const navItems = [
  { label: "Home", path: "/home", icon: Home },
  { label: "Network", path: "/explore", icon: Users },
  { label: "Messages", path: "/messages", icon: MessageCircle },
  { label: "Notifications", path: "/notifications", icon: Bell },
];

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { setUser } = useAuth();
  const [mobileMenu, setMobileMenu] = useState(false);
  const [search, setSearch] = useState("");
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [incomingRequests, setIncomingRequests] = useState(0);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [activityToast, setActivityToast] = useState(null);
  const [loggingOut, setLoggingOut] = useState(false);
  const [logoutError, setLogoutError] = useState("");

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
      setMobileMenu(false);
      navigate("/", { replace: true });
    } catch (error) {
      setLogoutError(error.message);
    } finally {
      setLoggingOut(false);
    }
  }

  function handleSearch(event) {
    event.preventDefault();
    const query = search.trim();
    if (query) {
      navigate(`/explore?q=${encodeURIComponent(query)}`);
      setMobileMenu(false);
    }
  }

  const linkClass = (path) => ({ isActive }) => {
    const active = isActive || (path === "/explore" && location.pathname === "/connections");
    return `flex flex-col items-center gap-1 text-xs transition ${active ? "text-yellow-400" : "text-gray-400 hover:text-white"}`;
  };

  const logoutButton = "flex flex-col items-center gap-1 text-xs text-gray-400 transition hover:text-white disabled:opacity-50";
  const badgeCount = (path) => path === "/explore" ? incomingRequests : path === "/messages" ? unreadMessages : path === "/notifications" ? unreadNotifications : 0;

  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-[#111111]/95 text-white backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <button onClick={() => navigate("/home")} className="shrink-0 text-xl font-bold sm:text-2xl">
          <span className="flex items-center gap-2">
            <svg aria-hidden="true" viewBox="0 0 32 32" className="h-7 w-7 text-yellow-400">
              <ellipse cx="16" cy="16" rx="12" ry="6" transform="rotate(-32 16 16)" fill="none" stroke="currentColor" strokeWidth="2" />
              <circle cx="16" cy="16" r="3.5" fill="currentColor" />
              <circle cx="26" cy="9" r="2" fill="white" />
            </svg>
            <span><span className="text-yellow-400">Orbit</span>U</span>
          </span>
        </button>

        <form onSubmit={handleSearch} className="hidden max-w-xs flex-1 items-center gap-2 rounded-xl border border-white/10 bg-[#1b1b1b] px-3 py-2 md:flex">
          <Search size={17} className="text-gray-500" />
          <input value={search} onChange={(event) => setSearch(event.target.value)} aria-label="Search students and skills" placeholder="Search students or skills" className="w-full bg-transparent text-sm outline-none placeholder:text-gray-500" />
        </form>

        <nav className="hidden items-center gap-7 sm:flex">
          {navItems.map(({ label, path, icon: Icon }) => (
            <NavLink key={path} to={path} className={linkClass(path)}>
              <span className="relative">
                <Icon size={21} />
                {badgeCount(path) > 0 && (
                  <span className="absolute -right-2 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-yellow-400 px-1 text-[9px] font-bold leading-none text-black">
                    {badgeCount(path) > 9 ? "9+" : badgeCount(path)}
                  </span>
                )}
              </span>
              <span>{label}</span>
            </NavLink>
          ))}
          <NavLink to="/profile" className={linkClass("/profile")}>
            <UserRound size={21} />
            <span>Profile</span>
          </NavLink>
          <button type="button" onClick={handleLogout} disabled={loggingOut} className={logoutButton}>
            <LogOut size={21} />
            <span>{loggingOut ? "Signing out..." : "Logout"}</span>
          </button>
        </nav>

        <button onClick={() => setMobileMenu((open) => !open)} className="rounded-lg p-2 text-gray-300 hover:bg-white/10 sm:hidden" aria-label={mobileMenu ? "Close menu" : "Open menu"} aria-expanded={mobileMenu} aria-controls="connectly-mobile-menu">
          {mobileMenu ? <X size={23} /> : <Menu size={23} />}
        </button>
      </div>

      {activityToast && <button type="button" onClick={() => { navigate(activityToast.path); setActivityToast(null); setMobileMenu(false); }} role="status" className="flex w-full items-center justify-center gap-2 border-t border-yellow-400/20 bg-yellow-400/[0.08] px-4 py-2.5 text-sm text-yellow-100 transition hover:bg-yellow-400/[0.14]"><Bell size={15} className="shrink-0 text-yellow-400" /><span>{activityToast.text}</span><span className="text-xs text-yellow-400">View</span></button>}
      {logoutError && <p role="alert" className="border-t border-red-400/20 px-4 py-2 text-center text-xs text-red-300">{logoutError}</p>}
      {mobileMenu && (
        <div id="connectly-mobile-menu" className="border-t border-white/10 px-4 py-4 sm:hidden">
          <form onSubmit={handleSearch} className="mb-4 flex gap-2">
            <input value={search} onChange={(event) => setSearch(event.target.value)} aria-label="Search students and skills" placeholder="Search students or skills" className="min-w-0 flex-1 rounded-xl border border-white/10 bg-[#1b1b1b] px-3 py-2 text-sm outline-none focus:border-yellow-400" />
            <button type="submit" className="rounded-xl bg-yellow-400 px-3 text-black" aria-label="Search"><Search size={18} /></button>
          </form>
          <nav className="grid grid-cols-3 gap-4">
            {navItems.map(({ label, path, icon: Icon }) => (
              <NavLink key={path} to={path} onClick={() => setMobileMenu(false)} className={linkClass(path)}>
                <span className="relative">
                  <Icon size={21} />
                  {badgeCount(path) > 0 && (
                    <span className="absolute -right-2 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-yellow-400 px-1 text-[9px] font-bold leading-none text-black">{badgeCount(path) > 9 ? "9+" : badgeCount(path)}</span>
                  )}
                </span>
                <span>{label}</span>
              </NavLink>
            ))}
            <NavLink to="/profile" onClick={() => setMobileMenu(false)} className={linkClass("/profile")}>
              <UserRound size={21} />
              <span>Profile</span>
            </NavLink>
            <button type="button" onClick={handleLogout} disabled={loggingOut} className={logoutButton}>
              <LogOut size={21} />
              <span>{loggingOut ? "Signing out..." : "Logout"}</span>
            </button>
          </nav>
        </div>
      )}
    </header>
  );
}





