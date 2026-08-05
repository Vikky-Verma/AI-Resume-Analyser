import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { FileText } from "lucide-react";

const MotionLink = motion(Link);

// Lightweight header shown to logged-out visitors — used on the Landing
// page and on any public page (About, Contact) reached without being
// signed in. Deliberately does NOT include the full app navbar (Home,
// Prepare, Track, Pricing dropdowns) since those lead to protected routes.
const PublicNavbar = () => {
  const { user } = useAuth();

  return (
    <nav className="px-6 h-16 flex items-center justify-between border-b border-[#1e2233] max-w-6xl mx-auto relative z-10">
      <Link to="/" className="flex items-center gap-3 no-underline shrink-0">
        <div className="w-9 h-9 bg-indigo-500 rounded-xl flex items-center justify-center">
          <FileText size={18} className="text-white" />
        </div>
        <span className="text-white font-bold text-lg tracking-tight">
          AlgoVerse
        </span>
      </Link>

      <div className="hidden sm:flex items-center gap-6">
        <Link
          to="/about"
          className="text-sm font-semibold text-slate-300 hover:text-white transition-colors"
        >
          About
        </Link>
        <Link
          to="/contact"
          className="text-sm font-semibold text-slate-300 hover:text-white transition-colors"
        >
          Contact
        </Link>
      </div>

      <div className="flex items-center gap-3">
        {user ? (
          <MotionLink
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            to="/home"
            className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-semibold rounded-xl transition-colors"
          >
            Go to Dashboard
          </MotionLink>
        ) : (
          <>
            <Link
              to="/login"
              className="px-4 py-2 text-slate-300 hover:text-white text-sm font-semibold transition-colors"
            >
              Login
            </Link>
            <MotionLink
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              to="/register"
              className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-semibold rounded-xl transition-colors"
            >
              Get Started
            </MotionLink>
          </>
        )}
      </div>
    </nav>
  );
};

export default PublicNavbar;