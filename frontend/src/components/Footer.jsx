import { FaGithub, FaLinkedin } from "react-icons/fa";

const SOCIALS = [
  {
    icon: FaGithub,
    href: "https://github.com/Vikky-Verma",
    label: "GitHub",
  },
  {
    icon: FaLinkedin,
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

          {/* Left Side */}
          <div className="absolute left-0 hidden md:block">
            <p className="text-sm text-slate-400">
              Designed & Maintained by{" "}
              <span className="font-semibold bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
                Vikky Verma
              </span>
            </p>
          </div>

          {/* Social Icons */}
          <div className="flex items-center gap-5">
            {SOCIALS.map(({ icon: Icon, href, label }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="
                  group
                  flex
                  items-center
                  justify-center
                  w-12
                  h-12
                  rounded-full
                  border
                  border-slate-700
                  bg-slate-900/60
                  text-slate-400
                  transition-all
                  duration-300
                  hover:-translate-y-1
                  hover:border-indigo-500
                  hover:text-white
                  hover:bg-indigo-500/10
                  hover:shadow-[0_0_25px_rgba(99,102,241,0.5)]
                "
              >
                <Icon
                  size={24}
                  className="transition-transform duration-300 group-hover:scale-110"
                />
              </a>
            ))}
          </div>

        </div>

        {/* Mobile Text */}
        <div className="md:hidden mt-6 text-center">
          <p className="text-sm text-slate-400">
            Designed & Maintained by{" "}
            <span className="font-semibold bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
              Vikky Verma
            </span>
          </p>
        </div>

        {/* Bottom */}
        <div className="mt-8 pt-6 border-t border-[#1e2233]">
          <p className="text-center text-sm text-slate-500">
            © {new Date().getFullYear()} All Rights Reserved.
          </p>
        </div>

      </div>
    </footer>
  );
};

export default Footer;