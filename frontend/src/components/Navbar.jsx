import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { LogOut, FileText, LayoutDashboard } from "lucide-react";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <nav className="bg-[#1a1d2e] border-b border-[#2e3150] px-6 h-16 flex items-center justify-between sticky top-0 z-50">
      <Link to="/dashboard" className="flex items-center gap-3 no-underline">
        <div className="w-9 h-9 bg-indigo-500 rounded-xl flex items-center justify-center">
          <FileText size={18} className="text-white" />
        </div>
        <span className="text-white font-bold text-lg tracking-tight">
          ResumeAI
        </span>
      </Link>

      <div className="flex items-center gap-3">
        {user && (
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setOpen(!open)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg border border-[#2e3150] bg-[#20243b] hover:bg-[#2a2f4d] text-white transition-all"
            >
              <span className="font-medium">{user.name || user.email}</span>

              <ChevronDown
                size={16}
                className={`transition-transform ${open ? "rotate-180" : ""}`}
              />
            </button>

            {open && (
              <div className="absolute right-0 mt-2 w-40 rounded-lg bg-[#1a1d2e] border border-[#2e3150] shadow-xl">
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
