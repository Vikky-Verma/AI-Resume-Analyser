// Company-perspective presets for the Resume Builder.
// These are general, publicly-known hiring emphases used to nudge formatting
// and content — not official company material.
export const COMPANY_PRESETS = [
  {
    id: "general",
    name: "General / Custom",
    color: "#6366f1",
    recommendedTemplate: "classic",
    summaryHint:
      "2-3 lines: who you are, your core stack/domain, and the impact you drive.",
    bulletHint: "Start each bullet with an action verb and end with a measurable result.",
    tips: [
      "Keep it to one page unless you have 8+ years of experience.",
      "Quantify results wherever possible (%, $, time saved, users, scale).",
      "Match keywords from the job description so ATS systems surface your resume.",
    ],
    focusKeywords: ["ownership", "impact", "collaboration"],
  },
  {
    id: "google",
    name: "Google",
    color: "#4285F4",
    recommendedTemplate: "compact",
    summaryHint:
      "Lead with scale and technical depth — the systems or products you've shipped and the size of impact.",
    bulletHint:
      "Use the 'Accomplished X, measured by Y, by doing Z' structure. Emphasize measurable outcomes, not just responsibilities.",
    tips: [
      "Favor concrete, quantified impact over job-description-style duty lists.",
      "Highlight technical depth: systems design, scale, complexity handled.",
      "Keep formatting plain and consistent — no graphics or tables that could break parsing.",
      "Show breadth: cross-functional collaboration, mentoring, or leadership signals for senior roles.",
    ],
    focusKeywords: ["scale", "distributed systems", "data-driven", "leadership", "ambiguity"],
  },
  {
    id: "amazon",
    name: "Amazon",
    color: "#FF9900",
    recommendedTemplate: "classic",
    summaryHint:
      "Frame your background around ownership and customer impact rather than task lists.",
    bulletHint:
      "Frame bullets around a Leadership Principle where possible: the problem, your ownership of it, the customer/business outcome.",
    tips: [
      "Weave in Amazon's Leadership Principles implicitly (ownership, customer obsession, bias for action, dive deep).",
      "Quantify everything: cost savings, latency improvements, revenue impact, team size.",
      "Be ready to back every bullet with a STAR-format story — that's how it will be probed in interviews.",
      "Avoid fluffy adjectives; prefer concrete numbers and outcomes.",
    ],
    focusKeywords: ["ownership", "customer obsession", "bias for action", "scale", "metrics"],
  },
  {
    id: "microsoft",
    name: "Microsoft",
    color: "#00A4EF",
    recommendedTemplate: "modern",
    summaryHint:
      "Emphasize collaborative impact and growth mindset alongside technical skill.",
    bulletHint:
      "Highlight cross-team collaboration, platform thinking, and how your work enabled others.",
    tips: [
      "Show growth-mindset signals: learning, mentoring, adapting to new tech.",
      "Highlight platform/ecosystem thinking — work that scaled beyond a single feature.",
      "Include certifications (Azure, etc.) in a dedicated section if relevant.",
      "Keep tone collaborative rather than purely individual-hero focused.",
    ],
    focusKeywords: ["collaboration", "platform", "growth mindset", "cloud", "accessibility"],
  },
  {
    id: "meta",
    name: "Meta",
    color: "#0866FF",
    recommendedTemplate: "modern",
    summaryHint: "Lead with speed of execution and measurable product/user impact.",
    bulletHint:
      "Emphasize velocity, iteration speed, and impact on user-facing metrics (engagement, retention, growth).",
    tips: [
      "Show bias toward shipping fast and iterating based on data.",
      "Quantify user/product impact wherever possible (DAU, engagement, latency, conversion).",
      "Highlight independent, high-ownership work — 'moved fast' signals matter here.",
      "Keep the resume visually clean; substance over styling.",
    ],
    focusKeywords: ["move fast", "impact", "product metrics", "experimentation", "scale"],
  },
  {
    id: "startup",
    name: "Startup / Early-stage",
    color: "#22c55e",
    recommendedTemplate: "bold",
    summaryHint:
      "Emphasize versatility, speed, and willingness to own broad, undefined problems.",
    bulletHint:
      "Show range: things you built end-to-end, with limited resources or ambiguous scope.",
    tips: [
      "Highlight generalist range — full-stack, 0-to-1 work, wearing multiple hats.",
      "Show initiative: things you started or drove without being asked.",
      "A slightly bolder, more personality-forward format is fine here.",
      "Mention any side projects, open source, or shipped products outside work.",
    ],
    focusKeywords: ["0 to 1", "versatility", "ownership", "shipping speed"],
  },
];

export const getCompanyPreset = (id) =>
  COMPANY_PRESETS.find((c) => c.id === id) || COMPANY_PRESETS[0];