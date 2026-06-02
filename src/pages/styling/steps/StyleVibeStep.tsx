import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { styleVibes } from "../flowConstants";

interface StyleVibeStepProps {
  selectedVibe: string | null;
  makeupIntensity: number;
  onSelectVibe: (id: string | null) => void;
  onSetIntensity: (v: number) => void;
}

const StyleVibeStep = ({ selectedVibe, makeupIntensity, onSelectVibe, onSetIntensity }: StyleVibeStepProps) => (
  <>
    <p className="font-body text-sm text-muted-foreground mb-5">What's your vibe today?</p>
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
            onClick={() => onSelectVibe(isSelected ? null : vibe.id)}
            className={`relative rounded-2xl p-5 text-left border-2 transition-all duration-300 ${
              isSelected ? "border-gold bg-card shadow-lg shadow-gold/5" : "border-border/60 bg-card/40 hover:border-border"
            }`}
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 transition-all ${isSelected ? "gradient-gold" : "bg-muted"}`}>
              <Icon size={18} className={isSelected ? "text-foreground" : "text-muted-foreground"} />
            </div>
            <p className="font-display text-sm font-semibold text-foreground">{vibe.label}</p>
            <p className="font-body text-[10px] text-muted-foreground mt-0.5">{vibe.desc}</p>
            {isSelected && (
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute top-3 right-3 w-5 h-5 rounded-full gradient-gold flex items-center justify-center">
                <Check size={10} className="text-foreground" />
              </motion.div>
            )}
          </motion.button>
        );
      })}
    </div>
    {selectedVibe && (
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-6 p-4 rounded-2xl bg-card border border-border">
        <div className="flex items-center justify-between mb-3">
          <p className="font-display text-sm font-medium text-foreground">Makeup Intensity</p>
          <span className="font-body text-xs text-gold font-medium">
            {makeupIntensity <= 30 ? "Light" : makeupIntensity <= 65 ? "Medium" : "Full Glam"}
          </span>
        </div>
        <Slider value={[makeupIntensity]} onValueChange={(v) => onSetIntensity(v[0])} min={0} max={100} step={5} className="w-full" />
        <div className="flex justify-between mt-2">
          <span className="font-body text-[10px] text-muted-foreground">Barely there</span>
          <span className="font-body text-[10px] text-muted-foreground">Full glam</span>
        </div>
      </motion.div>
    )}
  </>
);

export default StyleVibeStep;
