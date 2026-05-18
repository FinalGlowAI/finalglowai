import { useState, Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import BottomNav from "./components/BottomNav";

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
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

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
          <Route path="/home" element={<HomePage />} />
          <Route path="/outfit" element={<StylingFlowPage />} />
          <Route path="/stylist" element={<StylistPage />} />
          <Route path="/colors" element={<ColorAnalysisPage />} />
          <Route path="/community" element={<CommunityPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        {!isAuthPage && <BottomNav />}
      </div>
    </Suspense>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
