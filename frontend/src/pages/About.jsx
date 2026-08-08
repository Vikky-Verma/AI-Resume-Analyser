import Footer from "../components/Footer";
import TiltCard from "../components/effects/TiltCard";
import {
  Info,
  User,
  FileText,
  Mic,
  Trophy,
  Sparkles,
  Layers,
  KanbanSquare,
  Layout as LayoutIcon,
  Flame,
  Compass,
  BadgeCheck,
  Rocket,
} from "lucide-react";

// lucide-react's pinned version here doesn't ship "Github"/"Linkedin" brand
// icons — small inline marks with the same size/className API as any
// lucide icon, used wherever <Icon size={..} /> is expected.
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

const LinkedinIcon = ({ size = 18, className = "" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
  >
    <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.02-3.03-1.85-3.03-1.85 0-2.14 1.45-2.14 2.94v5.66H9.36V9h3.41v1.56h.05c.47-.9 1.63-1.85 3.36-1.85 3.6 0 4.27 2.37 4.27 5.45v6.29ZM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12ZM7.12 20.45H3.56V9h3.56v11.45Z" />
  </svg>
);

// Reusable section header — icon chip + eyebrow + heading, used to give
// every section on this page the same professional, consistent structure.
const Section = ({ icon: Icon, eyebrow, title, children }) => (
  <div className="mt-16">
    <div className="flex items-center gap-2 mb-3">
      <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
        <Icon size={15} className="text-indigo-400" />
      </div>
      <p className="text-xs font-bold uppercase tracking-wider text-indigo-400">{eyebrow}</p>
    </div>
    <h2 className="text-xl sm:text-2xl font-extrabold text-white mb-3">{title}</h2>
    {children}
  </div>
);

const FACTS = [
  { value: "Solo", label: "Built end-to-end" },
  { value: "PERN + Prisma", label: "Core stack" },
  { value: "Pre-final year", label: "B.Tech, IT" },
  { value: "Open source", label: "Code on GitHub" },
];

const BENEFITS = [
  {
    icon: FileText,
    title: "Know exactly where your resume stands",
    desc: "Instead of guessing whether a recruiter's ATS will even open your resume, you get a real score and the specific lines to fix.",
  },
  {
    icon: Mic,
    title: "Get the nerves out before it counts",
    desc: "AI mock interviews built around the actual company and role you're applying for, so the first time you feel that pressure isn't in the real interview.",
  },
  {
    icon: KanbanSquare,
    title: "Stop losing track of applications",
    desc: "One board for every application's status, instead of a scattered spreadsheet or a dozen forgotten tabs.",
  },
  {
    icon: Trophy,
    title: "Build a habit you can actually see",
    desc: "A visible streak turns 'I should prep today' into something you track, instead of something you keep putting off.",
  },
];

const FEATURES = [
  {
    icon: FileText,
    title: "AI resume analysis",
    desc: "ATS scoring, skill-gap detection, and suggestions tied to actual lines in your resume — not generic tips.",
  },
  {
    icon: Mic,
    title: "AI mock interviews",
    desc: "Company and role-specific rounds with scored feedback, so the pressure feels real before it actually is.",
  },
  {
    icon: LayoutIcon,
    title: "Resume & portfolio builder",
    desc: "Multiple resume templates plus a public, shareable portfolio page recruiters can actually open.",
  },
  {
    icon: BadgeCheck,
    title: "Company prep banks",
    desc: "Curated question sets per company, with per-user progress tracked so revision is targeted, not random.",
  },
  {
    icon: KanbanSquare,
    title: "Internship tracker",
    desc: "A Kanban board for applications — applied, OA, interview, offer — so nothing falls through the cracks.",
  },
  {
    icon: Sparkles,
    title: "Progress & streaks",
    desc: "A visible daily streak that keeps the habit honest instead of just being a motivational sticker.",
  },
];

const TECH_STACK = {
  Frontend: ["React 19", "Vite", "Tailwind CSS", "Framer Motion", "React Router v7", "Recharts"],
  Backend: ["Node.js", "Express", "PostgreSQL (Neon)", "Prisma ORM", "JWT Auth", "Zod"],
  "AI & infra": ["Cloudflare Workers AI", "Cloudinary", "Brevo (email)", "PDF/DOCX parsing"],
};

const About = () => {
  return (
    <div className="min-h-screen relative">
      <div className="relative">

        <div className="max-w-4xl mx-auto px-6 py-16">

          {/* Hero */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-full mb-5">
            <Info size={13} className="text-indigo-400" />
            <span className="text-indigo-300 text-xs font-semibold tracking-wide">
              About me
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight tracking-tight max-w-2xl">
            Hi, I'm Vikky Verma — I built AlgoVerse myself.
          </h1>
          <p className="text-slate-400 text-sm sm:text-base mt-4 max-w-2xl leading-relaxed">
            I'm a pre-final year B.Tech IT student, and this isn't a
            company page — it's my own project, designed, built, and
            shipped solo.
          </p>

          {/* Facts strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-10">
            {FACTS.map((s) => (
              <TiltCard
                key={s.label}
                maxTilt={5}
                className="bg-[#171a2c]/80 backdrop-blur-xl border border-[#2e3150] rounded-2xl p-5 text-center"
              >
                <p className="text-lg sm:text-xl font-extrabold text-white">{s.value}</p>
                <p className="text-[11px] text-slate-500 mt-1">{s.label}</p>
              </TiltCard>
            ))}
          </div>

          {/* What is AlgoVerse */}
          <Section icon={Compass} eyebrow="The Project" title="What is AlgoVerse?">
            <p className="text-slate-400 text-sm leading-relaxed max-w-2xl">
              It's a full placement-prep platform: it analyzes your resume
              against real ATS scoring logic, runs AI-driven mock interviews
              that adapt to the company and role you're targeting, tracks
              your applications on a Kanban board, and keeps a visible
              streak so prep actually becomes a habit instead of a
              once-a-week panic.
            </p>
          </Section>

          {/* Why I built it */}
          <Section icon={Flame} eyebrow="The Motivation" title="Why I actually built this">
            <p className="text-slate-400 text-sm leading-relaxed max-w-2xl">
              Going into my pre-final year, I kept hitting the same wall: I
              knew the material, but the moment someone else was watching —
              a mock panel, a timed round, an actual interviewer — I froze.
              Reading solutions wasn't the gap. Reps under real pressure
              were. So instead of just practicing on scattered tools, I
              decided to build the one tool that combined resume feedback,
              interview pressure-testing, and application tracking in one
              place — partly to fix my own prep, partly because I wanted to
              prove to myself I could ship something end-to-end, alone.
            </p>
          </Section>

          {/* Why the name */}
          <Section icon={Sparkles} eyebrow="The Name" title={'Why "AlgoVerse"?'}>
            <p className="text-slate-400 text-sm leading-relaxed max-w-2xl">
              "Algo" for algorithms and the technical grind every placement
              season comes down to — DSA, system design, the questions that
              actually get asked. "Verse" for universe: the idea that
              placement prep isn't one thing, it's an entire world of resume
              work, interview reps, applications, and consistency all at
              once. Put together, it's meant to be the one place that
              covers that whole world instead of another single-purpose
              tool you have to combine with five others.
            </p>
          </Section>

          {/* How it helps the user */}
          <Section icon={Rocket} eyebrow="For You" title="How this actually helps you">
            <div className="grid sm:grid-cols-2 gap-4">
              {BENEFITS.map(({ icon: Icon, title, desc }) => (
                <TiltCard
                  key={title}
                  maxTilt={5}
                  className="bg-[#171a2c]/80 backdrop-blur-xl border border-[#2e3150] rounded-2xl p-5"
                >
                  <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-3">
                    <Icon size={17} className="text-indigo-400" />
                  </div>
                  <p className="text-white font-bold text-sm mb-1.5">{title}</p>
                  <p className="text-xs text-slate-500 leading-relaxed">{desc}</p>
                </TiltCard>
              ))}
            </div>
          </Section>

          {/* Tech stack */}
          <Section icon={Layers} eyebrow="Under The Hood" title="Tech stack">
            <p className="text-slate-500 text-xs mb-5 max-w-2xl">
              Everything here is hand-built with a fairly standard modern
              stack — no low-code, no templates.
            </p>
            <div className="grid sm:grid-cols-3 gap-4">
              {Object.entries(TECH_STACK).map(([group, items]) => (
                <TiltCard
                  key={group}
                  maxTilt={5}
                  className="bg-[#171a2c]/80 backdrop-blur-xl border border-[#2e3150] rounded-2xl p-5"
                >
                  <p className="text-xs font-bold text-slate-300 uppercase tracking-wide mb-3">{group}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {items.map((t) => (
                      <span
                        key={t}
                        className="text-[11px] font-medium text-slate-400 bg-[#0f1120] border border-[#2e3150] rounded-full px-2.5 py-1"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </TiltCard>
              ))}
            </div>
          </Section>

          {/* Features */}
          <Section icon={BadgeCheck} eyebrow="What's Inside" title="Everything the platform does">
            <p className="text-slate-500 text-xs mb-5 max-w-2xl">
              Six pieces, all built to work together rather than as
              standalone gimmicks.
            </p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {FEATURES.map(({ icon: Icon, title, desc }) => (
                <TiltCard
                  key={title}
                  maxTilt={5}
                  className="bg-[#171a2c]/80 backdrop-blur-xl border border-[#2e3150] rounded-2xl p-5"
                >
                  <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-3">
                    <Icon size={17} className="text-indigo-400" />
                  </div>
                  <p className="text-white font-bold text-sm mb-1.5">{title}</p>
                  <p className="text-xs text-slate-500 leading-relaxed">{desc}</p>
                </TiltCard>
              ))}
            </div>
          </Section>

          {/* Who built this */}
          <Section icon={User} eyebrow="The Developer" title="Who built this">
            <TiltCard maxTilt={4} className="bg-[#171a2c]/80 backdrop-blur-xl border border-[#2e3150] rounded-2xl p-6 flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                <User size={18} className="text-emerald-400" />
              </div>
              <div>
                <p className="text-white font-bold text-sm mb-1">
                  Built by one developer, in the open — Vikky Verma
                </p>
                <p className="text-xs text-slate-500 leading-relaxed">
                  No team, no company — just one developer shipping this on
                  my own time alongside coursework, as a pre-final year
                  B.Tech IT student. If you spot a bug, have an idea, or
                  just want to talk about how it's built, I'd genuinely
                  like to hear from you.
                </p>

                <div className="flex flex-wrap items-center gap-4 mt-4">
                  <a
                    href="https://github.com/Vikky-Verma"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-indigo-300 font-semibold transition-colors"
                  >
                    <GithubIcon size={14} />
                    Source on GitHub
                  </a>
                  <a
                    href="https://www.linkedin.com/in/vikky-verma-924450357/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-indigo-300 font-semibold transition-colors"
                  >
                    <LinkedinIcon size={14} />
                    LinkedIn
                  </a>
                </div>
              </div>
            </TiltCard>
          </Section>

        </div>

        <Footer />
      </div>
    </div>
  );
};

export default About;