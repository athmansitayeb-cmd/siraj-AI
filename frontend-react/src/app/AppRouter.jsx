import { Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "../layout/MainLayout";

import LandingPage from "../pages/LandingPage";
import About from "../pages/About";
import Features from "../pages/Features";
import Pricing from "../pages/Pricing";
import Docs from "../pages/Docs";
import AI from "../pages/AI";
import Platform from "../pages/Platform";

import Dashboard from "../pages/Dashboard";
import Chat from "../pages/Chat";
import Upgrade from "../pages/Upgrade";

import Login from "../pages/Login";
import Register from "../pages/Register";
import ForgotPassword from "../pages/ForgotPassword";
import ResetPassword from "../pages/ResetPassword";

const isAuth = () => !!localStorage.getItem("siraj_token");

const Protected = ({ children }) =>
  isAuth() ? children : <Navigate to="/login" replace />;

const GuestOnly = ({ children }) =>
  !isAuth() ? children : <Navigate to="/dashboard" replace />;

export default function AppRouter() {
  return (
    <Routes>

      {/* PUBLIC */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/about" element={<About />} />
        <Route path="/features" element={<Features />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/docs" element={<Docs />} />
        <Route path="/ai" element={<AI />} />
        <Route path="/platform" element={<Platform />} />
      </Route>

      {/* AUTH */}
      <Route path="/login" element={<GuestOnly><Login /></GuestOnly>} />
      <Route path="/register" element={<GuestOnly><Register /></GuestOnly>} />

      {/* APP */}
      <Route element={<Protected><MainLayout /></Protected>}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/upgrade" element={<Upgrade />} />
      </Route>

      {/* PASSWORD */}
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password/:token" element={<ResetPassword />} />

      {/* 404 */}
      <Route path="*" element={<div className="p-10 text-white">404</div>} />

    </Routes>
  );
}
