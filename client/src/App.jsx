
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import StudentDashboard from "./pages/StudentDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import TechnicianDashboard from "./pages/TechnicianDashboard";
import ComplaintForm from "./pages/ComplaintForm";
import MyComplaints from "./pages/MyComplaints";
import Register from "./pages/Register";
import VerifyOTP from "./pages/VerifyOTP";
// import AdminTechnicians from "./pages/AdminTechnicians";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminMonthlyReport from "./pages/AdminMonthlyReport";
import AdminComplaints from "./pages/AdminComplaints";
import AdminSettings from "./pages/AdminSettings";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import SupervisorDashboard from "./pages/SupervisorDashboard";
import AdminAIChatbot from "./pages/AdminAIChatbot";
import SupervisorTechnicians from "./pages/SupervisorTechnicians";
import SupervisorComplaints from "./pages/SupervisorComplaints";
import Notifications from "./pages/Notifications";


function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* ==================== AUTH ==================== */}

        <Route path="/" element={<Login />} />

        <Route
          path="/register"
          element={<Register />}
        />

        <Route
          path="/verify-otp"
          element={<VerifyOTP />}
        />


        {/* ==================== STUDENT ==================== */}

        <Route
          path="/student"
          element={
            <ProtectedRoute allowedRole="student">
              <StudentDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/student/report"
          element={
            <ProtectedRoute allowedRole="student">
              <StudentDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/student/complaints"
          element={
            <ProtectedRoute allowedRole="student">
              <StudentDashboard />
            </ProtectedRoute>
          }
        />


        {/* ==================== ADMIN ==================== */}

        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRole="admin">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />



        <Route
          path="/admin/monthly-report"
          element={
            <ProtectedRoute allowedRole="admin">
              <AdminMonthlyReport />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/complaints"
          element={
            <ProtectedRoute allowedRole="admin">
              <AdminComplaints />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/settings"
          element={
            <ProtectedRoute allowedRole="admin">
              <AdminSettings />
            </ProtectedRoute>
          }
        />


        {/* ==================== TECHNICIAN ==================== */}

        <Route
          path="/technician"
          element={
            <ProtectedRoute allowedRole="technician">
              <TechnicianDashboard />
            </ProtectedRoute>
          }
        />


        {/* ==================== PASSWORD ==================== */}

        <Route
          path="/forgot-password"
          element={<ForgotPassword />}
        />

        <Route
          path="/reset-password"
          element={<ResetPassword />}
        />


        {/* ==================== UNKNOWN URL ==================== */}

        <Route
          path="*"
          element={<Login />}
        />

        <Route
          path="/supervisor/dashboard"
          element={
            <ProtectedRoute allowedRole="supervisor">
              <SupervisorDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/ai-chatbot"
          element={
            <ProtectedRoute allowedRole="admin">
              <AdminAIChatbot />
            </ProtectedRoute>
          }
        />
        <Route
          path="/supervisor/dashboard"
          element={
            <ProtectedRoute allowedRole="supervisor">
              <SupervisorDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/supervisor/complaints"
          element={
            <ProtectedRoute allowedRole="supervisor">
              <SupervisorComplaints />
            </ProtectedRoute>
          }
        />

        <Route
          path="/supervisor/technicians"
          element={
            <ProtectedRoute allowedRole="supervisor">
              <SupervisorTechnicians />
            </ProtectedRoute>
          }
        />

<Route
  path="/supervisor/notifications"
  element={
    <ProtectedRoute allowedRoles={["supervisor"]}>
      <Notifications />
    </ProtectedRoute>
  }
/>

        <Route
          path="/supervisor/ai-chatbot"
          element={
            <ProtectedRoute allowedRole="supervisor">
              <div className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
                <div className="rounded-3xl bg-white p-10 text-center shadow-xl">
                  <div className="text-5xl">🤖</div>
                  <h1 className="mt-5 text-3xl font-black text-slate-800">
                    AI Chatbot
                  </h1>
                  <p className="mt-2 text-lg font-bold text-indigo-600">
                    Coming Soon 🚀
                  </p>
                  <p className="mt-2 text-sm text-slate-500">
                    CampusFix AI Assistant is under development.
                  </p>
                </div>
              </div>
            </ProtectedRoute>
          }
        />
        <Route
          path="/supervisor/technicians"
          element={
            <ProtectedRoute allowedRole="supervisor">
              <SupervisorTechnicians />
            </ProtectedRoute>
          }
        />



      </Routes>
    </BrowserRouter>
  );
}

export default App;
