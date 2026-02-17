import { useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shirt, Sparkles, Gem, Footprints, Check, Camera,
  ArrowLeft, ArrowRight, Crown, Heart, Star, Zap,
  Flower2, Moon, Sun, CircleDot, Briefcase, Lock,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import FaceScanStep from "@/components/FaceScanStep";
import MakeupResultStep from "@/components/MakeupResultStep";
import { useAuth } from "@/contexts/AuthContext";

// ─── STEP TYPES ───
type FlowStep = "outfit" | "style" | "skin" | "brand" | "scan" | "result";

const stepLabels: { key: FlowStep; label: string }[] = [
  { key: "outfit", label: "Outfit" },
  { key: "style", label: "Style" },
  { key: "skin", label: "Skin" },
  { key: "brand", label: "Brand" },
  { key: "scan", label: "Face Scan" },
  { key: "result", label: "Results" },
];

// ─── TRANSITION VARIANTS ───
const pageVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 80 : -80,
    opacity: 0,
    scale: 0.97,
  }),
  center: { x: 0, opacity: 1, scale: 1 },
  exit: (direction: number) => ({
    x: direction < 0 ? 80 : -80,
    opacity: 0,
    scale: 0.97,
  }),
};

const pageTransition = {
  type: "spring" as const,
  stiffness: 350,
  damping: 35,
  mass: 0.8,
};

// ─── PRESET PALETTES ───
const presetPalettes = [
  {
    name: "Classic Noir",
    colors: ["hsl(0,0%,8%)", "hsl(0,0%,98%)", "hsl(0,70%,45%)", "hsl(42,60%,55%)"],
  },
  {
    name: "Soft Neutrals",
    colors: ["hsl(40,30%,90%)", "hsl(25,25%,75%)", "hsl(30,40%,60%)", "hsl(0,0%,55%)"],
  },
  {
    name: "Evening Glamour",
    colors: ["hsl(0,0%,8%)", "hsl(42,60%,55%)", "hsl(345,55%,30%)", "hsl(0,0%,75%)"],
  },
  {
    name: "Spring Garden",
    colors: ["hsl(350,40%,75%)", "hsl(140,15%,60%)", "hsl(0,0%,98%)", "hsl(25,25%,75%)"],
  },
];

// ─── OUTFIT CATEGORIES ───
interface OutfitCategory {
  id: string;
  label: string;
  icon: React.ElementType;
  colors: { name: string; value: string }[];
}

const categories: OutfitCategory[] = [
  {
    id: "top", label: "Top", icon: Shirt,
    colors: [
      { name: "White", value: "hsl(0,0%,98%)" }, { name: "Black", value: "hsl(0,0%,8%)" },
      { name: "Navy", value: "hsl(220,50%,22%)" }, { name: "Red", value: "hsl(0,70%,45%)" },
      { name: "Blush", value: "hsl(350,40%,75%)" }, { name: "Camel", value: "hsl(30,40%,60%)" },
      { name: "Olive", value: "hsl(85,25%,40%)" }, { name: "Burgundy", value: "hsl(345,55%,30%)" },
      { name: "Cream", value: "hsl(40,30%,90%)" }, { name: "Grey", value: "hsl(0,0%,55%)" },
      { name: "Sage", value: "hsl(140,15%,60%)" }, { name: "Cobalt", value: "hsl(215,65%,45%)" },
    ],
  },
  {
    id: "long_pant", label: "Long Pant", icon: Shirt,
    colors: [
      { name: "Black", value: "hsl(0,0%,8%)" }, { name: "White", value: "hsl(0,0%,98%)" },
      { name: "Denim", value: "hsl(215,40%,50%)" }, { name: "Navy", value: "hsl(220,50%,22%)" },
      { name: "Khaki", value: "hsl(40,30%,55%)" }, { name: "Grey", value: "hsl(0,0%,55%)" },
      { name: "Olive", value: "hsl(85,25%,40%)" }, { name: "Camel", value: "hsl(30,40%,60%)" },
      { name: "Burgundy", value: "hsl(345,55%,30%)" }, { name: "Cream", value: "hsl(40,30%,90%)" },
      { name: "Tan", value: "hsl(35,35%,65%)" }, { name: "Charcoal", value: "hsl(0,0%,25%)" },
    ],
  },
  {
    id: "skirt", label: "Skirt", icon: Shirt,
    colors: [
      { name: "Black", value: "hsl(0,0%,8%)" }, { name: "White", value: "hsl(0,0%,98%)" },
      { name: "Blush", value: "hsl(350,40%,75%)" }, { name: "Red", value: "hsl(0,70%,45%)" },
      { name: "Navy", value: "hsl(220,50%,22%)" }, { name: "Denim", value: "hsl(215,40%,50%)" },
      { name: "Plaid", value: "hsl(10,35%,45%)" }, { name: "Nude", value: "hsl(25,25%,75%)" },
      { name: "Emerald", value: "hsl(155,45%,35%)" }, { name: "Cream", value: "hsl(40,30%,90%)" },
      { name: "Mauve", value: "hsl(310,20%,55%)" }, { name: "Camel", value: "hsl(30,40%,60%)" },
    ],
  },
  {
    id: "dress", label: "Dress", icon: Shirt,
    colors: [
      { name: "Black", value: "hsl(0,0%,8%)" }, { name: "White", value: "hsl(0,0%,98%)" },
      { name: "Red", value: "hsl(0,70%,45%)" }, { name: "Navy", value: "hsl(220,50%,22%)" },
      { name: "Blush", value: "hsl(350,40%,75%)" }, { name: "Emerald", value: "hsl(155,45%,35%)" },
      { name: "Gold", value: "hsl(42,60%,55%)" }, { name: "Burgundy", value: "hsl(345,55%,30%)" },
      { name: "Nude", value: "hsl(25,25%,75%)" }, { name: "Cobalt", value: "hsl(215,65%,45%)" },
      { name: "Champagne", value: "hsl(38,35%,78%)" }, { name: "Lavender", value: "hsl(270,30%,70%)" },
    ],
  },
  {
    id: "shoes", label: "Shoes", icon: Footprints,
    colors: [
      { name: "Black", value: "hsl(0,0%,8%)" }, { name: "White", value: "hsl(0,0%,98%)" },
      { name: "Nude", value: "hsl(25,25%,75%)" }, { name: "Red", value: "hsl(0,70%,45%)" },
      { name: "Gold", value: "hsl(42,60%,55%)" }, { name: "Silver", value: "hsl(0,0%,75%)" },
      { name: "Brown", value: "hsl(25,40%,35%)" }, { name: "Tan", value: "hsl(35,35%,55%)" },
      { name: "Navy", value: "hsl(220,50%,22%)" }, { name: "Blush", value: "hsl(350,40%,75%)" },
      { name: "Snake", value: "hsl(35,15%,50%)" }, { name: "Leopard", value: "hsl(30,35%,45%)" },
    ],
  },
  {
    id: "handbag", label: "Handbag", icon: Briefcase,
    colors: [
      { name: "Black", value: "hsl(0,0%,8%)" }, { name: "White", value: "hsl(0,0%,98%)" },
      { name: "Tan", value: "hsl(35,35%,55%)" }, { name: "Brown", value: "hsl(25,40%,35%)" },
      { name: "Red", value: "hsl(0,70%,45%)" }, { name: "Nude", value: "hsl(25,25%,75%)" },
      { name: "Gold", value: "hsl(42,60%,55%)" }, { name: "Navy", value: "hsl(220,50%,22%)" },
      { name: "Cream", value: "hsl(40,30%,90%)" }, { name: "Blush", value: "hsl(350,40%,75%)" },
      { name: "Olive", value: "hsl(85,25%,40%)" }, { name: "Burgundy", value: "hsl(345,55%,30%)" },
    ],
  },
  {
    id: "jewelry", label: "Jewelry", icon: Gem,
    colors: [
      { name: "Gold", value: "hsl(42,60%,55%)" }, { name: "Silver", value: "hsl(0,0%,75%)" },
      { name: "Rose Gold", value: "hsl(15,45%,65%)" }, { name: "Pearl", value: "hsl(40,20%,90%)" },
      { name: "Diamond", value: "hsl(210,10%,88%)" }, { name: "Emerald", value: "hsl(155,55%,40%)" },
      { name: "Ruby", value: "hsl(350,65%,40%)" }, { name: "Sapphire", value: "hsl(220,65%,40%)" },
      { name: "Onyx", value: "hsl(0,0%,10%)" }, { name: "Turquoise", value: "hsl(175,50%,50%)" },
      { name: "Amethyst", value: "hsl(275,40%,50%)" }, { name: "Coral", value: "hsl(15,65%,60%)" },
    ],
  },
];

// ─── STYLE VIBES ───
const styleVibes = [
  { id: "luxury", label: "Luxury", icon: Crown, desc: "Opulent & refined" },
  { id: "classy", label: "Classy", icon: Star, desc: "Timeless sophistication" },
  { id: "elegant", label: "Elegant", icon: Gem, desc: "Graceful & polished" },
  { id: "soft_glam", label: "Soft Glam", icon: Flower2, desc: "Effortless radiance" },
  { id: "natural", label: "Natural", icon: Sun, desc: "Barely-there beauty" },
  { id: "party", label: "Party", icon: Zap, desc: "Bold & dazzling" },
  { id: "clean_girl", label: "Clean Girl", icon: Moon, desc: "Dewy & minimal" },
  { id: "bold", label: "Bold", icon: Heart, desc: "Statement-making" },
];

// ─── SKIN TONES ───
const skinTones = [
  { name: "Very Light", color: "hsl(30, 45%, 92%)", undertone: "Porcelain" },
  { name: "Light", color: "hsl(28, 40%, 82%)", undertone: "Ivory" },
  { name: "Medium", color: "hsl(25, 38%, 65%)", undertone: "Warm Beige" },
  { name: "Tan", color: "hsl(22, 35%, 52%)", undertone: "Golden" },
  { name: "Brown", color: "hsl(20, 38%, 40%)", undertone: "Caramel" },
  { name: "Dark", color: "hsl(18, 35%, 28%)", undertone: "Espresso" },
  { name: "Deep Dark", color: "hsl(16, 30%, 18%)", undertone: "Ebony" },
];

// ─── BRANDS ───
const brands = [
  { id: "fenty", name: "Fenty Beauty", tagline: "Beauty for all" },
  { id: "dior", name: "Dior Beauty", tagline: "French luxury" },
  { id: "sephora", name: "Sephora Collection", tagline: "Expert curation" },
  { id: "rare", name: "Rare Beauty", tagline: "By Selena Gomez" },
  { id: "mac", name: "MAC", tagline: "Professional artistry" },
  { id: "none", name: "No Preference", tagline: "Show me everything" },
];

// ─── MAIN COMPONENT ───
const StylingFlowPage = () => {
  const navigate = useNavigate();
  const { user, subscribed } = useAuth();
  const [currentStep, setCurrentStep] = useState<FlowStep>("outfit");
  const [direction, setDirection] = useState(1);

  // State for each step
  const [outfitSelections, setOutfitSelections] = useState<Record<string, string | null>>({});
  const [expandedCategory, setExpandedCategory] = useState<string | null>("top");
  const [selectedVibe, setSelectedVibe] = useState<string | null>(null);
  const [selectedSkin, setSelectedSkin] = useState<number | null>(null);
  const [autoDetect, setAutoDetect] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
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
      navigate("/");
    }
  }, [currentStep, navigate]);

  const canProceed = () => {
    switch (currentStep) {
      case "outfit":
        return Object.values(outfitSelections).filter(Boolean).length >= 1;
      case "style":
        return selectedVibe !== null;
      case "skin":
        return selectedSkin !== null || autoDetect;
      case "brand":
        return selectedBrand !== null;
      case "scan":
      case "result":
        return false; // These steps have their own CTAs
      default:
        return false;
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
    setCapturedImage(null);
    setEnhancedImage(null);
  };

  // Generate makeup config dynamically from outfit + style + skin + brand
  const makeupConfig = useMemo(() => {
    const outfitColors = Object.values(outfitSelections).filter(Boolean) as string[];
    const skinColor = selectedSkin !== null ? skinTones[selectedSkin].color : "hsl(25, 38%, 65%)";
    const style = selectedVibe || "elegant";

    // Parse outfit colors to extract dominant hue info
    const parseHSL = (hsl: string): [number, number, number] => {
      const m = hsl.match(/hsl\((\d+),?\s*(\d+)%,?\s*(\d+)%\)/);
      return m ? [parseInt(m[1]), parseInt(m[2]), parseInt(m[3])] : [0, 0, 50];
    };

    // Find the most chromatic outfit color (highest saturation, skip neutrals)
    let dominantHue = -1;
    let dominantSat = 0;
    let dominantLight = 50;
    outfitColors.forEach((c) => {
      const [h, s, l] = parseHSL(c);
      if (s > dominantSat && s > 10) {
        dominantHue = h;
        dominantSat = s;
        dominantLight = l;
      }
    });

    const hasColorfulOutfit = dominantHue >= 0 && dominantSat > 15;
    const isWarmOutfit = hasColorfulOutfit && (dominantHue <= 50 || dominantHue >= 330);
    const isCoolOutfit = hasColorfulOutfit && dominantHue > 180 && dominantHue < 330;
    const isRedFamily = hasColorfulOutfit && (dominantHue <= 15 || dominantHue >= 340);
    const isPinkFamily = hasColorfulOutfit && dominantHue >= 320 && dominantHue <= 360;
    const isBlueFamily = hasColorfulOutfit && dominantHue >= 200 && dominantHue <= 260;
    const isGreenFamily = hasColorfulOutfit && dominantHue >= 80 && dominantHue <= 170;

    // Skin undertone detection from skin tone
    const [, , skinL] = parseHSL(skinColor);
    const isLightSkin = skinL > 65;
    const isDarkSkin = skinL < 35;

    // Base makeup palettes per style
    const basePalettes: Record<string, { lip: [number, number, number]; eye: [number, number, number]; blush: [number, number, number] }> = {
      luxury:     { lip: [350, 60, 40], eye: [38, 50, 65], blush: [12, 50, 65] },
      classy:     { lip: [5, 45, 55],   eye: [25, 30, 60], blush: [15, 45, 70] },
      elegant:    { lip: [345, 50, 45], eye: [280, 20, 55], blush: [350, 35, 72] },
      soft_glam:  { lip: [10, 45, 62],  eye: [38, 45, 70], blush: [18, 55, 72] },
      natural:    { lip: [15, 30, 65],  eye: [30, 20, 72], blush: [20, 30, 75] },
      party:      { lip: [340, 70, 45], eye: [270, 45, 50], blush: [345, 55, 65] },
      clean_girl: { lip: [15, 25, 68],  eye: [30, 15, 72], blush: [18, 30, 75] },
      bold:       { lip: [0, 75, 42],   eye: [220, 50, 40], blush: [345, 50, 60] },
    };

    let { lip, eye, blush } = basePalettes[style] || basePalettes.elegant;

    // ── Adapt to outfit colors ──
    if (hasColorfulOutfit) {
      if (isRedFamily) {
        // Red outfit → complementary elegant red lip, warm gold eyes
        lip = [dominantHue, Math.min(lip[1] + 10, 80), lip[2]];
        eye = [38, 45, 68]; // Warm gold to complement red
        blush = [12, 45, 70]; // Warm peach blush
      } else if (isPinkFamily) {
        // Pink outfit → matching soft pink lip, rose-toned eyes
        lip = [350, 45, 58];
        eye = [330, 25, 68]; // Rose shimmer
        blush = [345, 40, 72]; // Soft rose blush
      } else if (isBlueFamily) {
        // Blue outfit → nude/berry lip contrasts well, cool-toned eyes
        lip = style === "bold" ? [340, 65, 42] : [8, 40, 60]; // Berry or warm nude
        eye = [Math.max(dominantHue - 20, 200), 30, 58]; // Cool-toned eyeshadow
        blush = [350, 35, 72]; // Cool pink blush
      } else if (isGreenFamily) {
        // Green outfit → warm earthy tones, berry or nude lip
        lip = style === "bold" ? [345, 60, 42] : [12, 40, 58];
        eye = [35, 40, 62]; // Bronze/warm brown
        blush = [15, 45, 70]; // Warm peach
      } else if (isWarmOutfit) {
        // Other warm tones → complementary warm makeup
        lip = [Math.max(dominantHue - 15, 0), 50, 52];
        eye = [35, 40, 65]; // Gold/bronze
        blush = [15, 50, 68];
      } else if (isCoolOutfit) {
        // Other cool tones → cool-toned makeup
        lip = [350, 50, 50]; // Mauve/berry
        eye = [280, 25, 60]; // Soft purple
        blush = [340, 35, 72]; // Cool pink
      }
    }

    // ── Adjust intensity per style ──
    if (style === "natural" || style === "clean_girl") {
      // Pull everything toward skin tone, desaturate
      lip[1] = Math.max(lip[1] - 20, 15);
      lip[2] = Math.min(lip[2] + 10, 72);
      eye[1] = Math.max(eye[1] - 15, 10);
      eye[2] = Math.min(eye[2] + 8, 75);
      blush[1] = Math.max(blush[1] - 15, 10);
    } else if (style === "bold" || style === "party") {
      // Intensify
      lip[1] = Math.min(lip[1] + 15, 85);
      lip[2] = Math.max(lip[2] - 5, 35);
      eye[1] = Math.min(eye[1] + 10, 70);
    }

    // ── Skin tone adjustments ──
    if (isLightSkin) {
      // Slightly softer shades for very light skin
      lip[2] = Math.min(lip[2] + 5, 65);
      blush[2] = Math.min(blush[2] + 5, 78);
    } else if (isDarkSkin) {
      // Richer, deeper shades for dark skin
      lip[2] = Math.max(lip[2] - 8, 30);
      lip[1] = Math.min(lip[1] + 10, 80);
      eye[2] = Math.max(eye[2] - 5, 35);
      blush[1] = Math.min(blush[1] + 10, 65);
    }

    return {
      lipColor: `hsl(${lip[0]}, ${lip[1]}%, ${lip[2]}%)`,
      eyeshadowColor: `hsl(${eye[0]}, ${eye[1]}%, ${eye[2]}%)`,
      blushColor: `hsl(${blush[0]}, ${blush[1]}%, ${blush[2]}%)`,
      skinTone: skinColor,
      style,
    };
  }, [outfitSelections, selectedVibe, selectedSkin]);

  // Generate product recommendations
  const makeupResults = useMemo(() => {
    const brandName = brands.find((b) => b.id === selectedBrand)?.name || "";
    const prefix = brandName && brandName !== "No Preference" ? `${brandName} ` : "";

    return [
      { area: "Lips", product: `${prefix}Satin Lip Color`, shade: makeupConfig.lipColor, tip: "Apply from center outward for a plush, dimensional finish" },
      { area: "Eyes", product: `${prefix}Luminous Eye Shadow`, shade: makeupConfig.eyeshadowColor, tip: "Blend across the lid and softly into the crease" },
      { area: "Cheeks", product: `${prefix}Silk Blush`, shade: makeupConfig.blushColor, tip: "Smile and sweep onto the apples, blending upward" },
      { area: "Base", product: `${prefix}Radiant Foundation`, shade: makeupConfig.skinTone, tip: "Apply with a damp beauty sponge for a dewy, skin-like finish" },
    ];
  }, [makeupConfig, selectedBrand]);

  const handleScanComplete = useCallback(async (capturedImageBase64: string) => {
    setCapturedImage(capturedImageBase64);
    setDirection(1);
    setCurrentStep("result");
    setIsEnhancing(true);

    try {
      const { data, error } = await supabase.functions.invoke("enhance-beauty", {
        body: {
          imageBase64: capturedImageBase64,
          makeupConfig,
          style: selectedVibe || "elegant",
        },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      setEnhancedImage(data.enhancedImage);
    } catch (err: any) {
      console.error("Enhancement error:", err);
      toast.error(err.message || "Failed to enhance image. Your original capture is shown.");
    } finally {
      setIsEnhancing(false);
    }
  }, [makeupConfig, selectedVibe]);

  const selectColor = (categoryId: string, colorValue: string) => {
    setOutfitSelections((prev) => ({
      ...prev,
      [categoryId]: prev[categoryId] === colorValue ? null : colorValue,
    }));
  };

  const applyPreset = (colors: string[]) => {
    const catIds = ["top", "long_pant", "shoes", "handbag"];
    const newSelections: Record<string, string | null> = {};
    colors.forEach((c, i) => {
      if (catIds[i]) newSelections[catIds[i]] = c;
    });
    setOutfitSelections((prev) => ({ ...prev, ...newSelections }));
  };

  const selectedColorCount = Object.values(outfitSelections).filter(Boolean).length;

  return (
    <div className="min-h-screen pb-24 safe-top bg-background">
      {/* ─── HEADER ─── */}
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

      {/* ─── PROGRESS BAR ─── */}
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

      {/* ─── STEP CONTENT ─── */}
      <AnimatePresence mode="wait" custom={direction}>
        {/* ═══ OUTFIT STEP ═══ */}
        {currentStep === "outfit" && (
          <motion.div
            key="outfit"
            custom={direction}
            variants={pageVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={pageTransition}
            className="px-5"
          >
            {/* Preset Palettes */}
            <div className="mb-5">
              <p className="font-body text-[10px] uppercase tracking-widest text-muted-foreground mb-3">
                Quick Palettes
              </p>
              <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-hide">
                {presetPalettes.map((palette) => (
                  <button
                    key={palette.name}
                    onClick={() => applyPreset(palette.colors)}
                    className="flex-shrink-0 rounded-xl border border-border bg-card p-3 hover:border-gold/40 transition-all"
                  >
                    <div className="flex gap-1 mb-2">
                      {palette.colors.map((c, i) => (
                        <div
                          key={i}
                          className="w-6 h-6 rounded-full border border-border/50"
                          style={{ backgroundColor: c }}
                        />
                      ))}
                    </div>
                    <p className="font-body text-[10px] text-muted-foreground whitespace-nowrap">
                      {palette.name}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Selected preview bar */}
            {selectedColorCount > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="mb-4 p-3 rounded-xl bg-card border border-gold/20"
              >
                <div className="flex items-center justify-between">
                  <span className="font-body text-xs text-muted-foreground">
                    {selectedColorCount} {selectedColorCount === 1 ? "piece" : "pieces"}
                  </span>
                  <div className="flex -space-x-1.5">
                    {Object.values(outfitSelections)
                      .filter(Boolean)
                      .map((color, i) => (
                        <div
                          key={i}
                          className="w-6 h-6 rounded-full border-2 border-card shadow-sm"
                          style={{ backgroundColor: color! }}
                        />
                      ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Categories */}
            <div className="space-y-2 max-h-[55vh] overflow-y-auto pb-4 -mx-1 px-1">
              {categories.map((cat) => {
                const Icon = cat.icon;
                const isExpanded = expandedCategory === cat.id;
                const selectedColor = outfitSelections[cat.id];

                return (
                  <div
                    key={cat.id}
                    className={`rounded-2xl border overflow-hidden transition-all duration-300 ${
                      selectedColor
                        ? "border-gold/30 bg-card"
                        : isExpanded
                        ? "border-border bg-card"
                        : "border-border/60 bg-card/40"
                    }`}
                  >
                    <button
                      onClick={() =>
                        setExpandedCategory(isExpanded ? null : cat.id)
                      }
                      className="w-full flex items-center gap-3 p-3.5"
                    >
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                          selectedColor ? "gradient-gold" : "bg-muted"
                        }`}
                      >
                        {selectedColor ? (
                          <Check size={14} className="text-foreground" />
                        ) : (
                          <Icon size={14} className="text-muted-foreground" />
                        )}
                      </div>
                      <div className="flex-1 text-left">
                        <p className="font-display text-sm font-medium text-foreground leading-tight">
                          {cat.label}
                        </p>
                        {selectedColor && (
                          <p className="font-body text-[10px] text-muted-foreground">
                            {cat.colors.find((c) => c.value === selectedColor)?.name}
                          </p>
                        )}
                      </div>
                      {selectedColor && (
                        <div
                          className="w-6 h-6 rounded-full border-2 border-border shadow-sm"
                          style={{ backgroundColor: selectedColor }}
                        />
                      )}
                      <motion.div
                        animate={{ rotate: isExpanded ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                        className="text-muted-foreground"
                      >
                        <CircleDot size={14} />
                      </motion.div>
                    </button>

                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3, ease: "easeInOut" }}
                          className="overflow-hidden"
                        >
                          <div className="px-3.5 pb-3.5 pt-1">
                            <div className="grid grid-cols-6 gap-2">
                              {cat.colors.map((color) => {
                                const isSelected = outfitSelections[cat.id] === color.value;
                                return (
                                  <button
                                    key={color.name}
                                    onClick={() => selectColor(cat.id, color.value)}
                                    className="flex flex-col items-center gap-1"
                                  >
                                    <div className={`relative`}>
                                      <div
                                        className={`w-10 h-10 rounded-full border-2 shadow-sm transition-all ${
                                          isSelected
                                            ? "border-gold scale-110 shadow-md"
                                            : "border-border/50 hover:scale-105"
                                        }`}
                                        style={{ backgroundColor: color.value }}
                                      />
                                      {isSelected && (
                                        <motion.div
                                          initial={{ scale: 0 }}
                                          animate={{ scale: 1 }}
                                          className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full gradient-gold flex items-center justify-center"
                                        >
                                          <Check size={8} className="text-foreground" />
                                        </motion.div>
                                      )}
                                    </div>
                                    <span className="font-body text-[8px] text-muted-foreground leading-tight text-center">
                                      {color.name}
                                    </span>
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* ═══ STYLE VIBE STEP ═══ */}
        {currentStep === "style" && (
          <motion.div
            key="style"
            custom={direction}
            variants={pageVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={pageTransition}
            className="px-5"
          >
            <p className="font-body text-sm text-muted-foreground mb-5">
              What's your vibe today?
            </p>
            <div className="grid grid-cols-2 gap-3">
              {styleVibes.map((vibe, i) => {
                const Icon = vibe.icon;
                const isSelected = selectedVibe === vibe.id;
                return (
                  <motion.button
                    key={vibe.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    onClick={() => setSelectedVibe(isSelected ? null : vibe.id)}
                    className={`relative rounded-2xl p-5 text-left border-2 transition-all duration-300 ${
                      isSelected
                        ? "border-gold bg-card shadow-lg shadow-gold/5"
                        : "border-border/60 bg-card/40 hover:border-border"
                    }`}
                  >
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 transition-all ${
                        isSelected ? "gradient-gold" : "bg-muted"
                      }`}
                    >
                      <Icon
                        size={18}
                        className={isSelected ? "text-foreground" : "text-muted-foreground"}
                      />
                    </div>
                    <p className="font-display text-sm font-semibold text-foreground">
                      {vibe.label}
                    </p>
                    <p className="font-body text-[10px] text-muted-foreground mt-0.5">
                      {vibe.desc}
                    </p>
                    {isSelected && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute top-3 right-3 w-5 h-5 rounded-full gradient-gold flex items-center justify-center"
                      >
                        <Check size={10} className="text-foreground" />
                      </motion.div>
                    )}
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* ═══ SKIN TONE STEP ═══ */}
        {currentStep === "skin" && (
          <motion.div
            key="skin"
            custom={direction}
            variants={pageVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={pageTransition}
            className="px-5"
          >
            <p className="font-body text-sm text-muted-foreground mb-5">
              Select the closest match to your skin tone
            </p>

            {/* Skin tone gradient bar */}
            <div className="mb-6 rounded-2xl overflow-hidden border border-border">
              <div className="flex h-3">
                {skinTones.map((t) => (
                  <div
                    key={t.name}
                    className="flex-1"
                    style={{ backgroundColor: t.color }}
                  />
                ))}
              </div>
            </div>

            {/* Skin tone cards */}
            <div className="space-y-2 mb-6">
              {skinTones.map((tone, i) => {
                const isSelected = selectedSkin === i && !autoDetect;
                return (
                  <motion.button
                    key={tone.name}
                    initial={{ opacity: 0, x: 15 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                    onClick={() => {
                      setSelectedSkin(i);
                      setAutoDetect(false);
                    }}
                    className={`w-full flex items-center gap-4 p-3.5 rounded-2xl border-2 transition-all duration-300 ${
                      isSelected
                        ? "border-gold bg-card shadow-lg shadow-gold/5"
                        : "border-border/50 bg-card/30 hover:bg-card/60"
                    }`}
                  >
                    <div className="relative">
                      <div
                        className={`w-12 h-12 rounded-full border-2 transition-all ${
                          isSelected ? "border-gold shadow-md" : "border-border/60"
                        }`}
                        style={{ backgroundColor: tone.color }}
                      />
                      {isSelected && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full gradient-gold flex items-center justify-center"
                        >
                          <Check size={10} className="text-foreground" />
                        </motion.div>
                      )}
                    </div>
                    <div className="text-left">
                      <p className="font-display text-sm font-medium text-foreground">
                        {tone.name}
                      </p>
                      <p className="font-body text-[10px] text-muted-foreground">
                        {tone.undertone}
                      </p>
                    </div>
                  </motion.button>
                );
              })}
            </div>

            {/* Auto detect option */}
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.35 }}
              onClick={() => {
                setAutoDetect(true);
                setSelectedSkin(null);
              }}
              className={`w-full flex items-center gap-3 p-4 rounded-2xl border-2 transition-all duration-300 ${
                autoDetect
                  ? "border-gold bg-card shadow-lg shadow-gold/5"
                  : "border-dashed border-border/60 bg-card/20 hover:border-border"
              }`}
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  autoDetect ? "gradient-gold" : "bg-muted"
                }`}
              >
                <Camera
                  size={18}
                  className={autoDetect ? "text-foreground" : "text-muted-foreground"}
                />
              </div>
              <div className="text-left">
                <p className="font-display text-sm font-medium text-foreground">
                  Auto-detect later
                </p>
                <p className="font-body text-[10px] text-muted-foreground">
                  Use camera to find your perfect match
                </p>
              </div>
              {autoDetect && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="ml-auto w-5 h-5 rounded-full gradient-gold flex items-center justify-center"
                >
                  <Check size={10} className="text-foreground" />
                </motion.div>
              )}
            </motion.button>
          </motion.div>
        )}

        {/* ═══ BRAND STEP ═══ */}
        {currentStep === "brand" && (
          <motion.div
            key="brand"
            custom={direction}
            variants={pageVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={pageTransition}
            className="px-5"
          >
            <p className="font-body text-sm text-muted-foreground mb-5">
              Choose your preferred beauty house
            </p>
            <div className="space-y-2">
              {brands.map((brand, i) => {
                const isSelected = selectedBrand === brand.id;
                return (
                  <motion.button
                    key={brand.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.06 }}
                    onClick={() => setSelectedBrand(isSelected ? null : brand.id)}
                    className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all duration-300 ${
                      isSelected
                        ? "border-gold bg-card shadow-lg shadow-gold/5"
                        : "border-border/50 bg-card/30 hover:bg-card/60"
                    }`}
                  >
                    <div
                      className={`w-11 h-11 rounded-xl flex items-center justify-center font-display text-base font-bold transition-all ${
                        isSelected
                          ? "gradient-gold text-foreground"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {brand.name.charAt(0)}
                    </div>
                    <div className="text-left flex-1">
                      <p className="font-display text-sm font-semibold text-foreground">
                        {brand.name}
                      </p>
                      <p className="font-body text-[10px] text-muted-foreground">
                        {brand.tagline}
                      </p>
                    </div>
                    {isSelected && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="w-5 h-5 rounded-full gradient-gold flex items-center justify-center"
                      >
                        <Check size={10} className="text-foreground" />
                      </motion.div>
                    )}
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        )}
        {/* ═══ FACE SCAN STEP ═══ */}
        {currentStep === "scan" && (
          <motion.div
            key="scan"
            custom={direction}
            variants={pageVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={pageTransition}
            className="px-5"
          >
            <p className="font-body text-sm text-muted-foreground mb-5">
              Position your face in the frame for live makeup preview
            </p>
            <FaceScanStep
              makeupConfig={makeupConfig}
              onScanComplete={handleScanComplete}
            />
          </motion.div>
        )}

        {/* ═══ RESULT STEP ═══ */}
        {currentStep === "result" && (
          <motion.div
            key="result"
            custom={direction}
            variants={pageVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={pageTransition}
            className="px-5"
          >
            <MakeupResultStep
              results={makeupResults}
              style={selectedVibe || ""}
              brand={selectedBrand || ""}
              onStartOver={handleStartOver}
              capturedImage={capturedImage}
              enhancedImage={enhancedImage}
              isEnhancing={isEnhancing}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── BOTTOM CTA ─── */}
      {currentStep !== "scan" && currentStep !== "result" && (
        <div className="fixed bottom-20 left-0 right-0 px-5 z-40 max-w-lg mx-auto">
          <motion.button
            onClick={currentStep === "brand" ? handleFinish : goNext}
            disabled={!canProceed()}
            className={`w-full py-4 rounded-2xl font-display text-base font-medium tracking-wide transition-all duration-300 flex items-center justify-center gap-2 ${
              canProceed()
                ? "gradient-gold text-foreground shadow-lg shadow-gold/20"
                : "bg-muted text-muted-foreground"
            }`}
            whileTap={canProceed() ? { scale: 0.98 } : {}}
          >
            {currentStep === "brand" ? (
              <>
                {(!user || !subscribed) ? <Lock size={18} /> : <Camera size={18} />}
                {(!user || !subscribed) ? "Unlock Face Scan — Pro" : "Start Face Scan"}
              </>
            ) : (
              <>
                Continue
                <ArrowRight size={16} />
              </>
            )}
          </motion.button>
        </div>
      )}
    </div>
  );
};

export default StylingFlowPage;
