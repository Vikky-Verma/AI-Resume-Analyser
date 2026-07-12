import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  FileText,
  Mic,
  ClipboardCheck,
  LogOut,
  ChevronDown,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
      {/* Logo + Section Links */}
      <div className="flex items-center gap-8">
        <Link
          to="/dashboard"
          className="flex items-center gap-3 no-underline shrink-0"
        >
          <div className="w-9 h-9 bg-indigo-500 rounded-xl flex items-center justify-center">
            <FileText size={18} className="text-white" />
          </div>

          <span className="text-white font-bold text-lg tracking-tight">
            AlgoVerse
          </span>
        </Link>

        <div className="hidden sm:flex items-center gap-6">
          <NavLink to="/interview">
            <span className="flex items-center gap-1.5">
              <Mic size={14} /> Mock Interview
            </span>
          </NavLink>
          <NavLink to="/ats-checker">
            <span className="flex items-center gap-1.5">
              <ClipboardCheck size={14} /> ATS Checker
            </span>
          </NavLink>
        </div>
      </div>

      {/* Right Side */}
      <div className="flex items-center gap-3">
        {user && (
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setOpen(!open)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg border border-[#2e3150] bg-[#20243b] hover:bg-[#242840] text-white transition-all"
            >
              <span>{user.name || user.email}</span>

              <ChevronDown
                size={16}
                className={`transition-transform ${
                  open ? "rotate-180" : ""
                }`}
              />
            </button>

            {open && (
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
        )}
      </div>
    </nav>
  );
};

export default Navbar;