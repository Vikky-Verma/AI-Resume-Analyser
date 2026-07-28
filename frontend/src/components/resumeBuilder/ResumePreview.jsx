import { Mail, Phone, MapPin, Link2, Code2, Globe } from "lucide-react";
import { getTemplate } from "../../data/resumeTemplates";

const fmtRange = (start, end, current) =>
  [start, current ? "Present" : end].filter(Boolean).join(" — ");

const ContactRow = ({ personalInfo, dense }) => {
  const items = [
    personalInfo.location && { icon: MapPin, text: personalInfo.location },
    personalInfo.email && { icon: Mail, text: personalInfo.email },
    personalInfo.phone && { icon: Phone, text: personalInfo.phone },
    personalInfo.linkedin && { icon: Link2, text: personalInfo.linkedin },
    personalInfo.github && { icon: Code2, text: personalInfo.github },
    personalInfo.website && { icon: Globe, text: personalInfo.website },
  ].filter(Boolean);

  return (
    <div className={`flex flex-wrap items-center gap-x-3 gap-y-1 ${dense ? "text-[10px]" : "text-[11px]"} text-slate-600`}>
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-1">
          <item.icon size={dense ? 10 : 11} />
          {item.text}
        </span>
      ))}
    </div>
  );
};

const SectionHeading = ({ children, accent, dense }) => (
  <h3
    className={`font-bold uppercase tracking-wide ${dense ? "text-[10.5px] mb-1.5 mt-3" : "text-[12px] mb-2 mt-4"} pb-1 border-b-2`}
    style={{ color: accent, borderColor: accent }}
  >
    {children}
  </h3>
);

const ExperienceBlock = ({ experience, dense }) => (
  <div className="space-y-2.5">
    {experience.map((exp) => (
      <div key={exp.id}>
        <div className="flex items-baseline justify-between gap-2">
          <p className={`font-semibold text-slate-900 ${dense ? "text-[11.5px]" : "text-[13px]"}`}>
            {exp.role || "Role"} {exp.company ? `· ${exp.company}` : ""}
          </p>
          <span className={`shrink-0 text-slate-500 ${dense ? "text-[9.5px]" : "text-[10.5px]"}`}>
            {fmtRange(exp.startDate, exp.endDate, exp.current)}
          </span>
        </div>
        {exp.location && (
          <p className={`text-slate-500 ${dense ? "text-[9.5px]" : "text-[10.5px]"}`}>{exp.location}</p>
        )}
        {exp.bullets?.filter(Boolean).length > 0 && (
          <ul className={`list-disc list-outside ml-4 mt-1 space-y-0.5 text-slate-700 ${dense ? "text-[10.5px]" : "text-[11.5px]"}`}>
            {exp.bullets.filter(Boolean).map((b, i) => (
              <li key={i}>{b}</li>
            ))}
          </ul>
        )}
      </div>
    ))}
  </div>
);

const ProjectsBlock = ({ projects, dense }) => (
  <div className="space-y-2.5">
    {projects.map((p) => (
      <div key={p.id}>
        <div className="flex items-baseline justify-between gap-2">
          <p className={`font-semibold text-slate-900 ${dense ? "text-[11.5px]" : "text-[13px]"}`}>
            {p.name || "Project"}
          </p>
          {(p.link || p.github) && (
            <span className={`shrink-0 text-slate-500 ${dense ? "text-[9.5px]" : "text-[10.5px]"}`}>
              {p.link || p.github}
            </span>
          )}
        </div>
        {p.techStack?.length > 0 && (
          <p className={`text-slate-500 italic ${dense ? "text-[9.5px]" : "text-[10.5px]"}`}>
            {p.techStack.join(" · ")}
          </p>
        )}
        {p.description && (
          <p className={`text-slate-700 mt-0.5 ${dense ? "text-[10.5px]" : "text-[11.5px]"}`}>{p.description}</p>
        )}
        {p.bullets?.filter(Boolean).length > 0 && (
          <ul className={`list-disc list-outside ml-4 mt-1 space-y-0.5 text-slate-700 ${dense ? "text-[10.5px]" : "text-[11.5px]"}`}>
            {p.bullets.filter(Boolean).map((b, i) => (
              <li key={i}>{b}</li>
            ))}
          </ul>
        )}
      </div>
    ))}
  </div>
);

const EducationBlock = ({ education, dense }) => (
  <div className="space-y-2">
    {education.map((ed) => (
      <div key={ed.id}>
        <div className="flex items-baseline justify-between gap-2">
          <p className={`font-semibold text-slate-900 ${dense ? "text-[11.5px]" : "text-[13px]"}`}>
            {ed.school || "School"}
          </p>
          <span className={`shrink-0 text-slate-500 ${dense ? "text-[9.5px]" : "text-[10.5px]"}`}>
            {fmtRange(ed.startDate, ed.endDate)}
          </span>
        </div>
        <p className={`text-slate-600 ${dense ? "text-[10px]" : "text-[11px]"}`}>
          {[ed.degree, ed.field].filter(Boolean).join(", ")}
          {ed.gpa ? ` · GPA: ${ed.gpa}` : ""}
        </p>
      </div>
    ))}
  </div>
);

const SkillsBlock = ({ skills, dense, sidebar }) => (
  <div className={sidebar ? "space-y-2" : "space-y-1.5"}>
    {skills.map((group) => (
      <div key={group.id}>
        {group.category && (
          <p className={`font-semibold text-slate-800 ${dense ? "text-[10px]" : "text-[11px]"}`}>{group.category}</p>
        )}
        <p className={`text-slate-700 ${dense ? "text-[10px]" : "text-[11px]"}`}>
          {(group.items || []).join(sidebar ? ", " : " · ")}
        </p>
      </div>
    ))}
  </div>
);

const AchievementsBlock = ({ achievements, dense }) => (
  <ul className={`list-disc list-outside ml-4 space-y-0.5 text-slate-700 ${dense ? "text-[10.5px]" : "text-[11.5px]"}`}>
    {achievements.filter((a) => a.text).map((a) => (
      <li key={a.id}>{a.text}</li>
    ))}
  </ul>
);

const CertificationsBlock = ({ certifications, dense, sidebar }) => (
  <div className={sidebar ? "space-y-1.5" : "space-y-1"}>
    {certifications.map((c) => (
      <div key={c.id} className={`text-slate-700 ${dense ? "text-[10px]" : "text-[11px]"}`}>
        <p className="font-medium text-slate-800">{c.name}</p>
        <p className="text-slate-500">{[c.issuer, c.date].filter(Boolean).join(" · ")}</p>
      </div>
    ))}
  </div>
);

const ResumePreview = ({ resume }) => {
  const template = getTemplate(resume.templateId);
  const dense = template.layout === "single-column-dense";
  const sidebar = template.layout === "sidebar";
  const accent = template.accent;
  const { personalInfo = {} } = resume;

  const hasExperience = resume.experience?.length > 0;
  const hasProjects = resume.projects?.length > 0;
  const hasEducation = resume.education?.length > 0;
  const hasSkills = resume.skills?.length > 0;
  const hasAchievements = resume.achievements?.some((a) => a.text);
  const hasCertifications = resume.certifications?.length > 0;

  const Header = () => (
    <div className={sidebar ? "" : "text-center mb-1"} style={sidebar ? { color: "white" } : {}}>
      <h1 className={`font-bold ${dense ? "text-xl" : "text-2xl"}`} style={{ color: sidebar ? "white" : "#0f172a" }}>
        {personalInfo.fullName || "Your Name"}
      </h1>
      {personalInfo.role && (
        <p className={`${dense ? "text-xs" : "text-sm"} font-medium mt-0.5`} style={{ color: sidebar ? "rgba(255,255,255,0.85)" : accent }}>
          {personalInfo.role}
        </p>
      )}
    </div>
  );

  if (sidebar) {
    return (
      <div id="resume-to-print" className="bg-white text-slate-900 shadow-xl mx-auto" style={{ width: "794px", minHeight: "1123px" }}>
        <div className="flex">
          <div className="w-[240px] shrink-0 p-6 space-y-4" style={{ backgroundColor: accent }}>
            <Header />
            <div style={{ color: "white" }}>
              <ContactRow personalInfo={personalInfo} dense={dense} />
            </div>
            {hasSkills && (
              <div>
                <h3 className="font-bold uppercase tracking-wide text-[11px] mb-1.5 pb-1 border-b border-white/40" style={{ color: "white" }}>
                  Skills
                </h3>
                <div style={{ color: "rgba(255,255,255,0.9)" }}>
                  <SkillsBlock skills={resume.skills} dense={dense} sidebar />
                </div>
              </div>
            )}
            {hasCertifications && (
              <div>
                <h3 className="font-bold uppercase tracking-wide text-[11px] mb-1.5 pb-1 border-b border-white/40" style={{ color: "white" }}>
                  Certifications
                </h3>
                <div style={{ color: "rgba(255,255,255,0.9)" }}>
                  <CertificationsBlock certifications={resume.certifications} dense={dense} sidebar />
                </div>
              </div>
            )}
            {hasEducation && (
              <div>
                <h3 className="font-bold uppercase tracking-wide text-[11px] mb-1.5 pb-1 border-b border-white/40" style={{ color: "white" }}>
                  Education
                </h3>
                <div style={{ color: "rgba(255,255,255,0.9)" }}>
                  <div className="space-y-2">
                    {resume.education.map((ed) => (
                      <div key={ed.id} className="text-[10px]">
                        <p className="font-semibold">{ed.school}</p>
                        <p>{[ed.degree, ed.field].filter(Boolean).join(", ")}</p>
                        <p className="opacity-80">{fmtRange(ed.startDate, ed.endDate)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex-1 p-6">
            {resume.summary && (
              <div>
                <SectionHeading accent={accent} dense={dense}>Summary</SectionHeading>
                <p className={`text-slate-700 ${dense ? "text-[10.5px]" : "text-[11.5px]"}`}>{resume.summary}</p>
              </div>
            )}
            {hasExperience && (
              <div>
                <SectionHeading accent={accent} dense={dense}>Experience</SectionHeading>
                <ExperienceBlock experience={resume.experience} dense={dense} />
              </div>
            )}
            {hasProjects && (
              <div>
                <SectionHeading accent={accent} dense={dense}>Projects</SectionHeading>
                <ProjectsBlock projects={resume.projects} dense={dense} />
              </div>
            )}
            {hasAchievements && (
              <div>
                <SectionHeading accent={accent} dense={dense}>Achievements</SectionHeading>
                <AchievementsBlock achievements={resume.achievements} dense={dense} />
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // single-column / single-column-dense
  return (
    <div
      id="resume-to-print"
      className={`bg-white text-slate-900 shadow-xl mx-auto ${dense ? "p-7" : "p-9"}`}
      style={{ width: "794px", minHeight: "1123px" }}
    >
      <Header />
      <div className="flex justify-center mt-1.5">
        <ContactRow personalInfo={personalInfo} dense={dense} />
      </div>

      {resume.summary && (
        <div>
          <SectionHeading accent={accent} dense={dense}>Summary</SectionHeading>
          <p className={`text-slate-700 ${dense ? "text-[10.5px]" : "text-[11.5px]"}`}>{resume.summary}</p>
        </div>
      )}

      {hasExperience && (
        <div>
          <SectionHeading accent={accent} dense={dense}>Experience</SectionHeading>
          <ExperienceBlock experience={resume.experience} dense={dense} />
        </div>
      )}

      {hasProjects && (
        <div>
          <SectionHeading accent={accent} dense={dense}>Projects</SectionHeading>
          <ProjectsBlock projects={resume.projects} dense={dense} />
        </div>
      )}

      {hasEducation && (
        <div>
          <SectionHeading accent={accent} dense={dense}>Education</SectionHeading>
          <EducationBlock education={resume.education} dense={dense} />
        </div>
      )}

      {hasSkills && (
        <div>
          <SectionHeading accent={accent} dense={dense}>Skills</SectionHeading>
          <SkillsBlock skills={resume.skills} dense={dense} />
        </div>
      )}

      {hasAchievements && (
        <div>
          <SectionHeading accent={accent} dense={dense}>Achievements</SectionHeading>
          <AchievementsBlock achievements={resume.achievements} dense={dense} />
        </div>
      )}

      {hasCertifications && (
        <div>
          <SectionHeading accent={accent} dense={dense}>Certifications</SectionHeading>
          <CertificationsBlock certifications={resume.certifications} dense={dense} />
        </div>
      )}
    </div>
  );
};

export default ResumePreview;