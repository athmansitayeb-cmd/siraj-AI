import LandingPage from "./pages/LandingPage.jsx";
import { Suspense, lazy, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./routes/ProtectedRoute";

const Upgrade = lazy(() => import("./pages/Upgrade.jsx"));
const Chat = lazy(() => import("./pages/Chat.jsx"));
const Dashboard = lazy(() => import("./pages/Dashboard.jsx"));
const Login = lazy(() => import("./pages/Login.jsx"));
const Register = lazy(() => import("./pages/Register.jsx"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword.jsx"));
const ResetPassword = lazy(() => import("./pages/ResetPassword.jsx"));
const Pricing = lazy(() => import("./pages/Pricing.jsx"));
const Docs = lazy(() => import("./pages/Docs.jsx"));
const AI = lazy(() => import("./pages/AI.jsx"));
const Platform = lazy(() => import("./pages/Platform.jsx"));

// 👇 صفحات جديدة (مهمة للـ SEO)
const About = lazy(() => import("./pages/About.jsx"));
const Features = lazy(() => import("./pages/Features.jsx"));

export default function App() {

  useEffect(() => {
    if (!localStorage.getItem("guestId")) {
      localStorage.setItem("guestId", crypto.randomUUID());
      localStorage.setItem("guestMessages", "0");
    }
  }, []);

  const token = localStorage.getItem("siraj_token");

  return (
    <Suspense fallback={<div className="text-yellow-400 p-4">Loading page...</div>}>
      <Routes>

        {/* public SEO pages */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/about" element={<About />} />
        <Route path="/features" element={<Features />} />

<Route path="/pricing" element={<Pricing />} />
<Route path="/docs" element={<Docs />} />
<Route path="/ai" element={<AI />} />
<Route path="/platform" element={<Platform />} />

        {/* auth */}
        <Route path="/login" element={token ? <Navigate to="/dashboard" /> : <Login />} />
        <Route path="/register" element={token ? <Navigate to="/dashboard" /> : <Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />

        {/* protected */}
        <Route path="/chat" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/upgrade" element={<ProtectedRoute><Upgrade /></ProtectedRoute>} />

      </Routes>
    </Suspense>
  );
}
