import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";

import AppProviders from "./app/AppProviders";
import { initTheme } from "./theme/theme";
import { initBrand } from "./ui/brand/brandEngine";
import { enforceTokens } from "./ui/governance/tokenGuard";
import { startUIScanner } from "./ui/governance/runtimeScanner";

initTheme();
initBrand();
enforceTokens();
startUIScanner();

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root")).render(
  <QueryClientProvider client={queryClient}>
    <AppProviders />
    <Toaster position="top-right" />
  </QueryClientProvider>
);
