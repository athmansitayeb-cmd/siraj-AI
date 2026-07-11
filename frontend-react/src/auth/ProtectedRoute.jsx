import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "./AuthContext";

export function ProtectedRoute() {
 const { isAuthenticated, loading } = useAuth();

if (loading) {
 return (
 <div style={{ padding: 20, color: "#999" }}>
 Loading auth...
 </div>
 );
}

 return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
}

export function GuestRoute() {
 const { isAuthenticated, loading } = useAuth();

 if (loading) return null;

 return !isAuthenticated ? <Outlet /> : <Navigate to="/dashboard" replace />;
}
