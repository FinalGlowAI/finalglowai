import { useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import BottomNav from "./components/BottomNav";
import OnboardingPage from "./pages/OnboardingPage";
import HomePage from "./pages/HomePage";
import StylistPage from "./pages/StylistPage";
import OutfitColorPage from "./pages/OutfitColorPage";
import ColorAnalysisPage from "./pages/ColorAnalysisPage";
import ProfilePage from "./pages/ProfilePage";
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
          <Route path="/stylist" element={<StylistPage />} />
          <Route path="/outfit" element={<OutfitColorPage />} />
          <Route path="/colors" element={<ColorAnalysisPage />} />
          <Route path="/profile" element={<ProfilePage />} />
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
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
