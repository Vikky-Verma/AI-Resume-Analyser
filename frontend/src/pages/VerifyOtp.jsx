import { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import API from "../api/axios";
import toast from "react-hot-toast";
import { MailCheck, Loader2 } from "lucide-react";

const VerifyOtp = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email;

  const [digits, setDigits] = useState(new Array(6).fill(""));
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(45);
  const inputsRef = useRef([]);

  useEffect(() => {
    if (!email) navigate("/register", { replace: true });
  }, [email, navigate]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const handleChange = (value, idx) => {
    if (!/^[0-9]?$/.test(value)) return;
    const next = [...digits];
    next[idx] = value;
    setDigits(next);
    if (value && idx < 5) inputsRef.current[idx + 1]?.focus();
  };

  const handleKeyDown = (e, idx) => {
    if (e.key === "Backspace" && !digits[idx] && idx > 0) {
      inputsRef.current[idx - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    const pasted = e.clipboardData.getData("text").trim().slice(0, 6);
    if (!/^[0-9]+$/.test(pasted)) return;
    e.preventDefault();
    const next = pasted.split("").concat(new Array(6).fill("")).slice(0, 6);
    setDigits(next);
    inputsRef.current[Math.min(pasted.length, 5)]?.focus();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const otp = digits.join("");
    if (otp.length !== 6) {
      toast.error("Enter all 6 digits");
      return;
    }
    setLoading(true);
    try {
      await API.post("/auth/register/verify-otp", { email, otp });
      toast.success("Email verified! Please login.");
      navigate("/login");
    } catch (err) {
      toast.error(err.response?.data?.message || "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    try {
      await API.post("/auth/register/resend-otp", { email });
      toast.success("New code sent");
      setCooldown(45);
      setDigits(new Array(6).fill(""));
      inputsRef.current[0]?.focus();
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not resend code");
    } finally {
      setResending(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-[#0f1117] px-4"
      style={{ background: "radial-gradient(ellipse at 50% 0%, #1e1b4b 0%, #0f1117 60%)" }}
    >
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-indigo-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <MailCheck size={26} className="text-white" />
          </div>
          <h1 className="text-2xl font-extrabold text-white">Check your email</h1>
          <p className="text-slate-400 text-sm mt-2">
            We sent a 6-digit code to <span className="text-slate-200">{email}</span>
          </p>
        </div>

        <div className="bg-[#1a1d2e] border border-[#2e3150] rounded-2xl p-8">
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <div className="flex justify-between gap-2" onPaste={handlePaste}>
              {digits.map((d, idx) => (
                <input
                  key={idx}
                  ref={(el) => (inputsRef.current[idx] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={d}
                  onChange={(e) => handleChange(e.target.value, idx)}
                  onKeyDown={(e) => handleKeyDown(e, idx)}
                  className="w-full aspect-square text-center text-xl font-bold bg-[#242840] border border-[#2e3150] rounded-xl text-white outline-none focus:border-indigo-500 transition-colors"
                />
              ))}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 transition-all"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" /> Verifying...
                </>
              ) : (
                "Verify Email"
              )}
            </button>
          </form>

          <div className="text-center mt-5">
            {cooldown > 0 ? (
              <p className="text-xs text-slate-500">Resend code in {cooldown}s</p>
            ) : (
              <button
                onClick={handleResend}
                disabled={resending}
                className="text-xs text-indigo-400 font-semibold hover:text-indigo-300 disabled:opacity-50 transition-colors"
              >
                {resending ? "Sending..." : "Resend code"}
              </button>
            )}
          </div>
        </div>

        <p className="text-center mt-5 text-sm text-slate-400">
          Wrong email?{" "}
          <Link to="/register" className="text-indigo-400 font-semibold hover:text-indigo-300 transition-colors">
            Go back
          </Link>
        </p>
      </div>
    </div>
  );
};

export default VerifyOtp;