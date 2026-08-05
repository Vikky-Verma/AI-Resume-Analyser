import { useState } from "react";
import toast from "react-hot-toast";
import Footer from "../components/Footer";
import API from "../api/axios";
import { Mail, MessageCircle, Send, Loader2 } from "lucide-react";

// lucide-react's pinned version here doesn't ship a "Github" brand icon,
// so this is a small inline mark instead — same size/className API as
// any lucide icon, drops in wherever <Icon size={16} .../> is used.
const GithubIcon = ({ size = 18, className = "" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
  >
    <path d="M12 .5C5.73.5.5 5.73.5 12c0 5.08 3.29 9.39 7.86 10.91.57.1.78-.25.78-.55 0-.27-.01-1.17-.02-2.12-3.2.7-3.88-1.36-3.88-1.36-.53-1.34-1.29-1.7-1.29-1.7-1.05-.72.08-.71.08-.71 1.17.08 1.78 1.2 1.78 1.2 1.03 1.77 2.71 1.26 3.37.96.1-.75.4-1.26.73-1.55-2.55-.29-5.23-1.28-5.23-5.68 0-1.25.45-2.28 1.19-3.08-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11.05 11.05 0 0 1 5.79 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.8 1.19 1.83 1.19 3.08 0 4.41-2.69 5.38-5.25 5.67.41.36.78 1.06.78 2.14 0 1.55-.01 2.79-.01 3.17 0 .3.2.66.79.55A11.5 11.5 0 0 0 23.5 12C23.5 5.73 18.27.5 12 .5Z" />
  </svg>
);

const METHODS = [
  {
    icon: Mail,
    title: "Email",
    detail: "vikkyverma7054@gmail.com",
  },
  {
    icon: MessageCircle,
    title: "Response time",
    detail: "Usually within 1–2 business days",
  },
  {
    icon: GithubIcon,
    title: "Found a bug?",
    detail: "Open an issue on GitHub",
  },
];

const Contact = () => {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [sending, setSending] = useState(false);

  const handleChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    try {
      const { data } = await API.post("/contact", form);
      setForm({ name: "", email: "", message: "" });
      toast.success(data?.message || "Message sent — we'll get back to you shortly.");
    } catch (err) {
      const apiMessage =
        err?.response?.data?.errors?.[0]?.message ||
        err?.response?.data?.message;
      toast.error(apiMessage || "Couldn't send your message. Please try again.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#07090f]">
      <div className="pointer-events-none fixed -top-40 -left-40 w-[32rem] h-[32rem] bg-indigo-500/10 rounded-full blur-[120px]" />
      <div className="pointer-events-none fixed top-40 -right-32 w-[28rem] h-[28rem] bg-teal-500/10 rounded-full blur-[120px]" />

      <div className="relative">

        <div className="max-w-4xl mx-auto px-6 py-16">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-full mb-5">
            <Mail size={13} className="text-indigo-400" />
            <span className="text-indigo-300 text-xs font-semibold tracking-wide">
              Contact us
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight tracking-tight">
            Get in touch.
          </h1>
          <p className="text-slate-400 text-sm sm:text-base mt-4 max-w-xl leading-relaxed">
            Questions about your account, a company prep request, or
            feedback on the platform — send it over.
          </p>

          <div className="mt-10 grid md:grid-cols-[1fr_1.3fr] gap-8">
            {/* Contact methods */}
            <div className="flex flex-col gap-3">
              {METHODS.map(({ icon: Icon, title, detail }) => (
                <div
                  key={title}
                  className="flex items-start gap-3 bg-[#171a2c] border border-[#2e3150] rounded-2xl p-4"
                >
                  <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0">
                    <Icon size={16} className="text-indigo-400" />
                  </div>
                  <div>
                    <p className="text-white font-bold text-sm">{title}</p>
                    {title === "Email" ? (
                      <a
                        href={`mailto:${detail}`}
                        className="text-xs text-slate-500 mt-0.5 hover:text-indigo-300 transition-colors block"
                      >
                        {detail}
                      </a>
                    ) : (
                      <p className="text-xs text-slate-500 mt-0.5">{detail}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Form */}
            <form
              onSubmit={handleSubmit}
              className="bg-[#171a2c] border border-[#2e3150] rounded-2xl p-6"
            >
              <div className="mb-4">
                <label className="block text-[11px] font-semibold tracking-wide uppercase text-slate-500 mb-2">
                  Name
                </label>
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  type="text"
                  placeholder="Your name"
                  className="w-full bg-[#0f1120] border border-[#2e3150] rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500/50"
                />
              </div>
              <div className="mb-4">
                <label className="block text-[11px] font-semibold tracking-wide uppercase text-slate-500 mb-2">
                  Email
                </label>
                <input
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  type="email"
                  placeholder="you@email.com"
                  className="w-full bg-[#0f1120] border border-[#2e3150] rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500/50"
                />
              </div>
              <div className="mb-5">
                <label className="block text-[11px] font-semibold tracking-wide uppercase text-slate-500 mb-2">
                  Message
                </label>
                <textarea
                  name="message"
                  value={form.message}
                  onChange={handleChange}
                  required
                  minLength={10}
                  placeholder="What's on your mind?"
                  rows={5}
                  className="w-full bg-[#0f1120] border border-[#2e3150] rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500/50 resize-none"
                />
              </div>
              <button
                type="submit"
                disabled={sending}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-60 text-white text-sm font-semibold rounded-xl transition-colors"
              >
                {sending ? (
                  <Loader2 size={15} className="animate-spin" />
                ) : (
                  <Send size={15} />
                )}
                {sending ? "Sending…" : "Send message"}
              </button>
            </form>
          </div>
        </div>

        <Footer />
      </div>
    </div>
  );
};

export default Contact;