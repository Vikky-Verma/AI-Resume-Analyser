import Link from "next/link";
import { Github, Linkedin } from "lucide-react";

const SOCIALS = [
  {
    icon: Github,
    href: "https://github.com/Vikky-Verma",
    label: "GitHub",
  },
  {
    icon: Linkedin,
    href: "https://www.linkedin.com/in/vikky-verma-924450357/",
    label: "LinkedIn",
  },
];

const Footer = () => {
  return (
    <footer className="border-t border-[#1e2233] bg-[#07090f]">
      <div className="max-w-6xl mx-auto px-6 py-8">

        {/* Top Section */}
        <div className="relative flex items-center justify-center">

          {/* Left */}
          <div className="absolute left-0 hidden md:block">
            <p className="text-sm text-slate-400">
              Designed & Maintained by{" "}
              <span className="font-semibold text-white">
                Vikky Verma
              </span>
            </p>
          </div>

          {/* Social Icons */}
          <div className="flex items-center gap-6">
            {SOCIALS.map(({ icon: Icon, href, label }) => (
              <Link
                key={label}
                href={href}
                target="_blank"
                aria-label={label}
                className="
                  group
                  p-3
                  rounded-full
                  bg-[#111827]
                  border
                  border-[#1f2937]
                  text-slate-400
                  transition-all
                  duration-300
                  hover:text-white
                  hover:border-indigo-500
                  hover:shadow-[0_0_20px_rgba(99,102,241,0.45)]
                  hover:-translate-y-1
                "
              >
                <Icon
                  size={22}
                  className="transition-transform duration-300 group-hover:scale-110"
                />
              </Link>
            ))}
          </div>

        </div>

        {/* Mobile Text */}
        <div className="md:hidden text-center mt-6">
          <p className="text-sm text-slate-400">
            Designed & Maintained by{" "}
            <span className="font-semibold text-white">
              Vikky Verma
            </span>
          </p>
        </div>

        {/* Bottom */}
        <div className="mt-8 pt-6 border-t border-[#1e2233] text-center">
          <p className="text-sm text-slate-500">
            © {new Date().getFullYear()} All Rights Reserved.
          </p>
        </div>

      </div>
    </footer>
  );
};

export default Footer;