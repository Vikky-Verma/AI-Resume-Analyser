import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import ResumeDetail from "./pages/ResumeDetail";
import MockInterviewSetup from "./pages/MockInterviewSetup";
import InterviewRoom from "./pages/InterviewRoom";
import InterviewReport from "./pages/InterviewReport";
import ATSChecker from "./pages/ATSChecker";
import ProfileInsights from "./pages/ProfileInsights";
import DsaInsights from "./pages/DsaInsights";
import ProjectIntelligence from "./pages/ProjectIntelligence";
import AiRoadmap from "./pages/AiRoadmap";
import CompanyPrep from "./pages/CompanyPrep";
import InternshipTracker from "./pages/InternshipTracker";
import PortfolioBuilder from "./pages/PortfolioBuilder";
import Progress from "./pages/Progress";
import Pricing from "./pages/Pricing";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: "#1a1d2e",
              color: "#f1f5f9",
              border: "1px solid #2e3150",
              borderRadius: "12px",
              fontSize: "13px",
            },
          }}
        />
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/resume/:resumeId"
            element={
              <ProtectedRoute>
                <ResumeDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/interview"
            element={
              <ProtectedRoute>
                <MockInterviewSetup />
              </ProtectedRoute>
            }
          />
          <Route
            path="/interview/new"
            element={
              <ProtectedRoute>
                <MockInterviewSetup />
              </ProtectedRoute>
            }
          />
          <Route
            path="/ats-checker"
            element={
              <ProtectedRoute>
                <ATSChecker />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile-insights"
            element={
              <ProtectedRoute>
                <ProfileInsights />
              </ProtectedRoute>
            }
          />
          <Route
            path="/interview/:interviewId/room"
            element={
              <ProtectedRoute>
                <InterviewRoom />
              </ProtectedRoute>
            }
          />
          <Route
            path="/interview/:interviewId/report"
            element={
              <ProtectedRoute>
                <InterviewReport />
              </ProtectedRoute>
            }
          />

          {/* Nav label alias — reuses the existing ATS checker page */}
          <Route
            path="/resume-analysis"
            element={
              <ProtectedRoute>
                <ATSChecker />
              </ProtectedRoute>
            }
          />

          {/* Future-phase placeholders (Phase 3, 4, 6) */}
          <Route
            path="/dsa-insights"
            element={
              <ProtectedRoute>
                <DsaInsights />
              </ProtectedRoute>
            }
          />
          <Route
            path="/project-intelligence"
            element={
              <ProtectedRoute>
                <ProjectIntelligence />
              </ProtectedRoute>
            }
          />
          <Route
            path="/ai-roadmap"
            element={
              <ProtectedRoute>
                <AiRoadmap />
              </ProtectedRoute>
            }
          />
          <Route
            path="/company-prep"
            element={
              <ProtectedRoute>
                <CompanyPrep />
              </ProtectedRoute>
            }
          />
          <Route
            path="/internship-tracker"
            element={
              <ProtectedRoute>
                <InternshipTracker />
              </ProtectedRoute>
            }
          />
          <Route
            path="/portfolio-builder"
            element={
              <ProtectedRoute>
                <PortfolioBuilder />
              </ProtectedRoute>
            }
          />
          <Route
            path="/progress"
            element={
              <ProtectedRoute>
                <Progress />
              </ProtectedRoute>
            }
          />

          {/* Pricing is public — pre-purchase info, no login wall */}
          <Route path="/pricing" element={<Pricing />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;