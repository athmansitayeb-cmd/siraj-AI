import { BrowserRouter } from "react-router-dom";
import AppRouter from "./AppRouter";
import { UIProvider } from "../ui/context/UIContext";
import { AuthProvider } from "../auth/AuthContext";

export default function AppProviders() {
  return (
    <AuthProvider>
      <UIProvider>
        <BrowserRouter>
          <AppRouter />
        </BrowserRouter>
      </UIProvider>
    </AuthProvider>
  );
}
