require("dotenv").config();

const express = require("express");
const cors = require("cors");

const errorHandler = require("./middleware/errorHandler");

const authRoutes = require("./routes/authRoutes");
const resumeRoutes = require("./routes/resumeRoutes");
const analysisRoutes = require("./routes/analysisRoutes");
const atsRoutes = require("./routes/atsRoutes");
const careerRoutes = require("./routes/careerRoutes");
const interviewRoutes = require("./routes/interviewRoutes");
const dsaRoutes = require("./routes/dsaRoutes");
const projectRoutes = require("./routes/projectRoutes");
const roadmapRoutes = require("./routes/roadmapRoutes");
const companyPrepRoutes = require("./routes/companyPrepRoutes");
const applicationRoutes = require("./routes/applicationRoutes");
const portfolioRoutes = require("./routes/portfolioRoutes");
const builderResumeRoutes = require("./routes/builderResumeRoutes");
const progressRoutes = require("./routes/progressRoutes");
const pdfRoutes = require("./routes/pdfRoutes");

const app = express();

app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://ai-resume-analyser-chi-ten.vercel.app",
  ],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/auth", authRoutes);
app.use("/api/resume", resumeRoutes);
app.use("/api/analysis", analysisRoutes);
app.use("/api/ats", atsRoutes);
app.use("/api/career", careerRoutes);
app.use("/api/dsa", dsaRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/roadmap", roadmapRoutes);
app.use("/api/company-prep", companyPrepRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/portfolio", portfolioRoutes);
app.use("/api/resume-builder", builderResumeRoutes);
app.use("/api/progress", progressRoutes);
app.use("/api/report", pdfRoutes);
app.use("/api/interview", interviewRoutes);

app.get("/", (req, res) => {
  res.send("🚀 AI Resume Analyzer Backend Running");
});

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route Not Found: ${req.method} ${req.originalUrl}`,
  });
});

app.use(errorHandler);

module.exports = app;