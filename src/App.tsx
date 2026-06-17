import { useState, Suspense, lazy, Component, ReactNode } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, HashRouter, Routes, Route, useLocation } from "react-router-dom";
import { Capacitor } from "@capacitor/core";
import { AuthProvider } from "./contexts/AuthContext";
import BottomNav from "./components/BottomNav";
import ProtectedRoute from "./components/ProtectedRoute";

// Lazy loading de toutes les pages
const OnboardingPage = lazy(() => import("./pages/OnboardingPage"));
const HomePage = lazy(() => import("./pages/HomePage"));
const StylingFlowPage = lazy(() => import("./pages/StylingFlowPage"));
const StylistPage = lazy(() => import("./pages/StylistPage"));
const ColorAnalysisPage = lazy(() => import("./pages/ColorAnalysisPage"));
const ProfilePage = lazy(() => import("./pages/ProfilePage"));
const CommunityPage = lazy(() => import("./pages/CommunityPage"));
const AuthPage = lazy(() => import("./pages/AuthPage"));
const ResetPasswordPage = lazy(() => import("./pages/ResetPasswordPage"));
const TermsPage = lazy(() => import("./pages/TermsPage"));
const PrivacyPage = lazy(() => import("./pages/PrivacyPage"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();
const AppRouter = Capacitor.isNativePlatform() ? HashRouter : BrowserRouter;

class AppErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    console.error("[App] Render failed", error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background px-6 text-center">
          <div className="max-w-sm space-y-4">
            <h1 className="font-display text-2xl text-foreground">FinalGlow AI</h1>
            <p className="font-body text-sm text-muted-foreground">
              The app could not finish loading. Please close and reopen it.
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const AppContent = () => {
  const [showOnboarding, setShowOnboarding] = useState(true);
  const location = useLocation();
  const isAuthPage = location.pathname === "/" || location.pathname === "/reset-password";

  return (
    <Suspense fallback={<div className="flex items-center justify-center h-screen">Chargement...</div>}>
      {showOnboarding && isAuthPage && (
        <OnboardingPage onComplete={() => setShowOnboarding(false)} />
      )}
      <div className="max-w-lg mx-auto relative">
        <Routes>
          <Route path="/" element={<AuthPage />} />
          <Route path="/home" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
          <Route path="/outfit" element={<ProtectedRoute><StylingFlowPage /></ProtectedRoute>} />
          <Route path="/stylist" element={<ProtectedRoute><StylistPage /></ProtectedRoute>} />
          <Route path="/colors" element={<ProtectedRoute><ColorAnalysisPage /></ProtectedRoute>} />
          <Route path="/community" element={<ProtectedRoute><CommunityPage /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        {!isAuthPage && <BottomNav />}
      </div>
    </Suspense>
  );
};

const App = () => (
  <AppErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <Toaster />
          <Sonner />
          <AppRouter>
            <AppContent />
          </AppRouter>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  </AppErrorBoundary>
);

export default App;
