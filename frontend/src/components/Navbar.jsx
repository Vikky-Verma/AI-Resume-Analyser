import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { LogOut, FileText, LayoutDashboard, ChevronDown, User } from "lucide-react";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Get initials for avatar
  const getInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <nav className="bg-[#1a1d2e] border-b border-[#2e3150] px-6 h-16 flex items-center justify-between sticky top-0 z-50">
      
      {/* Logo */}
      <Link to="/dashboard" className="flex items-center gap-3 no-underline">
        <div className="w-9 h-9 bg-indigo-500 rounded-xl flex items-center justify-center">
          <FileText size={18} className="text-white" />
        </div>
        <span className="text-white font-bold text-lg tracking-tight">ResumeAI</span>
      </Link>

      <div className="flex items-center gap-3">

        {/* Dashboard Link */}
        <Link
          to="/dashboard"
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-slate-300 border border-[#2e3150] hover:bg-[#242840] transition-all"
        >
          <LayoutDashboard size={15} />
          <span className="hidden sm:block">Dashboard</span>
        </Link>

        {/* User Dropdown */}
        {user && (
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen((prev) => !prev)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-white bg-[#242840] border border-[#2e3150] hover:border-indigo-500/50 transition-all"
            >
              {/* Avatar circle with initials */}
              <div className="w-6 h-6 bg-indigo-500 rounded-full flex items-center justify-center">
                <span className="text-white text-[10px] font-bold">
                  {getInitials(user.name || user.email)}
                </span>
              </div>
              <span className="hidden sm:block max-w-[120px] truncate">
                {user.name || user.email}
              </span>
              <ChevronDown
                size={14}
                className={`text-slate-400 transition-transform duration-200 ${
                  dropdownOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {/* Dropdown Menu */}
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-52 bg-[#1a1d2e] border border-[#2e3150] rounded-xl shadow-xl overflow-hidden z-50">
                
                {/* User Info */}
                <div className="px-4 py-3 border-b border-[#2e3150]">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-xs font-bold">
                        {getInitials(user.name || user.email)}
                      </span>
                    </div>
                    <div className="overflow-hidden">
                      <p className="text-white text-sm font-semibold truncate">
                        {user.name || "User"}
                      </p>
                      <p className="text-slate-500 text-xs truncate">
                        {user.email}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Logout Button */}
                <button
                  onClick={() => {
                    setDropdownOpen(false);
                    logout();
                    navigate("/login");
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-400 hover:bg-red-950/40 transition-all"
                >
                  <LogOut size={15} />
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