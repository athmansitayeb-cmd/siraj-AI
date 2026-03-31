import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children }) {
  const token = localStorage.getItem("siraj_token");

  const isValid =
    token &&
    token !== "undefined" &&
    token !== "null" &&
    token.length > 10;

  return isValid ? children : <Navigate to="/login" replace />;
}
