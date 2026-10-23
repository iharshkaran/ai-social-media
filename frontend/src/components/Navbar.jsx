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
} from "lucide-react";
import { NOTIFICATION_EVENT, readConnections, readNotifications } from "../utils/socialStore";

function getUnreadCount() {
  return readNotifications().filter((item) => !item.read).length + readConnections().incoming.length;
}

const navItems = [
  { label: "Home", path: "/home", icon: Home },
  { label: "Network", path: "/explore", icon: Users },
  { label: "Messages", path: "/messages", icon: MessageCircle },
  { label: "Notifications", path: "/notifications", icon: Bell },
];

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenu, setMobileMenu] = useState(false);
  const [search, setSearch] = useState("");
  const [unreadNotifications, setUnreadNotifications] = useState(getUnreadCount);

  useEffect(() => {
    const sync = (event) => setUnreadNotifications((event.detail || readNotifications()).filter((item) => !item.read).length + readConnections().incoming.length);
    const syncConnections = (event) => setUnreadNotifications(readNotifications().filter((item) => !item.read).length + (event.detail || readConnections()).incoming.length);
    const syncOtherTab = () => setUnreadNotifications(getUnreadCount());
    window.addEventListener(NOTIFICATION_EVENT, sync);
    window.addEventListener("connectly:connections", syncConnections);
    window.addEventListener("storage", syncOtherTab);
    return () => {
      window.removeEventListener(NOTIFICATION_EVENT, sync);
      window.removeEventListener("connectly:connections", syncConnections);
      window.removeEventListener("storage", syncOtherTab);
    };
  }, []);

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

  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-[#111111]/95 text-white backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <button onClick={() => navigate("/home")} className="shrink-0 text-xl font-bold sm:text-2xl">
          <span className="text-yellow-400">Connect</span>ly
        </button>

        <form onSubmit={handleSearch} className="hidden max-w-xs flex-1 items-center gap-2 rounded-xl border border-white/10 bg-[#1b1b1b] px-3 py-2 md:flex">
          <Search size={17} className="text-gray-500" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            aria-label="Search students and skills"
            placeholder="Search students or skills"
            className="w-full bg-transparent text-sm outline-none placeholder:text-gray-500"
          />
        </form>

        <nav className="hidden items-center gap-7 sm:flex">
          {navItems.map(({ label, path, icon: Icon }) => (
            <NavLink key={path} to={path} className={linkClass(path)}>
              <span className="relative">
                <Icon size={21} />
                {path === "/notifications" && unreadNotifications > 0 && (
                  <span className="absolute -right-2 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-yellow-400 px-1 text-[9px] font-bold leading-none text-black">
                    {unreadNotifications > 9 ? "9+" : unreadNotifications}
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
        </nav>

        <button
          onClick={() => setMobileMenu((open) => !open)}
          className="rounded-lg p-2 text-gray-300 hover:bg-white/10 sm:hidden"
          aria-label={mobileMenu ? "Close menu" : "Open menu"}
          aria-expanded={mobileMenu}
          aria-controls="connectly-mobile-menu"
        >
          {mobileMenu ? <X size={23} /> : <Menu size={23} />}
        </button>
      </div>

      {mobileMenu && (
        <div id="connectly-mobile-menu" className="border-t border-white/10 px-4 py-4 sm:hidden">
          <form onSubmit={handleSearch} className="mb-4 flex gap-2">
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              aria-label="Search students and skills"
              placeholder="Search students or skills"
              className="min-w-0 flex-1 rounded-xl border border-white/10 bg-[#1b1b1b] px-3 py-2 text-sm outline-none focus:border-yellow-400"
            />
            <button type="submit" className="rounded-xl bg-yellow-400 px-3 text-black" aria-label="Search">
              <Search size={18} />
            </button>
          </form>
          <nav className="grid grid-cols-3 gap-4">
            {navItems.map(({ label, path, icon: Icon }) => (
              <NavLink key={path} to={path} onClick={() => setMobileMenu(false)} className={linkClass(path)}>
                <span className="relative">
                  <Icon size={21} />
                  {path === "/notifications" && unreadNotifications > 0 && (
                    <span className="absolute -right-2 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-yellow-400 px-1 text-[9px] font-bold leading-none text-black">
                      {unreadNotifications > 9 ? "9+" : unreadNotifications}
                    </span>
                  )}
                </span>
                <span>{label}</span>
              </NavLink>
            ))}
            <NavLink to="/profile" onClick={() => setMobileMenu(false)} className={linkClass("/profile")}>
              <UserRound size={21} />
              <span>Profile</span>
            </NavLink>
          </nav>
        </div>
      )}
    </header>
  );
}
