import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, Camera, Sparkles, X, ChevronDown } from "lucide-react";

const skinTones = [
  { name: "Fair", color: "hsl(30, 40%, 88%)" },
  { name: "Light", color: "hsl(28, 35%, 78%)" },
  { name: "Medium", color: "hsl(25, 35%, 62%)" },
  { name: "Tan", color: "hsl(22, 30%, 50%)" },
  { name: "Deep", color: "hsl(20, 35%, 35%)" },
  { name: "Rich", color: "hsl(18, 30%, 25%)" },
];

const StylistPage = () => {
  const [step, setStep] = useState<"upload" | "skin" | "result">("upload");
  const [selectedSkin, setSelectedSkin] = useState<number | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setStep("skin");
    }
  };

  const handleAnalyze = () => {
    if (selectedSkin !== null) {
      setStep("result");
    }
  };

  const reset = () => {
    setStep("upload");
    setSelectedSkin(null);
    setPreviewUrl(null);
  };

  return (
    <div className="min-h-screen pb-24 safe-top">
      {/* Header */}
      <div className="px-5 pt-14 pb-4">
        <h1 className="font-display text-2xl font-semibold text-foreground">
          AI Stylist
        </h1>
        <p className="font-body text-sm text-muted-foreground mt-1">
          Upload your outfit to get matched makeup looks
        </p>
      </div>

      {/* Steps Indicator */}
      <div className="px-5 mb-6">
        <div className="flex items-center gap-2">
          {["Upload", "Skin Tone", "Results"].map((label, i) => {
            const stepIndex = i;
            const currentIndex = step === "upload" ? 0 : step === "skin" ? 1 : 2;
            const isActive = stepIndex <= currentIndex;
            return (
              <div key={label} className="flex items-center gap-2 flex-1">
                <div className="flex-1 h-0.5 rounded-full overflow-hidden bg-muted">
                  <motion.div
                    className="h-full gradient-gold"
                    initial={{ width: "0%" }}
                    animate={{ width: isActive ? "100%" : "0%" }}
                    transition={{ duration: 0.4 }}
                  />
                </div>
              </div>
            );
          })}
        </div>
        <div className="flex justify-between mt-2">
          {["Upload", "Skin Tone", "Results"].map((label) => (
            <span key={label} className="font-body text-[10px] uppercase tracking-wider text-muted-foreground">
              {label}
            </span>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {step === "upload" && (
          <motion.div
            key="upload"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="px-5"
          >
            <label className="block cursor-pointer">
              <div className="border-2 border-dashed border-border rounded-2xl p-12 flex flex-col items-center justify-center gap-4 bg-card/50 hover:border-gold/50 transition-colors">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                  <Upload size={24} className="text-muted-foreground" />
                </div>
                <div className="text-center">
                  <p className="font-display text-base font-medium text-foreground">
                    Upload your outfit
                  </p>
                  <p className="font-body text-xs text-muted-foreground mt-1">
                    Take a photo or choose from gallery
                  </p>
                </div>
                <div className="flex gap-2 mt-2">
                  <span className="font-body text-xs px-3 py-1.5 rounded-full bg-muted text-muted-foreground flex items-center gap-1.5">
                    <Camera size={12} /> Camera
                  </span>
                  <span className="font-body text-xs px-3 py-1.5 rounded-full bg-muted text-muted-foreground flex items-center gap-1.5">
                    <Upload size={12} /> Gallery
                  </span>
                </div>
              </div>
              <input
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={handleImageUpload}
              />
            </label>
          </motion.div>
        )}

        {step === "skin" && (
          <motion.div
            key="skin"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="px-5 space-y-6"
          >
            {/* Outfit Preview */}
            {previewUrl && (
              <div className="relative rounded-2xl overflow-hidden h-48">
                <img src={previewUrl} alt="Your outfit" className="w-full h-full object-cover" />
                <button
                  onClick={reset}
                  className="absolute top-3 right-3 w-8 h-8 rounded-full bg-foreground/60 backdrop-blur-sm flex items-center justify-center"
                >
                  <X size={14} className="text-background" />
                </button>
              </div>
            )}

            {/* Skin Tone Selection */}
            <div>
              <h2 className="font-display text-lg font-medium text-foreground mb-1">
                Select your skin tone
              </h2>
              <p className="font-body text-xs text-muted-foreground mb-4">
                Choose the closest match for personalized results
              </p>
              <div className="grid grid-cols-3 gap-3">
                {skinTones.map((tone, i) => (
                  <button
                    key={tone.name}
                    onClick={() => setSelectedSkin(i)}
                    className={`relative rounded-xl p-3 flex flex-col items-center gap-2 border-2 transition-all ${
                      selectedSkin === i
                        ? "border-gold bg-card shadow-md"
                        : "border-transparent bg-card/50"
                    }`}
                  >
                    <div
                      className="w-10 h-10 rounded-full border-2 border-border"
                      style={{ backgroundColor: tone.color }}
                    />
                    <span className="font-body text-xs text-foreground">{tone.name}</span>
                    {selectedSkin === i && (
                      <motion.div
                        layoutId="skinSelected"
                        className="absolute -top-1 -right-1 w-5 h-5 rounded-full gradient-gold flex items-center justify-center"
                      >
                        <Sparkles size={10} className="text-foreground" />
                      </motion.div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Analyze Button */}
            <motion.button
              onClick={handleAnalyze}
              disabled={selectedSkin === null}
              className={`w-full py-4 rounded-2xl font-display text-base font-medium tracking-wide transition-all ${
                selectedSkin !== null
                  ? "gradient-gold text-foreground shadow-lg"
                  : "bg-muted text-muted-foreground"
              }`}
              whileTap={selectedSkin !== null ? { scale: 0.98 } : {}}
            >
              <span className="flex items-center justify-center gap-2">
                <Sparkles size={18} />
                Analyze & Match
              </span>
            </motion.button>
          </motion.div>
        )}

        {step === "result" && (
          <motion.div
            key="result"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="px-5 space-y-5"
          >
            {/* Result Header */}
            <div className="bg-card rounded-2xl p-5 border border-border">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full gradient-gold flex items-center justify-center">
                  <Sparkles size={18} className="text-foreground" />
                </div>
                <div>
                  <h2 className="font-display text-lg font-medium text-foreground">
                    Your Look
                  </h2>
                  <p className="font-body text-xs text-muted-foreground">
                    AI-matched to your outfit & skin tone
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <span className="font-body text-xs px-3 py-1 rounded-full bg-muted text-muted-foreground">
                  Warm Undertone
                </span>
                <span className="font-body text-xs px-3 py-1 rounded-full bg-muted text-muted-foreground">
                  Autumn Palette
                </span>
              </div>
            </div>

            {/* Makeup Recommendations */}
            {[
              { area: "Eyes", product: "Champagne Shimmer Shadow", shade: "hsl(38, 50%, 70%)", tip: "Blend across the lid with a fluffy brush" },
              { area: "Lips", product: "Nude Rose Lip", shade: "hsl(5, 40%, 60%)", tip: "Apply with a lip liner for definition" },
              { area: "Cheeks", product: "Soft Peach Blush", shade: "hsl(15, 50%, 70%)", tip: "Smile and apply to the apples of cheeks" },
              { area: "Base", product: "Luminous Foundation", shade: "hsl(28, 35%, 72%)", tip: "Use a damp sponge for a dewy finish" },
            ].map((item, i) => (
              <motion.div
                key={item.area}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-card rounded-xl p-4 border border-border"
              >
                <div className="flex items-start gap-3">
                  <div
                    className="w-10 h-10 rounded-lg flex-shrink-0 border border-border"
                    style={{ backgroundColor: item.shade }}
                  />
                  <div className="flex-1">
                    <p className="font-body text-[10px] uppercase tracking-wider text-gold font-medium">
                      {item.area}
                    </p>
                    <p className="font-display text-sm font-medium text-foreground">
                      {item.product}
                    </p>
                    <p className="font-body text-xs text-muted-foreground mt-1">
                      {item.tip}
                    </p>
                  </div>
                  <ChevronDown size={16} className="text-muted-foreground mt-1" />
                </div>
              </motion.div>
            ))}

            {/* Start Over */}
            <button
              onClick={reset}
              className="w-full py-3 rounded-xl border border-border font-body text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Start Over
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default StylistPage;
