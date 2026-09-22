
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import StudentDashboard from "./pages/StudentDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import TechnicianDashboard from "./pages/TechnicianDashboard";
import ComplaintForm from "./pages/ComplaintForm";
import MyComplaints from "./pages/MyComplaints";
import Register from "./pages/Register";
import VerifyOTP from "./pages/VerifyOTP";
import AdminTechnicians from "./pages/AdminTechnicians";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminMonthlyReport from "./pages/AdminMonthlyReport";
import AdminComplaints from "./pages/AdminComplaints";
import AdminSettings from "./pages/AdminSettings";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";


function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Login */}
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify-otp" element={<VerifyOTP />} />

        {/* Student Dashboard */}
        <Route
          path="/student"
          element={
            <ProtectedRoute allowedRole="student">
              <StudentDashboard />
            </ProtectedRoute>
          }
        />

        {/* Student - Report Complaint */}
        <Route
          path="/student/report"
          element={
            <ProtectedRoute allowedRole="student">
              <ComplaintForm />
            </ProtectedRoute>
          }
        />

        {/* Student - My Complaints */}
        <Route
          path="/student/complaints"
          element={
            <ProtectedRoute allowedRole="student">
              <MyComplaints />
            </ProtectedRoute>
          }
        />

        {/* Admin Dashboard */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRole="admin">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* Technician Dashboard */}
        <Route
          path="/technician"
          element={
            <ProtectedRoute allowedRole="technician">
              <TechnicianDashboard />
            </ProtectedRoute>
          }
        />

        {/* Unknown URL */}
        <Route path="*" element={<Login />} />
        <Route path="/admin/technicians" element={<AdminTechnicians />} />

        <Route
          path="/admin/monthly-report"
          element={<AdminMonthlyReport />}
        />
        <Route
          path="/admin/complaints"
          element={<AdminComplaints />}
        />
        <Route
          path="/admin/settings"
          element={<AdminSettings />}
        />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
