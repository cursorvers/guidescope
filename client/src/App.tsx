import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Router as WouterRouter, Switch } from "wouter";
import { useEffect } from "react";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { MinimalModeProvider } from "./contexts/MinimalModeContext";
import Home from "./pages/Home";
import Settings from "./pages/Settings";
import { EXTENDED_SETTINGS_UPDATED_EVENT, loadExtendedSettings } from "./lib/settings";

// Get base path from Vite config for GitHub Pages
const base = import.meta.env.BASE_URL || "/";

function Router() {
  return (
    <WouterRouter base={base.replace(/\/$/, "")}>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/settings" component={Settings} />
        <Route component={NotFound} />
      </Switch>
    </WouterRouter>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  useEffect(() => {
    const applyFontSize = () => {
      try {
        const { ui } = loadExtendedSettings();
        const root = document.documentElement;
        root.classList.remove("font-size-small", "font-size-large");
        if (ui.fontSize === "small") root.classList.add("font-size-small");
        if (ui.fontSize === "large") root.classList.add("font-size-large");
      } catch {
        // Ignore settings errors
      }
    };

    applyFontSize();

    const onUpdated = () => applyFontSize();
    window.addEventListener(EXTENDED_SETTINGS_UPDATED_EVENT, onUpdated);
    window.addEventListener("storage", onUpdated);
    return () => {
      window.removeEventListener(EXTENDED_SETTINGS_UPDATED_EVENT, onUpdated);
      window.removeEventListener("storage", onUpdated);
    };
  }, []);

  return (
    <ErrorBoundary>
      <MinimalModeProvider>
        <ThemeProvider
          defaultTheme="light"
          // switchable
        >
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </ThemeProvider>
      </MinimalModeProvider>
    </ErrorBoundary>
  );
}

export default App;
