require("dotenv").config();

const express = require("express");
const cors = require("cors");

const prisma = require("./utils/prisma");

const authRoutes =
  require("./routes/authRoutes");

const resumeRoutes =
  require("./routes/resumeRoutes");

const analysisRoutes =
  require("./routes/analysisRoutes");

const atsRoutes =
  require("./routes/atsRoutes");

const jobMatchRoutes =
  require("./routes/jobMatchRoutes");

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
app.use(cors());

app.use(express.json());

app.use(
  express.urlencoded({
    extended: true,
  })
);

// Static Upload Folder
app.use(
  "/uploads",
  express.static("uploads")
);

// Routes
app.use(
  "/api/auth",
  authRoutes
);

app.use(
  "/api/resume",
  resumeRoutes
);

app.use(
  "/api/analysis",
  analysisRoutes
);

app.use(
  "/api/ats",
  atsRoutes
);

app.use(
  "/api/job-match",
  jobMatchRoutes
);

// Home Route
app.get("/", (req, res) => {
  res.send(
    "🚀 AI Resume Analyzer Backend Running"
  );
});

// Server
const PORT =
  process.env.PORT || 8000;

app.listen(PORT, () => {
  console.log(
    `🚀 Server Running On Port ${PORT}`
  );
});