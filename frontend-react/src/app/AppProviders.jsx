import { BrowserRouter } from "react-router-dom";
import AppRouter from "./AppRouter";

export default function AppProviders() {
  return (
    <BrowserRouter>
      <AppRouter />
    </BrowserRouter>
  );
}
