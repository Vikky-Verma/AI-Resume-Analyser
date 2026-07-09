import Link from "next/link";

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
      <div className="max-w-6xl mx-auto px-6 py-8">

        {/* Top Section */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">

          {/* Left */}
          <div className="text-slate-400 text-sm">
            Designed & Maintained by{" "}
            <span className="font-semibold text-white">
              Vikky Verma
            </span>
          </div>

          {/* Center */}
          <div className="flex items-center gap-8">
            {SOCIALS.map(({ label, href }) => (
              <Link
                key={label}
                href={href}
                target="_blank"
                className="text-slate-400 hover:text-indigo-400 font-medium transition-colors duration-300"
              >
                {label}
              </Link>
            ))}
          </div>

          {/* Empty Right Side (for balance) */}
          <div className="hidden md:block w-40"></div>

        </div>

        {/* Bottom */}
        <div className="mt-8 pt-6 border-t border-[#1e2233] text-center">
          <p className="text-slate-500 text-sm">
            © {new Date().getFullYear()} All Rights Reserved.
          </p>
        </div>

      </div>
    </footer>
  );
};

export default Footer;