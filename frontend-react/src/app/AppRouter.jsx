import { Routes, Route } from "react-router-dom";

import LandingPage from "../pages/LandingPage";
import AI from "../pages/AI";
import Features from "../pages/Features";
import Pricing from "../pages/Pricing";
import Docs from "../pages/Docs";

import Login from "../pages/Login";
import Register from "../pages/Register";

import Dashboard from "../pages/Dashboard";
import IntentCapture from "../pages/IntentCapture";
import { lazy, Suspense } from "react";

const Chat = lazy(() => import("../pages/Chat"));

import AppLayout from "../layouts/AppLayout";
import MarketingLayout from "../layouts/marketing";

import { ProtectedRoute, GuestRoute } from "../auth/ProtectedRoute";

export default function AppRouter() {
 return (
 <Routes>

 {/* ================= PUBLIC ================= */}
 <Route element={<MarketingLayout />}>
 <Route path="/" element={<LandingPage />} />
 <Route path="/ai" element={<AI />} />
 <Route path="/features" element={<Features />} />
 <Route path="/pricing" element={<Pricing />} />
 <Route path="/docs" element={<Docs />} />
 </Route>

 {/* ================= AUTH ================= */}
 <Route element={<GuestRoute />}>
 <Route path="/login" element={<Login />} />
 <Route path="/register" element={<Register />} />
 </Route>

 {/* ================= APP ================= */}
 <Route element={<ProtectedRoute />}>
 <Route element={<AppLayout />}>
 <Route path="/dashboard" element={<Dashboard />} />
 <Route path="/intent" element={<IntentCapture />} />
<Route
  path="/chat/:workspaceId"
  element={
    <Suspense fallback={<div>Loading...</div>}>
      <Chat />
    </Suspense>
  }
/>
 </Route>
 </Route>

 {/* ================= FALLBACK ================= */}
 <Route path="*" element={<div>404</div>} />

 </Routes>
 );
}
