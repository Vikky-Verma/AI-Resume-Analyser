import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import API from "../api/axios";
import toast from "react-hot-toast";
import { FileText, Mail, Lock, Loader2 } from "lucide-react";
import TiltCard from "../components/effects/TiltCard";
import MagneticButton from "../components/effects/MagneticButton";

const Login = () => {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);

  try {
    const { data } = await API.post("/auth/login", form);

    console.log("Login Response:", data);

    login(data.user, data.token);

    toast.success("Welcome back!");
    navigate("/home");
  } catch (err) {
    console.error(err);
    toast.error(err.response?.data?.message || "Login failed");
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-sky-400 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-[0_0_24px_rgba(99,102,241,0.45)]">
            <FileText size={26} className="text-white" />
          </div>
          <h1 className="text-2xl font-extrabold text-white">Welcome back</h1>
          <p className="text-slate-400 text-sm mt-2">Sign in to your AlgoVerse account</p>
        </div>

        {/* Card */}
        <TiltCard maxTilt={5} className="bg-[#1a1d2e]/80 backdrop-blur-xl border border-[#2e3150] rounded-2xl p-8">
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div>
              <label className="text-xs font-semibold text-slate-400 mb-2 block uppercase tracking-wide">
                Email
              </label>
              <div className="relative">
                <Mail size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full bg-[#242840] border border-[#2e3150] rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-slate-500 outline-none focus:border-indigo-500 transition-colors"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-400 mb-2 block uppercase tracking-wide">
                Password
              </label>
              <div className="relative">
                <Lock size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="w-full bg-[#242840] border border-[#2e3150] rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-slate-500 outline-none focus:border-indigo-500 transition-colors"
                  required
                />
              </div>
            </div>

            <MagneticButton
              as="button"
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 transition-all mt-1"
            >
              {loading ? <><Loader2 size={16} className="animate-spin" /> Signing in...</> : "Sign In"}
            </MagneticButton>
          </form>
        </TiltCard>

        <p className="text-center mt-5 text-sm text-slate-400">
          Don't have an account?{" "}
          <Link to="/register" className="text-indigo-400 font-semibold hover:text-indigo-300 transition-colors">
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;