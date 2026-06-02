import { motion, AnimatePresence } from "framer-motion";
import { Check, CircleDot } from "lucide-react";
import { OutfitCategory } from "../flowConstants";

interface OutfitStepProps {
  categories: OutfitCategory[];
  presetPalettes: { name: string; colors: string[] }[];
  outfitSelections: Record<string, string | null>;
  expandedCategory: string | null;
  onSelectColor: (categoryId: string, colorValue: string) => void;
  onSetExpandedCategory: (id: string | null) => void;
  onApplyPreset: (colors: string[]) => void;
}

const OutfitStep = ({
  categories,
  presetPalettes,
  outfitSelections,
  expandedCategory,
  onSelectColor,
  onSetExpandedCategory,
  onApplyPreset,
}: OutfitStepProps) => {
  const selectedColorCount = Object.values(outfitSelections).filter(Boolean).length;

  return (
    <>
      <div className="mb-5">
        <p className="font-body text-[10px] uppercase tracking-widest text-muted-foreground mb-3">
          Quick Palettes
        </p>
        <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-hide">
          {presetPalettes.map((palette) => (
            <button
              key={palette.name}
              onClick={() => onApplyPreset(palette.colors)}
              className="flex-shrink-0 rounded-xl border border-border bg-card p-3 hover:border-gold/40 transition-all"
            >
              <div className="flex gap-1 mb-2">
                {palette.colors.map((c, i) => (
                  <div key={i} className="w-6 h-6 rounded-full border border-border/50" style={{ backgroundColor: c }} />
                ))}
              </div>
              <p className="font-body text-[10px] text-muted-foreground whitespace-nowrap">{palette.name}</p>
            </button>
          ))}
        </div>
      </div>

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
              {Object.values(outfitSelections).filter(Boolean).map((color, i) => (
                <div key={i} className="w-6 h-6 rounded-full border-2 border-card shadow-sm" style={{ backgroundColor: color! }} />
              ))}
            </div>
          </div>
        </motion.div>
      )}

      <div className="space-y-2 max-h-[55vh] overflow-y-auto pb-4 -mx-1 px-1">
        {categories.map((cat) => {
          const Icon = cat.icon;
          const isExpanded = expandedCategory === cat.id;
          const selectedColor = outfitSelections[cat.id];
          return (
            <div
              key={cat.id}
              className={`rounded-2xl border overflow-hidden transition-all duration-300 ${
                selectedColor ? "border-gold/30 bg-card" : isExpanded ? "border-border bg-card" : "border-border/60 bg-card/40"
              }`}
            >
              <button onClick={() => onSetExpandedCategory(isExpanded ? null : cat.id)} className="w-full flex items-center gap-3 p-3.5">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${selectedColor ? "gradient-gold" : "bg-muted"}`}>
                  {selectedColor ? <Check size={14} className="text-foreground" /> : <Icon size={14} className="text-muted-foreground" />}
                </div>
                <div className="flex-1 text-left">
                  <p className="font-display text-sm font-medium text-foreground leading-tight">{cat.label}</p>
                  {selectedColor && (
                    <p className="font-body text-[10px] text-muted-foreground">
                      {cat.colors.find((c) => c.value === selectedColor)?.name}
                    </p>
                  )}
                </div>
                {selectedColor && <div className="w-6 h-6 rounded-full border-2 border-border shadow-sm" style={{ backgroundColor: selectedColor }} />}
                <motion.div animate={{ rotate: isExpanded ? 180 : 0 }} transition={{ duration: 0.2 }} className="text-muted-foreground">
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
                            <button key={color.name} onClick={() => onSelectColor(cat.id, color.value)} className="flex flex-col items-center gap-1">
                              <div className="relative">
                                <div
                                  className={`w-10 h-10 rounded-full border-2 shadow-sm transition-all ${isSelected ? "border-gold scale-110 shadow-md" : "border-border/50 hover:scale-105"}`}
                                  style={{ backgroundColor: color.value }}
                                />
                                {isSelected && (
                                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full gradient-gold flex items-center justify-center">
                                    <Check size={8} className="text-foreground" />
                                  </motion.div>
                                )}
                              </div>
                              <span className="font-body text-[8px] text-muted-foreground leading-tight text-center">{color.name}</span>
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
    </>
  );
};

export default OutfitStep;
