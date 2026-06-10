const PDFDocument = require("pdfkit");

const generateResumePDF = (data) => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const buffers = [];

    doc.on("data", (chunk) => buffers.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(buffers)));
    doc.on("error", reject);

    const primaryColor = "#4F46E5";
    const lightGray = "#F3F4F6";
    const darkText = "#111827";
    const mutedText = "#6B7280";

    // ─── HEADER ───────────────────────────────────────────────
    doc
      .rect(0, 0, doc.page.width, 80)
      .fill(primaryColor);

    doc
      .fillColor("#FFFFFF")
      .fontSize(24)
      .font("Helvetica-Bold")
      .text("AI Resume Analysis Report", 50, 25);

    doc
      .fontSize(10)
      .font("Helvetica")
      .fillColor("#D1D5DB")
      .text(`Generated on: ${new Date().toDateString()}`, 50, 55);

    doc.moveDown(3);

    // ─── HELPER FUNCTIONS ─────────────────────────────────────
    const sectionTitle = (title) => {
      doc
        .moveDown(0.5)
        .fontSize(13)
        .font("Helvetica-Bold")
        .fillColor(primaryColor)
        .text(title);

      doc
        .moveTo(50, doc.y + 2)
        .lineTo(doc.page.width - 50, doc.y + 2)
        .strokeColor(primaryColor)
        .lineWidth(1)
        .stroke();

      doc.moveDown(0.5);
    };

    const bulletItem = (text) => {
      doc
        .fontSize(11)
        .font("Helvetica")
        .fillColor(darkText)
        .text(`• ${text}`, { indent: 10 });
    };

    const keyValue = (key, value) => {
      doc
        .fontSize(11)
        .font("Helvetica-Bold")
        .fillColor(mutedText)
        .text(`${key}: `, { continued: true })
        .font("Helvetica")
        .fillColor(darkText)
        .text(value);
    };

    // ─── SECTION 1: AI ANALYSIS ───────────────────────────────
    if (data.analysis) {
      sectionTitle("📊 AI Resume Analysis");

      if (data.analysis.overallScore !== undefined) {
        keyValue("Overall Score", `${data.analysis.overallScore} / 100`);
      }
      if (data.analysis.summary) {
        doc.moveDown(0.3);
        doc
          .fontSize(11)
          .font("Helvetica")
          .fillColor(darkText)
          .text(data.analysis.summary, { lineGap: 4 });
      }

      if (data.analysis.strengths?.length) {
        doc.moveDown(0.5);
        doc.fontSize(11).font("Helvetica-Bold").fillColor(mutedText).text("Strengths:");
        data.analysis.strengths.forEach((s) => bulletItem(s));
      }

      if (data.analysis.improvements?.length) {
        doc.moveDown(0.5);
        doc.fontSize(11).font("Helvetica-Bold").fillColor(mutedText).text("Areas to Improve:");
        data.analysis.improvements.forEach((i) => bulletItem(i));
      }
    }

    // ─── SECTION 2: ATS SCORE ─────────────────────────────────
    if (data.ats) {
      sectionTitle("🤖 ATS Analysis");

      if (data.ats.atsScore !== undefined) {
        keyValue("ATS Score", `${data.ats.atsScore} / 100`);
      }
      if (data.ats.matchedKeywords?.length) {
        doc.moveDown(0.3);
        doc.fontSize(11).font("Helvetica-Bold").fillColor(mutedText).text("Matched Keywords:");
        bulletItem(data.ats.matchedKeywords.join(", "));
      }
      if (data.ats.missingKeywords?.length) {
        doc.moveDown(0.3);
        doc.fontSize(11).font("Helvetica-Bold").fillColor(mutedText).text("Missing Keywords:");
        bulletItem(data.ats.missingKeywords.join(", "));
      }
    }

    // ─── SECTION 3: CAREER RECOMMENDATION ────────────────────
    if (data.career) {
      sectionTitle("🎯 Career Recommendation");

      if (data.career.bestFitRole) {
        keyValue("Best Fit Role", data.career.bestFitRole);
      }
      if (data.career.recommendedRoles?.length) {
        doc.moveDown(0.3);
        doc.fontSize(11).font("Helvetica-Bold").fillColor(mutedText).text("Recommended Roles:");
        data.career.recommendedRoles.forEach((r) => bulletItem(r));
      }
      if (data.career.skillsAlreadyHave?.length) {
        doc.moveDown(0.3);
        doc.fontSize(11).font("Helvetica-Bold").fillColor(mutedText).text("Skills You Have:");
        bulletItem(data.career.skillsAlreadyHave.join(", "));
      }
      if (data.career.skillsToLearn?.length) {
        doc.moveDown(0.3);
        doc.fontSize(11).font("Helvetica-Bold").fillColor(mutedText).text("Skills to Learn:");
        bulletItem(data.career.skillsToLearn.join(", "));
      }
      if (data.career.roadmap?.length) {
        doc.moveDown(0.3);
        doc.fontSize(11).font("Helvetica-Bold").fillColor(mutedText).text("Career Roadmap:");
        data.career.roadmap.forEach((step, i) => bulletItem(`Step ${i + 1}: ${step}`));
      }
    }

    // ─── SECTION 4: JOB MATCH (optional) ─────────────────────
    if (data.jobMatch) {
      sectionTitle("💼 Job Description Match");

      if (data.jobMatch.matchScore !== undefined) {
        keyValue("Match Score", `${data.jobMatch.matchScore}%`);
      }
      if (data.jobMatch.matchedSkills?.length) {
        doc.moveDown(0.3);
        doc.fontSize(11).font("Helvetica-Bold").fillColor(mutedText).text("Matched Skills:");
        bulletItem(data.jobMatch.matchedSkills.join(", "));
      }
      if (data.jobMatch.missingSkills?.length) {
        doc.moveDown(0.3);
        doc.fontSize(11).font("Helvetica-Bold").fillColor(mutedText).text("Missing Skills:");
        bulletItem(data.jobMatch.missingSkills.join(", "));
      }
      if (data.jobMatch.suggestions?.length) {
        doc.moveDown(0.3);
        doc.fontSize(11).font("Helvetica-Bold").fillColor(mutedText).text("Suggestions:");
        data.jobMatch.suggestions.forEach((s) => bulletItem(s));
      }
    }

    // ─── FOOTER ───────────────────────────────────────────────
    doc
      .moveDown(2)
      .fontSize(9)
      .font("Helvetica")
      .fillColor(mutedText)
      .text("Generated by AI Resume Analyser", { align: "center" });

    doc.end();
  });
};

module.exports = generateResumePDF;