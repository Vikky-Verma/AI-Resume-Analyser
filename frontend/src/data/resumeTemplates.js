// Visual templates available in the Resume Builder's template picker.
// `accent` drives the preview header color; `layout` is read by ResumePreview.jsx
// to decide how sections are arranged.
export const RESUME_TEMPLATES = [
  {
    id: "classic",
    name: "Classic",
    layout: "single-column",
    accent: "#4f46e5",
    description: "Clean single-column layout. Safe, readable, ATS-friendly.",
    bestFor: "General use, corporate roles, ATS-heavy pipelines",
  },
  {
    id: "modern",
    name: "Modern",
    layout: "sidebar",
    accent: "#0ea5e9",
    description: "Sidebar for contact/skills, main column for experience.",
    bestFor: "Tech roles, startups, product companies",
  },
  {
    id: "minimal",
    name: "Minimal",
    layout: "single-column",
    accent: "#334155",
    description: "Typography-first, no color blocks, maximum whitespace.",
    bestFor: "Design-conscious reviewers, senior/exec roles",
  },
  {
    id: "compact",
    name: "Compact ATS",
    layout: "single-column-dense",
    accent: "#0f172a",
    description: "Denser spacing to fit more on one page. Plain formatting parses cleanly through ATS software.",
    bestFor: "New grads, internship applications, large-company ATS",
  },
  {
    id: "bold",
    name: "Bold",
    layout: "sidebar",
    accent: "#e11d48",
    description: "Strong header, colored sidebar, confident typography.",
    bestFor: "Creative/marketing roles, portfolio-adjacent applications",
  },
];

export const getTemplate = (id) =>
  RESUME_TEMPLATES.find((t) => t.id === id) || RESUME_TEMPLATES[0];