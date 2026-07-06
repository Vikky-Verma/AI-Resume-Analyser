import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import ResumeDetail from "./pages/ResumeDetail";
import MockInterviewSetup from "./pages/MockInterviewSetup";
import InterviewRoom from "./pages/InterviewRoom";
import InterviewReport from "./pages/InterviewReport";

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
          <Route path="/" element={<Navigate to="/dashboard" />} />
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
            path="/interview/new"
            element={
              <ProtectedRoute>
                <MockInterviewSetup />
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
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
