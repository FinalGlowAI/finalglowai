import { useState, useCallback, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, Camera, Lock } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import FaceScanStep from "@/components/FaceScanStep";
import MakeupResultStep from "@/components/MakeupResultStep";
import PaletteStep from "@/components/PaletteStep";
import { generatePalettes } from "@/lib/makeupPalettes";
import { useAuth } from "@/contexts/AuthContext";
import {
  FlowStep, stepLabels, pageVariants, pageTransition,
  presetPalettes, categories, skinTones, brands,
} from "./styling/flowConstants";
import OutfitStep from "./styling/steps/OutfitStep";
import StyleVibeStep from "./styling/steps/StyleVibeStep";
import SkinToneStep from "./styling/steps/SkinToneStep";
import BrandStep from "./styling/steps/BrandStep";

const StylingFlowPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, subscribed, checkSubscription } = useAuth();

  useEffect(() => {
    if (searchParams.get("subscribed") === "true") {
      checkSubscription().then(() => {
        toast.success("Welcome to FinalGlow Pro! ✨");
      });
      navigate("/outfit", { replace: true });
    }
  }, [searchParams]);

  const [currentStep, setCurrentStep] = useState<FlowStep>("outfit");
  const [direction, setDirection] = useState(1);

  const [outfitSelections, setOutfitSelections] = useState<Record<string, string | null>>({});
  const [expandedCategory, setExpandedCategory] = useState<string | null>("top");
  const [selectedVibe, setSelectedVibe] = useState<string | null>(null);
  const [selectedSkin, setSelectedSkin] = useState<number | null>(null);
  const [autoDetect, setAutoDetect] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
  const [makeupIntensity, setMakeupIntensity] = useState(50);
  const [selectedPaletteId, setSelectedPaletteId] = useState<string | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [enhancedImage, setEnhancedImage] = useState<string | null>(null);
  const [isEnhancing, setIsEnhancing] = useState(false);

  const currentStepIndex = stepLabels.findIndex((s) => s.key === currentStep);

  const goNext = useCallback(() => {
    const idx = stepLabels.findIndex((s) => s.key === currentStep);
    if (idx < stepLabels.length - 1) {
      setDirection(1);
      setCurrentStep(stepLabels[idx + 1].key);
    }
  }, [currentStep]);

  const goBack = useCallback(() => {
    const idx = stepLabels.findIndex((s) => s.key === currentStep);
    if (idx > 0) {
      setDirection(-1);
      setCurrentStep(stepLabels[idx - 1].key);
    } else {
      navigate("/home");
    }
  }, [currentStep, navigate]);

  const canProceed = () => {
    switch (currentStep) {
      case "outfit": return Object.values(outfitSelections).filter(Boolean).length >= 1;
      case "style":  return selectedVibe !== null;
      case "skin":   return selectedSkin !== null || autoDetect;
      case "brand":  return selectedBrand !== null;
      case "palette": return selectedPaletteId !== null;
      default: return false;
    }
  };

  const handleFinish = () => {
    if (!user) {
      toast("Sign in to see your look", { description: "Create a free account to unlock Face Scan" });
      navigate("/auth");
      return;
    }
    if (!subscribed) {
      toast("Pro subscription required", { description: "Upgrade to FinalGlow Pro to see your look" });
      navigate("/profile");
      return;
    }
    setDirection(1);
    setCurrentStep("scan");
  };

  const handleStartOver = () => {
    setDirection(-1);
    setCurrentStep("outfit");
    setOutfitSelections({});
    setSelectedVibe(null);
    setSelectedSkin(null);
    setAutoDetect(false);
    setSelectedBrand(null);
    setMakeupIntensity(50);
    setSelectedPaletteId(null);
    setCapturedImage(null);
    setEnhancedImage(null);
  };

  const skinColor = useMemo(
    () => (selectedSkin !== null ? skinTones[selectedSkin].color : "hsl(25, 38%, 65%)"),
    [selectedSkin],
  );

  const palettes = useMemo(() => {
    const outfitColors = Object.values(outfitSelections).filter(Boolean) as string[];
    return generatePalettes({ outfitColors, vibe: selectedVibe || "elegant", skinTone: skinColor });
  }, [outfitSelections, selectedVibe, skinColor]);

  useEffect(() => {
    if (currentStep === "palette" && !selectedPaletteId && palettes.length > 0) {
      setSelectedPaletteId(palettes[0].id);
    }
  }, [currentStep, palettes, selectedPaletteId]);

  useEffect(() => {
    setSelectedPaletteId(null);
  }, [outfitSelections, selectedVibe, selectedSkin]);

  const makeupConfig = useMemo(() => {
    const chosen = palettes.find((p) => p.id === selectedPaletteId) || palettes[0];
    return {
      lipColor: chosen.lipColor,
      eyeshadowColor: chosen.eyeshadowColor,
      blushColor: chosen.blushColor,
      skinTone: skinColor,
      style: selectedVibe || "elegant",
    };
  }, [palettes, selectedPaletteId, skinColor, selectedVibe]);

  const makeupResults = useMemo(() => {
    const brandName = brands.find((b) => b.id === selectedBrand)?.name || "";
    const prefix = brandName && brandName !== "No Preference" ? `${brandName} ` : "";
    return [
      { area: "Lips",   product: `${prefix}Satin Lip Color`,    shade: makeupConfig.lipColor,       tip: "Apply from center outward for a plush, dimensional finish" },
      { area: "Eyes",   product: `${prefix}Luminous Eye Shadow`, shade: makeupConfig.eyeshadowColor, tip: "Blend across the lid and softly into the crease" },
      { area: "Cheeks", product: `${prefix}Silk Blush`,          shade: makeupConfig.blushColor,     tip: "Smile and sweep onto the apples, blending upward" },
      { area: "Base",   product: `${prefix}Radiant Foundation`,  shade: makeupConfig.skinTone,       tip: "Apply with a damp beauty sponge for a dewy, skin-like finish" },
    ];
  }, [makeupConfig, selectedBrand]);

  const handleScanComplete = useCallback(async (capturedImageBase64: string) => {
    setCapturedImage(capturedImageBase64);
    setDirection(1);
    setCurrentStep("result");
    setIsEnhancing(true);
    try {
      const { data, error } = await supabase.functions.invoke("enhance-beauty", {
        body: { imageBase64: capturedImageBase64, makeupConfig, style: selectedVibe || "elegant", intensity: makeupIntensity },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setEnhancedImage(data.enhancedImage);
    } catch (err: unknown) {
      console.error("Enhancement error:", err);
      toast.error(err instanceof Error ? err.message : "Failed to enhance image. Your original capture is shown.");
    } finally {
      setIsEnhancing(false);
    }
  }, [makeupConfig, selectedVibe, makeupIntensity]);

  const selectColor = (categoryId: string, colorValue: string) => {
    setOutfitSelections((prev) => ({
      ...prev,
      [categoryId]: prev[categoryId] === colorValue ? null : colorValue,
    }));
  };

  const applyPreset = (colors: string[]) => {
    const catIds = ["top", "long_pant", "shoes", "handbag"];
    const newSelections: Record<string, string | null> = {};
    colors.forEach((c, i) => { if (catIds[i]) newSelections[catIds[i]] = c; });
    setOutfitSelections((prev) => ({ ...prev, ...newSelections }));
  };

  return (
    <div className="min-h-screen pb-24 safe-top bg-background">
      <div className="px-5 pt-14 pb-3 flex items-center gap-3">
        <button
          onClick={goBack}
          className="w-9 h-9 rounded-full bg-card border border-border flex items-center justify-center flex-shrink-0"
        >
          <ArrowLeft size={16} className="text-foreground" />
        </button>
        <div className="flex-1">
          <h1 className="font-display text-xl font-semibold text-foreground">
            {stepLabels[currentStepIndex].label}
          </h1>
        </div>
        <span className="font-body text-xs text-muted-foreground">
          {currentStepIndex + 1}/{stepLabels.length}
        </span>
      </div>

      <div className="px-5 mb-5">
        <div className="flex gap-1.5">
          {stepLabels.map((s, i) => (
            <div key={s.key} className="flex-1 h-[3px] rounded-full overflow-hidden bg-muted">
              <motion.div
                className="h-full gradient-gold"
                initial={false}
                animate={{ width: i <= currentStepIndex ? "100%" : "0%" }}
                transition={{ duration: 0.4, ease: "easeOut" }}
              />
            </div>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait" custom={direction}>
        {currentStep === "outfit" && (
          <motion.div key="outfit" custom={direction} variants={pageVariants} initial="enter" animate="center" exit="exit" transition={pageTransition} className="px-5">
            <OutfitStep
              categories={categories}
              presetPalettes={presetPalettes}
              outfitSelections={outfitSelections}
              expandedCategory={expandedCategory}
              onSelectColor={selectColor}
              onSetExpandedCategory={setExpandedCategory}
              onApplyPreset={applyPreset}
            />
          </motion.div>
        )}
        {currentStep === "style" && (
          <motion.div key="style" custom={direction} variants={pageVariants} initial="enter" animate="center" exit="exit" transition={pageTransition} className="px-5">
            <StyleVibeStep
              selectedVibe={selectedVibe}
              makeupIntensity={makeupIntensity}
              onSelectVibe={setSelectedVibe}
              onSetIntensity={setMakeupIntensity}
            />
          </motion.div>
        )}
        {currentStep === "skin" && (
          <motion.div key="skin" custom={direction} variants={pageVariants} initial="enter" animate="center" exit="exit" transition={pageTransition} className="px-5">
            <SkinToneStep
              selectedSkin={selectedSkin}
              autoDetect={autoDetect}
              onSelectSkin={setSelectedSkin}
              onSetAutoDetect={setAutoDetect}
            />
          </motion.div>
        )}
        {currentStep === "brand" && (
          <motion.div key="brand" custom={direction} variants={pageVariants} initial="enter" animate="center" exit="exit" transition={pageTransition} className="px-5">
            <BrandStep selectedBrand={selectedBrand} onSelectBrand={setSelectedBrand} />
          </motion.div>
        )}
        {currentStep === "palette" && (
          <motion.div key="palette" custom={direction} variants={pageVariants} initial="enter" animate="center" exit="exit" transition={pageTransition}>
            <PaletteStep palettes={palettes} selectedPaletteId={selectedPaletteId} onSelect={setSelectedPaletteId} skinTone={skinColor} />
          </motion.div>
        )}
        {currentStep === "scan" && (
          <motion.div key="scan" custom={direction} variants={pageVariants} initial="enter" animate="center" exit="exit" transition={pageTransition} className="px-5">
            <p className="font-body text-sm text-muted-foreground mb-5">
              Position your face in the frame for live makeup preview
            </p>
            <FaceScanStep makeupConfig={makeupConfig} onScanComplete={handleScanComplete} />
          </motion.div>
        )}
        {currentStep === "result" && (
          <motion.div key="result" custom={direction} variants={pageVariants} initial="enter" animate="center" exit="exit" transition={pageTransition} className="px-5">
            <MakeupResultStep
              results={makeupResults}
              style={selectedVibe || ""}
              brand={selectedBrand || ""}
              onStartOver={handleStartOver}
              capturedImage={capturedImage}
              enhancedImage={enhancedImage}
              isEnhancing={isEnhancing}
              selectedPalette={palettes.find((p) => p.id === selectedPaletteId) || palettes[0] || null}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {currentStep !== "scan" && currentStep !== "result" && (
        <div className="fixed bottom-20 left-0 right-0 px-5 z-40 max-w-lg mx-auto">
          <motion.button
            onClick={currentStep === "palette" ? handleFinish : goNext}
            disabled={!canProceed()}
            className={`w-full py-4 rounded-2xl font-display text-base font-medium tracking-wide transition-all duration-300 flex items-center justify-center gap-2 ${
              canProceed() ? "gradient-gold text-foreground shadow-lg shadow-gold/20" : "bg-muted text-muted-foreground"
            }`}
            whileTap={canProceed() ? { scale: 0.98 } : {}}
          >
            {currentStep === "palette" ? (
              <>
                {(!user || !subscribed) ? <Lock size={18} /> : <Camera size={18} />}
                {(!user || !subscribed) ? "Unlock Face Scan — Pro" : "Start Face Scan"}
              </>
            ) : (
              <>Continue <ArrowRight size={16} /></>
            )}
          </motion.button>
        </div>
      )}
    </div>
  );
};

export default StylingFlowPage;
