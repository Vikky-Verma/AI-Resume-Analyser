require("dotenv").config();

const express = require("express");
const cors = require("cors");

const prisma = require("./utils/prisma");

// Routes
const authRoutes = require("./routes/authRoutes");
const resumeRoutes = require("./routes/resumeRoutes");
const analysisRoutes = require("./routes/analysisRoutes");
const atsRoutes = require("./routes/atsRoutes");
const careerRoutes = require("./routes/careerRoutes");

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

// Static Upload Folder
app.use("/uploads", express.static("uploads"));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/resume", resumeRoutes);
app.use("/api/analysis", analysisRoutes);
app.use("/api/ats", atsRoutes);
app.use("/api/career", careerRoutes);

// ✅ PHASE 7 ROUTE REGISTERED HERE
app.use("/api/report", pdfRoutes);

// Home Route
app.get("/", (req, res) => {
  res.send("🚀 AI Resume Analyzer Backend Running");
});

// Server
const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  console.log(`🚀 Server Running On Port ${PORT}`);
});