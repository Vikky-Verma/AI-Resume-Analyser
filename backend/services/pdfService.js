const PDFDocument = require("pdfkit");

const generateResumePDF = (data) => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 0, size: "A4", bufferPages: true });
    const buffers = [];
    doc.on("data", (chunk) => buffers.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(buffers)));
    doc.on("error", reject);

    const W = doc.page.width;
    const H = doc.page.height;

    const INDIGO      = "#6366f1";
    const INDIGO_DARK = "#4f46e5";
    const EMERALD     = "#10b981";
    const AMBER       = "#f59e0b";
    const RED         = "#ef4444";
    const BG          = "#0f1117";
    const SURFACE     = "#1a1d2e";
    const SURFACE2    = "#242840";
    const BORDER      = "#2e3150";
    const WHITE       = "#ffffff";
    const MUTED       = "#94a3b8";
    const TEXT        = "#e2e8f0";
    const PAD         = 50;
    const CONTENT_W   = W - PAD * 2;

    const toArr = (val) => {
      if (!val) return [];
      if (Array.isArray(val)) return val;
      try { return JSON.parse(val); } catch { return String(val).split(",").map(s => s.trim()); }
    };

    const scoreColor = (s) => {
      if (s >= 75) return EMERALD;
      if (s >= 50) return AMBER;
      return RED;
    };

    const drawRoundedRect = (x, y, w, h, r, fill, stroke) => {
      doc.roundedRect(x, y, w, h, r);
      if (fill && stroke) doc.fillAndStroke(fill, stroke);
      else if (fill) doc.fill(fill);
      else if (stroke) doc.stroke(stroke);
    };

    const drawCircleScore = (cx, cy, radius, score, label, color) => {
      doc.circle(cx, cy, radius).lineWidth(6).stroke(SURFACE2);
      doc.circle(cx, cy, radius).lineWidth(6).stroke(color);
      doc.fontSize(22).font("Helvetica-Bold").fillColor(color)
        .text(String(score), cx - 18, cy - 14, { width: 36, align: "center" });
      doc.fontSize(8).font("Helvetica").fillColor(MUTED)
        .text("/100", cx - 15, cy + 10, { width: 30, align: "center" });
      doc.fontSize(9).font("Helvetica").fillColor(MUTED)
        .text(label, cx - 40, cy + radius + 8, { width: 80, align: "center" });
    };

    const drawChips = (items, startX, startY, bgColor, textColor, maxWidth) => {
      let x = startX;
      let y = startY;
      items.forEach((item) => {
        const tw = doc.widthOfString(String(item), { fontSize: 8 }) + 16;
        if (x + tw > maxWidth) { x = startX; y += 22; }
        doc.roundedRect(x, y, tw, 16, 8).fill(bgColor);
        doc.fontSize(8).font("Helvetica-Bold").fillColor(textColor)
          .text(String(item), x + 8, y + 4, { width: tw - 16 });
        x += tw + 6;
      });
      return y + 22;
    };

    const sectionHeader = (title, y, accentColor) => {
      doc.rect(PAD, y, 3, 16).fill(accentColor);
      doc.fontSize(11).font("Helvetica-Bold").fillColor(WHITE)
        .text(title.toUpperCase(), PAD + 10, y + 2);
      doc.moveTo(PAD + 10, y + 19).lineTo(W - PAD, y + 19)
        .lineWidth(0.5).stroke(BORDER);
      return y + 30;
    };

    const newPage = (pageTitle, pageSubtitle) => {
      doc.addPage();
      doc.rect(0, 0, W, H).fill(BG);
      doc.rect(0, 0, W, 4).fill(INDIGO);
      drawRoundedRect(0, 0, W, 60, 0, SURFACE, null);
      doc.fontSize(16).font("Helvetica-Bold").fillColor(WHITE).text(pageTitle, PAD, 18);
      doc.fontSize(9).font("Helvetica").fillColor(MUTED).text(pageSubtitle, PAD, 38);
      return 80;
    };

    // ══════════════════════════════════════
    // PAGE 1 — HEADER + SCORES
    // ══════════════════════════════════════
    doc.rect(0, 0, W, H).fill(BG);
    doc.rect(0, 0, W, 190).fill(SURFACE);
    doc.rect(0, 0, W, 4).fill(INDIGO);

    // Decorative circles
    doc.save();
    doc.opacity(0.08);
    doc.circle(W - 40, 40, 90).fill(INDIGO_DARK);
    doc.circle(W - 20, 170, 55).fill(INDIGO);
    doc.restore();

    // Logo
    drawRoundedRect(PAD, 28, 36, 36, 8, INDIGO, null);
    doc.fontSize(18).font("Helvetica-Bold").fillColor(WHITE).text("R", PAD + 12, 36);
    doc.fontSize(13).font("Helvetica-Bold").fillColor(WHITE).text("ResumeAI", PAD + 44, 36);
    doc.fontSize(8).font("Helvetica").fillColor(MUTED).text("Professional Analysis Report", PAD + 44, 52);

    // Title
    doc.fontSize(26).font("Helvetica-Bold").fillColor(WHITE).text("Resume Analysis Report", PAD, 88);
    doc.fontSize(10).font("Helvetica").fillColor(MUTED)
      .text(`Generated on ${new Date().toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" })}`, PAD, 122);

    // ── SCORE CARDS ──
    const analysis     = data.analysis  || {};
    const career       = data.career    || {};
    const resumeScore  = analysis.score    || 0;
    const atsScoreVal  = analysis.atsScore || 0;

    drawRoundedRect(PAD, 148, 148, 88, 12, SURFACE2, BORDER);
    drawCircleScore(PAD + 74, 188, 28, resumeScore, "Resume Score", scoreColor(resumeScore));

    drawRoundedRect(PAD + 162, 148, 148, 88, 12, SURFACE2, BORDER);
    drawCircleScore(PAD + 236, 188, 28, atsScoreVal, "ATS Score", scoreColor(atsScoreVal));

    if (career.bestFitRole) {
      drawRoundedRect(PAD + 324, 148, 168, 88, 12, SURFACE2, BORDER);
      doc.fontSize(8).font("Helvetica").fillColor(MUTED).text("BEST FIT ROLE", PAD + 338, 165);
      doc.fontSize(13).font("Helvetica-Bold").fillColor(WHITE)
        .text(career.bestFitRole, PAD + 334, 184, { width: 144 });
      drawRoundedRect(PAD + 338, 218, 65, 14, 7, "#1e1b4b", null);
      doc.fontSize(7).font("Helvetica-Bold").fillColor(INDIGO).text("AI MATCHED", PAD + 346, 222);
    }

    // ── PAGE 1 CONTENT ──
    let y = 260;

    const skills = toArr(analysis.skills);
    if (skills.length > 0) {
      y = sectionHeader("Skills Found", y, INDIGO);
      y = drawChips(skills, PAD, y, "#1e1b4b", "#a5b4fc", W - PAD);
      y += 16;
    }

    const missing = toArr(analysis.missingSkills);
    if (missing.length > 0) {
      if (y > 680) { y = newPage("Resume Analysis", "Continued"); }
      y = sectionHeader("Skills to Acquire", y, RED);
      y = drawChips(missing.slice(0, 8), PAD, y, "#2d1a1a", "#fca5a5", W - PAD);
      y += 16;
    }

    const suggestions = toArr(analysis.suggestions);
    if (suggestions.length > 0) {
      if (y > 650) { y = newPage("Resume Analysis", "Continued"); }
      y = sectionHeader("Key Recommendations", y, AMBER);
      suggestions.slice(0, 5).forEach((s, i) => {
        if (y > 750) return;
        drawRoundedRect(PAD, y, CONTENT_W, 32, 8, SURFACE2, null);
        drawRoundedRect(PAD + 8, y + 8, 18, 18, 4, INDIGO, null);
        doc.fontSize(9).font("Helvetica-Bold").fillColor(WHITE).text(String(i + 1), PAD + 13, y + 12);
        doc.fontSize(9).font("Helvetica").fillColor(TEXT)
          .text(String(s), PAD + 34, y + 11, { width: CONTENT_W - 44, ellipsis: true });
        y += 38;
      });
    }

    // ══════════════════════════════════════
    // PAGE 2 — CAREER ROADMAP
    // ══════════════════════════════════════
    if (career.recommendedRoles || career.skillsToLearn || career.roadmap) {
      y = newPage("Career Roadmap", "AI-powered career recommendations based on your resume");

      const roles = career.recommendedRoles || [];
      if (roles.length > 0) {
        y = sectionHeader("Recommended Roles", y, EMERALD);
        y = drawChips(roles, PAD, y, "#0d2e22", "#6ee7b7", W - PAD);
        y += 20;
      }

      const toLearn = career.skillsToLearn || [];
      if (toLearn.length > 0) {
        y = sectionHeader("Skills to Learn", y, AMBER);
        y = drawChips(toLearn, PAD, y, "#2e2208", "#fcd34d", W - PAD);
        y += 20;
      }

      const roadmap = career.roadmap || [];
      if (roadmap.length > 0) {
        y = sectionHeader("Career Roadmap", y, INDIGO);
        roadmap.forEach((step, i) => {
          if (y > 760) return;
          if (i < roadmap.length - 1) {
            doc.moveTo(PAD + 12, y + 28).lineTo(PAD + 12, y + 48)
              .lineWidth(1.5).stroke(BORDER);
          }
          doc.circle(PAD + 12, y + 14, 12).fill(INDIGO);
          doc.fontSize(8).font("Helvetica-Bold").fillColor(WHITE).text(String(i + 1), PAD + 7, y + 10);
          drawRoundedRect(PAD + 30, y, CONTENT_W - 30, 28, 6, SURFACE2, null);
          doc.fontSize(9).font("Helvetica").fillColor(TEXT)
            .text(String(step), PAD + 42, y + 9, { width: CONTENT_W - 52 });
          y += 44;
        });
      }
    }

    // ══════════════════════════════════════
    // PAGE 3 — JOB MATCH (only if exists)
    // ══════════════════════════════════════
    if (data.jobMatch) {
      y = newPage("Job Match Analysis", "Resume compatibility with job description");

      // Match score — centered big circle
      drawRoundedRect(PAD, y, CONTENT_W, 100, 12, SURFACE2, BORDER);
      drawCircleScore(W / 2, y + 50, 35, data.jobMatch.matchScore, "Match Score", scoreColor(data.jobMatch.matchScore));

      // Score label
      const matchLabel =
        data.jobMatch.matchScore >= 75 ? "Strong Match" :
        data.jobMatch.matchScore >= 50 ? "Moderate Match" : "Weak Match";
      const matchLabelColor =
        data.jobMatch.matchScore >= 75 ? EMERALD :
        data.jobMatch.matchScore >= 50 ? AMBER : RED;

      drawRoundedRect(W / 2 - 40, y + 74, 80, 16, 8, SURFACE, null);
      doc.fontSize(9).font("Helvetica-Bold").fillColor(matchLabelColor)
        .text(matchLabel, W / 2 - 36, y + 78, { width: 72, align: "center" });

      y += 116;

      const matchedSkills = data.jobMatch.matchedSkills || [];
      if (matchedSkills.length > 0) {
        y = sectionHeader("Matched Skills", y, EMERALD);
        y = drawChips(matchedSkills, PAD, y, "#0d2e22", "#6ee7b7", W - PAD);
        y += 20;
      }

      const missingSkills = data.jobMatch.missingSkills || [];
      if (missingSkills.length > 0) {
        y = sectionHeader("Missing Skills", y, RED);
        y = drawChips(missingSkills, PAD, y, "#2d1a1a", "#fca5a5", W - PAD);
        y += 20;
      }

      const jobSuggestions = data.jobMatch.suggestions || [];
      if (jobSuggestions.length > 0) {
        y = sectionHeader("Suggestions", y, AMBER);
        jobSuggestions.forEach((s, i) => {
          if (y > 750) return;
          drawRoundedRect(PAD, y, CONTENT_W, 32, 8, SURFACE2, null);
          drawRoundedRect(PAD + 8, y + 8, 18, 18, 4, AMBER, null);
          doc.fontSize(9).font("Helvetica-Bold").fillColor(BG).text(String(i + 1), PAD + 13, y + 12);
          doc.fontSize(9).font("Helvetica").fillColor(TEXT)
            .text(String(s), PAD + 34, y + 11, { width: CONTENT_W - 44, ellipsis: true });
          y += 38;
        });
      }
    }

    // ══════════════════════════════════════
    // FOOTER — all pages
    // ══════════════════════════════════════
    const range = doc.bufferedPageRange();
    for (let i = 0; i < range.count; i++) {
      doc.switchToPage(range.start + i);
      doc.rect(0, H - 36, W, 36).fill(SURFACE);
      doc.moveTo(0, H - 36).lineTo(W, H - 36).lineWidth(0.5).stroke(BORDER);
      doc.fontSize(8).font("Helvetica").fillColor(MUTED)
        .text("ResumeAI — Confidential Analysis Report", PAD, H - 22);
      doc.fontSize(8).font("Helvetica").fillColor(MUTED)
        .text(`Page ${i + 1} of ${range.count}`, W - 80, H - 22);
    }

    doc.end();
  });
};

module.exports = generateResumePDF;