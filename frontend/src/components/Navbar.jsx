import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  FileText,
  LayoutDashboard,
  LogOut,
  ChevronDown,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

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

  return (
    <nav className="bg-[#1a1d2e] border-b border-[#2e3150] px-6 h-16 flex items-center justify-between sticky top-0 z-50">
      {/* Logo */}
      <Link
        to="/dashboard"
        className="flex items-center gap-3 no-underline"
      >
        <div className="w-9 h-9 bg-indigo-500 rounded-xl flex items-center justify-center">
          <FileText size={18} className="text-white" />
        </div>

        <span className="text-white font-bold text-lg tracking-tight">
          ResumeAI
        </span>
      </Link>

      {/* Right Side */}
      <div className="flex items-center gap-3">
        <Link
          to="/dashboard"
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-slate-300 border border-[#2e3150] hover:bg-[#242840] transition-all"
        >
          <LayoutDashboard size={15} />
          <span className="hidden sm:block">Dashboard</span>
        </Link>

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