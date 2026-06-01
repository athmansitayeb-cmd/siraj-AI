import { BrowserRouter } from "react-router-dom";
import AppRouter from "./AppRouter";
import { UIProvider } from "../ui/context/UIContext";
import { UIEventBridge } from "../ui/bridge/UIEventBridge";
import { AuthProvider } from "../auth/AuthContext";

export default function AppProviders() {
  return (
    <AuthProvider>
      <UIProvider>
        <BrowserRouter>
          <UIEventBridge />
          <AppRouter />
        </BrowserRouter>
      </UIProvider>
    </AuthProvider>
  );
}
