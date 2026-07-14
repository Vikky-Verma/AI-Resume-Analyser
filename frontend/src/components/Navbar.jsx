import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  FileText,
  Mic,
  ClipboardCheck,
  Radar,
  LogOut,
  ChevronDown,
  Menu,
  X,
  Code2,
  FolderGit2,
  Route as RouteIcon,
  Building2,
  KanbanSquare,
  Layout,
  Trophy,
  LayoutDashboard,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";

const PREPARE_ITEMS = [
  { to: "/ats-checker", label: "ATS Checker", icon: FileText },
  { to: "/dsa-insights", label: "DSA Insights", icon: Code2 },
  { to: "/project-intelligence", label: "Project Intelligence", icon: FolderGit2 },
  { to: "/ai-roadmap", label: "AI Roadmap", icon: RouteIcon },
  { to: "/interview", label: "Mock Interview", icon: Mic },
  { to: "/company-prep", label: "Company Prep", icon: Building2 },
];

const TRACK_ITEMS = [
  { to: "/internship-tracker", label: "Internship Tracker", icon: KanbanSquare, soon: true },
  { to: "/portfolio-builder", label: "Portfolio Builder", icon: Layout, soon: true },
  { to: "/progress", label: "Progress", icon: Trophy },
];

const SoonBadge = () => (
  <span className="ml-auto text-[10px] font-semibold tracking-wide uppercase text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 rounded-full px-2 py-0.5">
    Soon
  </span>
);

const DesktopDropdown = ({ label, items }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const location = useLocation();

  useEffect(() => {
    const onClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const active = items.some((i) => location.pathname.startsWith(i.to));

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className={`flex items-center gap-1.5 text-sm font-semibold transition-colors ${
          active ? "text-indigo-400" : "text-slate-300 hover:text-white"
        }`}
      >
        {label}
        <ChevronDown size={14} className={`transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute left-0 mt-3 w-64 rounded-xl bg-[#171a2c] border border-[#2e3150] shadow-2xl overflow-hidden py-2 z-50">
          {items.map(({ to, label, icon: Icon, soon }) => (
            <Link
              key={to}
              to={to}
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-300 hover:bg-[#20243b] hover:text-white transition-colors"
            >
              <Icon size={16} className="text-indigo-400 shrink-0" />
              {label}
              {soon && <SoonBadge />}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileGroup, setMobileGroup] = useState(null);
  const userMenuRef = useRef(null);

  useEffect(() => {
    const onClick = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
    setMobileGroup(null);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const isActive = (path) => location.pathname.startsWith(path);

  const NavLink = ({ to, children }) => (
    <Link
      to={to}
      className={`text-sm font-semibold transition-colors ${
        isActive(to) ? "text-indigo-400" : "text-slate-300 hover:text-white"
      }`}
    >
      {children}
    </Link>
  );

  return (
    <nav className="bg-[#1a1d2e] border-b border-[#2e3150] px-6 h-16 flex items-center justify-between sticky top-0 z-50">
      {/* Logo + Links */}
      <div className="flex items-center gap-8">
        <Link to="/dashboard" className="flex items-center gap-3 no-underline shrink-0">
          <div className="w-9 h-9 bg-indigo-500 rounded-xl flex items-center justify-center">
            <FileText size={18} className="text-white" />
          </div>
          <span className="text-white font-bold text-lg tracking-tight">AlgoVerse</span>
        </Link>

        <div className="hidden lg:flex items-center gap-7">
          <NavLink to="/dashboard">
            <span className="flex items-center gap-1.5">
              <LayoutDashboard size={14} /> Dashboard
            </span>
          </NavLink>
          <DesktopDropdown label="Prepare" items={PREPARE_ITEMS} />
          <DesktopDropdown label="Track" items={TRACK_ITEMS} />
          <NavLink to="/pricing">Pricing</NavLink>
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-3">
        {user ? (
          <div className="relative hidden sm:block" ref={userMenuRef}>
            <button
              onClick={() => setUserMenuOpen((o) => !o)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg border border-[#2e3150] bg-[#20243b] hover:bg-[#242840] text-white transition-all"
            >
              <span>{user.name || user.email}</span>
              <ChevronDown size={16} className={`transition-transform ${userMenuOpen ? "rotate-180" : ""}`} />
            </button>

            {userMenuOpen && (
              <div className="absolute right-0 mt-2 w-40 rounded-lg bg-[#1a1d2e] border border-[#2e3150] shadow-xl overflow-hidden">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-4 py-3 text-red-400 hover:bg-[#242840] transition-all"
                >
                  <LogOut size={16} />
                  Logout
                </button>
              </div>
            )}
          </div>
        ) : (
          <Link
            to="/login"
            className="hidden sm:inline-flex items-center px-4 py-2 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-semibold transition-colors"
          >
            Login
          </Link>
        )}

        {/* Mobile hamburger */}
        <button
          onClick={() => setMobileOpen((o) => !o)}
          className="lg:hidden flex items-center justify-center w-9 h-9 rounded-lg border border-[#2e3150] bg-[#20243b] text-white"
        >
          {mobileOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="lg:hidden absolute top-16 left-0 right-0 bg-[#1a1d2e] border-b border-[#2e3150] max-h-[calc(100vh-4rem)] overflow-y-auto">
          <div className="flex flex-col px-4 py-3">
            <Link
              to="/dashboard"
              className="flex items-center gap-2 py-3 text-sm font-semibold text-slate-200 border-b border-[#242840]"
            >
              <LayoutDashboard size={16} /> Dashboard
            </Link>

            {[
              { key: "prepare", label: "Prepare", items: PREPARE_ITEMS },
              { key: "track", label: "Track", items: TRACK_ITEMS },
            ].map((group) => (
              <div key={group.key} className="border-b border-[#242840]">
                <button
                  onClick={() => setMobileGroup(mobileGroup === group.key ? null : group.key)}
                  className="w-full flex items-center justify-between py-3 text-sm font-semibold text-slate-200"
                >
                  {group.label}
                  <ChevronDown
                    size={16}
                    className={`transition-transform ${mobileGroup === group.key ? "rotate-180" : ""}`}
                  />
                </button>
                {mobileGroup === group.key && (
                  <div className="pb-2 flex flex-col gap-1">
                    {group.items.map(({ to, label, icon: Icon, soon }) => (
                      <Link
                        key={to}
                        to={to}
                        className="flex items-center gap-3 py-2.5 pl-3 text-sm text-slate-400"
                      >
                        <Icon size={15} className="text-indigo-400" />
                        {label}
                        {soon && <SoonBadge />}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}

            <Link to="/pricing" className="py-3 text-sm font-semibold text-slate-200 border-b border-[#242840]">
              Pricing
            </Link>

            {user ? (
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 py-3 text-sm font-semibold text-red-400"
              >
                <LogOut size={16} /> Logout
              </button>
            ) : (
              <Link to="/login" className="py-3 text-sm font-semibold text-indigo-400">
                Login
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;