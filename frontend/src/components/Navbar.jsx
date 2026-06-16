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
        <span className="text-white font-bold text-lg tracking-tight">ResumeAI</span>
      </Link>

      <div className="flex items-center gap-3">
        {user && (
          <span className="text-slate-400 text-sm hidden sm:block">
            {user.name || user.email}
          </span>
        )}
        <Link
          to="/dashboard"
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-slate-300 border border-[#2e3150] hover:bg-[#242840] transition-all"
        >
          <LayoutDashboard size={15} />
          <span className="hidden sm:block">Dashboard</span>
        </Link>
        <button
          onClick={() => { logout(); navigate("/login"); }}
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-red-400 bg-red-950/40 border border-red-900/40 hover:bg-red-900/40 transition-all"
        >
          <LogOut size={15} />
          <span className="hidden sm:block">Logout</span>
        </button>
      </div>
    </nav>
  );
};

export default Navbar;