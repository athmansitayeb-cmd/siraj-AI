import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
const [token, setToken] = useState(() =>
 localStorage.getItem("siraj_token")
);
 const [loading, setLoading] = useState(true);

 useEffect(() => {
 const saved = localStorage.getItem("siraj_token");
 if (saved) setToken(saved);
 setLoading(false);
 }, []);

 const login = (newToken) => {
 localStorage.setItem("siraj_token", newToken);
 setToken(newToken);
 };

const logout = () => {
 localStorage.removeItem("siraj_token");
 localStorage.removeItem("siraj_user");
 localStorage.removeItem("siraj_conversation");

 setToken(null);

 window.location.href = "/login";
};

const isAuthenticated =
 !!token || !!localStorage.getItem("siraj_token");

 return (
 <AuthContext.Provider value={{
 token,
 isAuthenticated,
 login,
 logout,
 loading
 }}>
 {children}
 </AuthContext.Provider>
 );
}

export const useAuth = () => {
 const ctx = useContext(AuthContext);

 if (!ctx) {
 throw new Error("useAuth must be used within AuthProvider");
 }

 return ctx;
};
