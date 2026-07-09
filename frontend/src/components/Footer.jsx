import { FileText } from "lucide-react";

const SOCIALS = [
  {
    label: "GitHub",
    href: "https://github.com/Vikky-Verma",
  },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/vikky-verma-924450357/",
  },
];

const Footer = () => {
  return (
    <footer className="border-t border-[#1e2233] bg-[#07090f]">
      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center">
              <FileText size={15} className="text-white" />
            </div>
            <span className="text-white font-bold text-sm tracking-tight">
              ResumeAI
            </span>
          </div>

          <div className="flex items-center gap-6">
            {SOCIALS.map(({ label, href }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-400 hover:text-white text-sm font-semibold transition-colors"
              >
                {label}
              </a>
            ))}
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-[#1e2233] flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-slate-500 text-xs">
            © {new Date().getFullYear()} ResumeAI. All rights reserved.
          </p>
          <p className="text-slate-500 text-xs">
            Developed and maintained by{" "}
            <span className="text-slate-300 font-semibold">Vikky Verma</span>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;