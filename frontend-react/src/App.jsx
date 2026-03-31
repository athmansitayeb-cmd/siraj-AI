import LandingPage from "./pages/LandingPage.jsx";
import { Suspense, lazy, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./routes/ProtectedRoute";

// pages
const Chat = lazy(() => import("./pages/Chat.jsx"));
const Dashboard = lazy(() => import("./pages/Dashboard.jsx"));
const Login = lazy(() => import("./pages/Login.jsx"));
const Register = lazy(() => import("./pages/Register.jsx"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword.jsx"));
const ResetPassword = lazy(() => import("./pages/ResetPassword.jsx"));
const token = localStorage.getItem("siraj_token");

export default function App() {

  // ✅ هذا المكان الصحيح
  useEffect(() => {
    const token = localStorage.getItem("siraj_token");

    if (!token) {
      if (!localStorage.getItem("guestId")) {
        localStorage.setItem("guestId", crypto.randomUUID());
        localStorage.setItem("guestMessages", "0");
      }
    }
  }, []);

  return (
    <Suspense fallback={<div className="text-yellow-400 p-4">Loading page...</div>}>
      <Routes>

        {/* public */}
        <Route path="/" element={<LandingPage />} />
        <Route
          path="/"
          element={
            token ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />

        {/* protected */}
        <Route
          path="/chat"
          element={
            <ProtectedRoute>
              <Chat />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

      </Routes>
    </Suspense>
  );
}
