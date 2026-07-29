require("dotenv").config();

const path = require("path");
const express = require("express");
const cors = require("cors");

const prisma = require("./utils/prisma");
const authenticate = require("./middleware/authMiddleware");

// Routes
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

// ✅ PHASE 7 - PDF REPORT ROUTE ADDED
const pdfRoutes = require("./routes/pdfRoutes");

const app = express();

// Database Connection Check
async function connectDB() {
  try {
    await prisma.$connect();
    console.log("✅ Neon Database Connected");
  } catch (error) {
    console.error("❌ Database Connection Failed");
    console.error(error);
    process.exit(1);
  }
}

connectDB();

// Middleware
app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://ai-resume-analyser-chi-ten.vercel.app", // ✅ no trailing slash
  ],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static Upload Folder — auth-protected, owner-only (replaces express.static)
app.get("/uploads/:filename", authenticate, async (req, res) => {
  const { filename } = req.params;

  const resume = await prisma.resume.findFirst({
    where: {
      userId: req.user.id,
      filePath: { endsWith: filename },
    },
  });

  if (!resume) {
    return res.status(404).json({ message: "File Not Found" });
  }

  return res.sendFile(path.resolve(__dirname, "uploads", filename));
});

// Routes
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

// ✅ PHASE 7 ROUTE REGISTERED HERE
app.use("/api/report", pdfRoutes);
app.use("/api/interview", interviewRoutes);


// Home Route
app.get("/", (req, res) => {
  res.send("🚀 AI Resume Analyzer Backend Running");
});

// Server
const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  console.log(`🚀 Server Running On Port ${PORT}`);
});