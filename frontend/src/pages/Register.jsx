import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../api/axios";
import toast from "react-hot-toast";
import { FileText, User, Mail, Lock, Loader2 } from "lucide-react";
import TiltCard from "../components/effects/TiltCard";
import MagneticButton from "../components/effects/MagneticButton";

const passwordChecks = [
  { label: "At least 8 characters", test: (pw) => pw.length >= 8 },
  { label: "One uppercase letter", test: (pw) => /[A-Z]/.test(pw) },
  { label: "One lowercase letter", test: (pw) => /[a-z]/.test(pw) },
  { label: "One number", test: (pw) => /[0-9]/.test(pw) },
];

const Register = () => {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setFieldErrors({});
    try {
      await API.post("/auth/register", form);
      toast.success("Verification code sent to your email");
      navigate("/verify-otp", { state: { email: form.email } });
    } catch (err) {
      const errors = err.response?.data?.errors;
      if (errors) {
        const grouped = {};
        errors.forEach(({ field, message }) => {
          grouped[field] = grouped[field] ? [...grouped[field], message] : [message];
        });
        setFieldErrors(grouped);
      } else {
        toast.error(err.response?.data?.message || "Registration failed");
      }
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    { key: "name",     type: "text",     icon: User, placeholder: "John Doe",        label: "Full Name" },
    { key: "email",    type: "email",    icon: Mail, placeholder: "you@example.com",  label: "Email" },
    { key: "password", type: "password", icon: Lock, placeholder: "••••••••",         label: "Password" },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10 relative">
      <div className="w-full max-w-md">

        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-sky-400 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-[0_0_24px_rgba(99,102,241,0.45)]">
            <FileText size={26} className="text-white" />
          </div>
          <h1 className="text-2xl font-extrabold text-white">Create account</h1>
          <p className="text-slate-400 text-sm mt-2">Start your placement journey with AlgoVerse</p>
        </div>

        <TiltCard maxTilt={5} className="bg-[#1a1d2e]/80 backdrop-blur-xl border border-[#2e3150] rounded-2xl p-8">
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {fields.map(({ key, type, icon: Icon, placeholder, label }) => (
              <div key={key}>
                <label className="text-xs font-semibold text-slate-400 mb-2 block uppercase tracking-wide">
                  {label}
                </label>
                <div className="relative">
                  <Icon size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type={type}
                    placeholder={placeholder}
                    value={form[key]}
                    onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                    className="w-full bg-[#242840] border border-[#2e3150] rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-slate-500 outline-none focus:border-indigo-500 transition-colors"
                    required
                  />
                </div>

                {key === "password" && (
                  <ul className="mt-1.5 space-y-0.5">
                    {passwordChecks.map(({ label: checkLabel, test }) => {
                      const passed = test(form.password);
                      return (
                        <li
                          key={checkLabel}
                          className={`text-xs ${passed ? "text-emerald-400" : "text-slate-500"}`}
                        >
                          {passed ? "✓" : "○"} {checkLabel}
                        </li>
                      );
                    })}
                  </ul>
                )}

                {fieldErrors[key]?.map((msg) => (
                  <p key={msg} className="text-red-400 text-xs mt-1">{msg}</p>
                ))}
              </div>
            ))}

            <MagneticButton
              as="button"
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 transition-all mt-1"
            >
              {loading ? <><Loader2 size={16} className="animate-spin" /> Creating...</> : "Create Account"}
            </MagneticButton>
          </form>
        </TiltCard>

        <p className="text-center mt-5 text-sm text-slate-400">
          Already have an account?{" "}
          <Link to="/login" className="text-indigo-400 font-semibold hover:text-indigo-300 transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;