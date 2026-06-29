const { aiComplete } = require("../utils/geminiClient");

// ════════════════════════════════════════
// LOCAL DETECTION — No AI call needed
// Fast pattern matching on text content
// ════════════════════════════════════════
const detectDocumentType = (text) => {
  const lower = text.toLowerCase();

  // ── Too short to be anything useful ──
  const wordCount = text.trim().split(/\s+/).length;
  if (wordCount < 30) {
    return {
      isResume: false,
      type: "empty",
      message: "The PDF has too little text. Please upload a text-based resume, not a scanned image.",
    };
  }

  // ── Strong resume signals ──
  const resumeSignals = [
    // Sections
    /\b(work experience|professional experience|employment history)\b/i,
    /\b(education|academic background|qualifications)\b/i,
    /\b(skills|technical skills|core competencies)\b/i,
    /\b(projects|personal projects|academic projects)\b/i,
    /\b(internship|intern at|interned at)\b/i,
    /\b(objective|summary|profile|about me)\b/i,
    /\b(certifications?|achievements?|awards?|accomplishments?)\b/i,
    /\b(references|hobbies|interests|languages)\b/i,

    // Contact patterns
    /\b[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}\b/, // email
    /(\+?\d[\d\s\-().]{7,}\d)/, // phone number
    /\b(linkedin\.com|github\.com|portfolio)\b/i,

    // Experience patterns
    /\b(20\d{2}\s*[-–]\s*(20\d{2}|present|current))\b/i, // date ranges
    /\b(b\.?tech|b\.?e|b\.?sc|m\.?tech|m\.?sc|mba|b\.?com|bca|mca)\b/i, // degrees
    /\b(gpa|cgpa|percentage|grade)\b/i,
  ];

  // ── Non-resume document signals ──
  const bookSignals = [
    /\b(chapter\s+\d+|chapter\s+one|chapter\s+two)\b/i,
    /\b(table of contents|index|bibliography|references)\b/i,
    /\b(published by|copyright|isbn|edition|publisher)\b/i,
    /\b(abstract|introduction|conclusion|methodology)\b/i,
    /\b(figure \d+|table \d+|equation \d+)\b/i,
  ];

  const invoiceSignals = [
    /\b(invoice|bill to|ship to|payment due|total amount)\b/i,
    /\b(item|quantity|unit price|subtotal|tax|grand total)\b/i,
    /\b(purchase order|po number|invoice number)\b/i,
  ];

  const legalSignals = [
    /\b(whereas|hereinafter|party of the first|agreement between)\b/i,
    /\b(terms and conditions|privacy policy|disclaimer|liability)\b/i,
    /\b(signed on|witnessed by|notary|affidavit)\b/i,
  ];

  const articleSignals = [
    /\b(et al\.|doi:|journal of|proceedings of)\b/i,
    /\b(hypothesis|experiment|results|discussion|findings)\b/i,
  ];

  const marksheetSignals = [
    /\b(marksheet|mark sheet|grade card|transcript|semester)\b/i,
    /\b(subject code|marks obtained|maximum marks|pass|fail)\b/i,
    /\b(roll no|enrollment no|examination)\b/i,
  ];

  // Count resume signals matched
  const resumeMatchCount = resumeSignals.filter((pattern) =>
    pattern.test(lower)
  ).length;

  // Check non-resume types
  const isBook = bookSignals.filter((p) => p.test(lower)).length >= 2;
  const isInvoice = invoiceSignals.filter((p) => p.test(lower)).length >= 2;
  const isLegal = legalSignals.filter((p) => p.test(lower)).length >= 2;
  const isArticle = articleSignals.filter((p) => p.test(lower)).length >= 2;
  const isMarksheet = marksheetSignals.filter((p) => p.test(lower)).length >= 2;

  // Determine document type
  if (isMarksheet) {
    return {
      isResume: false,
      type: "marksheet",
      message: "This appears to be a marksheet or academic transcript, not a resume. Please upload your resume or CV.",
    };
  }

  if (isInvoice) {
    return {
      isResume: false,
      type: "invoice",
      message: "This appears to be an invoice or bill, not a resume. Please upload your resume or CV.",
    };
  }

  if (isLegal) {
    return {
      isResume: false,
      type: "legal document",
      message: "This appears to be a legal document or agreement, not a resume. Please upload your resume or CV.",
    };
  }

  if (isArticle) {
    return {
      isResume: false,
      type: "research paper",
      message: "This appears to be a research paper or article, not a resume. Please upload your resume or CV.",
    };
  }

  if (isBook) {
    return {
      isResume: false,
      type: "book or report",
      message: "This appears to be a book, report, or document, not a resume. Please upload your resume or CV.",
    };
  }

  // Strong resume — at least 4 signals matched
  if (resumeMatchCount >= 4) {
    return { isResume: true, type: "resume", confidence: "high" };
  }

  // Weak resume signals — needs AI to confirm
  if (resumeMatchCount >= 2) {
    return { isResume: null, type: "uncertain", confidence: "low" };
  }

  // Almost nothing matched — likely not a resume
  return {
    isResume: false,
    type: "unknown document",
    message: "This does not appear to be a resume or CV. Please upload your resume.",
  };
};

// ════════════════════════════════════════
// AI CONFIRMATION — Only for uncertain cases
// ════════════════════════════════════════
const confirmWithAI = async (resumeText) => {
  const prompt = `
Analyze the first 800 words of this document and classify it.

Document text:
${resumeText.slice(0, 2000)}

Return ONLY this JSON:
{
  "isResume": true or false,
  "documentType": "<what this document actually is e.g. resume, book, invoice, marksheet, research paper, legal document, etc>",
  "reason": "<one sentence explaining why>"
}
`;

  const systemPrompt =
    "You are a document classifier. Return ONLY valid JSON. No markdown. No explanation outside JSON.";

  try {
    const response = await aiComplete(prompt, systemPrompt);
    const parsed = JSON.parse(response);
    return parsed;
  } catch {
    // If AI fails default to allowing analysis
    return { isResume: true, documentType: "resume", reason: "Could not confirm" };
  }
};

// ════════════════════════════════════════
// MAIN ANALYZE FUNCTION
// ════════════════════════════════════════
const analyzeResume = async (resumeText) => {

  // Step 1 — Local detection (fast, no AI cost)
  const localDetection = detectDocumentType(resumeText);

  console.log("📄 Local Detection Result:", localDetection);

  // Clearly not a resume — reject immediately
  if (localDetection.isResume === false) {
    return {
      isResume: false,
      documentType: localDetection.type,
      message: localDetection.message,
    };
  }

  // Step 2 — Uncertain case — ask AI to confirm
  if (localDetection.isResume === null) {
    console.log("🤔 Uncertain document — asking AI to confirm...");
    const aiConfirmation = await confirmWithAI(resumeText);
    console.log("🤖 AI Confirmation:", aiConfirmation);

    if (!aiConfirmation.isResume) {
      return {
        isResume: false,
        documentType: aiConfirmation.documentType,
        message: `This appears to be a ${aiConfirmation.documentType}, not a resume. Please upload your resume or CV.`,
      };
    }
  }

  // Step 3 — It's a resume — do full analysis
  console.log("✅ Document is a resume — running full analysis...");

  const systemPrompt =
    "You are a strict ATS scoring machine that works across ALL professional domains. You score resumes objectively and harshly based on domain-specific standards. You output ONLY valid JSON. Never inflate scores. Never add markdown or explanation.";

  const prompt = `
You are the world's most strict and accurate ATS Resume Scoring Engine used by top recruiting firms across ALL industries.

════════════════════════════════════════
STEP 1 — DETECT DOMAIN
════════════════════════════════════════
Detect the candidate's professional domain.
Examples: Software Engineering, Electronics/Embedded, Mechanical Engineering,
Civil Engineering, Medical/Healthcare, Finance/Accounting, Management/MBA,
Marketing/Sales, Data Science, Legal, Architecture, Education, Pharmacy, HR, etc.

════════════════════════════════════════
STEP 2 — ATS SCORE (0–100)
════════════════════════════════════════
Start at 100. Deduct points:

CRITICAL (–15 to –25):
□ No quantified achievements → –25
□ Missing contact info → –20
□ No portfolio/GitHub for tech OR no LinkedIn for business → –18
□ Fewer than 8 skills → –15
□ Vague bullet points → –20
□ No professional summary → –15
□ Fewer than 2 projects/experiences → –18

MAJOR (–8 to –14):
□ No team size or business impact → –12
□ Missing education details → –10
□ No certifications → –8
□ Tools without context → –10
□ No action verbs → –8
□ Generic summary → –10
□ No real-world deployment → –12

MODERATE (–3 to –7):
□ No extracurriculars → –5
□ Skills without context → –4
□ No GPA for freshers → –3
□ No awards → –4
□ Projects without links → –6
□ Inconsistent dates → –3
□ Missing keywords → –7

ABSOLUTE RULES:
1. Zero quantified achievements → max ATS 55
2. Missing profile link → max ATS 62
3. Fewer than 3 entries → max ATS 50
4. No summary → deduct 15 from both scores
5. Fresher with no projects → both under 45
6. Under 200 words → both under 35
7. NEVER round numbers — use 47, 63, 71 etc
8. Score like a machine not a coach

════════════════════════════════════════
STEP 3 — RESUME SCORE (0–100)
════════════════════════════════════════
Score across 6 dimensions:
1. IMPACT & ACHIEVEMENTS (0–25)
2. DOMAIN DEPTH & RELEVANCE (0–20)
3. STRUCTURE & READABILITY (0–15)
4. COMPLETENESS (0–15)
5. KEYWORD OPTIMIZATION (0–15)
6. CAREER NARRATIVE (0–10)

════════════════════════════════════════
STEP 4 — MISSING SKILLS
════════════════════════════════════════
List 6–8 HIGH-DEMAND missing skills for 2024–2025 in their domain.

════════════════════════════════════════
STEP 5 — SUGGESTIONS
════════════════════════════════════════
Give exactly 5 suggestions referencing SPECIFIC sections from THIS resume with example rewrites.

════════════════════════════════════════

Return ONLY this exact JSON. Nothing before or after:

{
  "isResume": true,
  "domain": "<detected domain>",
  "experienceLevel": "<Fresher/Junior/Mid-Level/Senior/Expert>",
  "score": <realistic non-rounded number>,
  "atsScore": <realistic non-rounded number>,
  "skills": ["<skill1>", "<skill2>"],
  "missingSkills": ["<6-8 missing skills>"],
  "suggestions": [
    "<suggestion 1 with specific reference and example rewrite>",
    "<suggestion 2>",
    "<suggestion 3>",
    "<suggestion 4>",
    "<suggestion 5>"
  ]
}

Resume text:
${resumeText}
`;

  const response = await aiComplete(prompt, systemPrompt);

  try {
    const parsed = JSON.parse(response);
    return parsed;
  } catch {
    return response;
  }
};

module.exports = analyzeResume;