
import {
  Search,
  House,
  Users,
  Bell,
  MessageCircle,
  UserRound,
  GraduationCap,
} from "lucide-react";

const navItems = [
  { label: "Home", icon: House, active: true },
  { label: "Network", icon: Users },
  { label: "Messages", icon: MessageCircle },
  { label: "Notifications", icon: Bell },
];

function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#191919]/95 backdrop-blur">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4">
        {/* Logo */}
        <a href="/" className="flex shrink-0 items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-yellow-400 text-black">
            <GraduationCap size={24} strokeWidth={2.5} />
          </div>

          <span className="text-xl font-bold tracking-tight">
            Connect<span className="text-yellow-400">ly</span>
          </span>
        </a>

        {/* Search */}
        <div className="hidden max-w-sm flex-1 md:block">
          <div className="flex items-center gap-3 rounded-full bg-white/[0.06] px-4 py-2.5 focus-within:ring-1 focus-within:ring-yellow-400">
            <Search size={18} className="text-gray-400" />

            <input
              type="search"
              placeholder="Search students, skills, colleges..."
              className="w-full bg-transparent text-sm text-white outline-none placeholder:text-gray-500"
            />
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center gap-1 sm:gap-3">
          {navItems.map(({ label, icon: Icon, active }) => (
            <button
              key={label}
              type="button"
              aria-label={label}
              title={label}
              className={`relative flex h-10 w-10 items-center justify-center rounded-xl transition ${
                active
                  ? "bg-yellow-400/10 text-yellow-400"
                  : "text-gray-400 hover:bg-white/10 hover:text-white"
              }`}
            >
              <Icon size={21} />

              {label === "Notifications" && (
                <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-yellow-400" />
              )}
            </button>
          ))}

          {/* Profile */}
          <button
            type="button"
            title="Profile"
            className="ml-1 flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-[#292929] text-gray-200 hover:border-yellow-400"
          >
            <UserRound size={20} />
          </button>
        </div>
      </nav>
    </header>
  );
}

export default Navbar;
