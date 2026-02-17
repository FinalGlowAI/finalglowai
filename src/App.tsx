import { useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import BottomNav from "./components/BottomNav";
import OnboardingPage from "./pages/OnboardingPage";
import HomePage from "./pages/HomePage";
import StylingFlowPage from "./pages/StylingFlowPage";
import StylistPage from "./pages/StylistPage";
import ColorAnalysisPage from "./pages/ColorAnalysisPage";
import ProfilePage from "./pages/ProfilePage";
import AuthPage from "./pages/AuthPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const AppContent = () => {
  const [showOnboarding, setShowOnboarding] = useState(true);

  return (
    <>
      {showOnboarding && (
        <OnboardingPage onComplete={() => setShowOnboarding(false)} />
      )}
      <div className="max-w-lg mx-auto relative">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/outfit" element={<StylingFlowPage />} />
          <Route path="/stylist" element={<StylistPage />} />
          <Route path="/colors" element={<ColorAnalysisPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <BottomNav />
      </div>
    </>
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
