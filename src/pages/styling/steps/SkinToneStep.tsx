import { motion } from "framer-motion";
import { Check, Camera } from "lucide-react";
import { skinTones } from "../flowConstants";

interface SkinToneStepProps {
  selectedSkin: number | null;
  autoDetect: boolean;
  onSelectSkin: (i: number) => void;
  onSetAutoDetect: (v: boolean) => void;
}

const SkinToneStep = ({ selectedSkin, autoDetect, onSelectSkin, onSetAutoDetect }: SkinToneStepProps) => (
  <>
    <p className="font-body text-sm text-muted-foreground mb-5">Select the closest match to your skin tone</p>
    <div className="mb-6 rounded-2xl overflow-hidden border border-border">
      <div className="flex h-3">
        {skinTones.map((t) => <div key={t.name} className="flex-1" style={{ backgroundColor: t.color }} />)}
      </div>
    </div>
    <div className="space-y-2 mb-6">
      {skinTones.map((tone, i) => {
        const isSelected = selectedSkin === i && !autoDetect;
        return (
          <motion.button
            key={tone.name}
            initial={{ opacity: 0, x: 15 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.04 }}
            onClick={() => { onSelectSkin(i); onSetAutoDetect(false); }}
            className={`w-full flex items-center gap-4 p-3.5 rounded-2xl border-2 transition-all duration-300 ${
              isSelected ? "border-gold bg-card shadow-lg shadow-gold/5" : "border-border/50 bg-card/30 hover:bg-card/60"
            }`}
          >
            <div className="relative">
              <div className={`w-12 h-12 rounded-full border-2 transition-all ${isSelected ? "border-gold shadow-md" : "border-border/60"}`} style={{ backgroundColor: tone.color }} />
              {isSelected && (
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full gradient-gold flex items-center justify-center">
                  <Check size={10} className="text-foreground" />
                </motion.div>
              )}
            </div>
            <div className="text-left">
              <p className="font-display text-sm font-medium text-foreground">{tone.name}</p>
              <p className="font-body text-[10px] text-muted-foreground">{tone.undertone}</p>
            </div>
          </motion.button>
        );
      })}
    </div>
    <motion.button
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.35 }}
      onClick={() => { onSetAutoDetect(true); onSelectSkin(-1); }}
      className={`w-full flex items-center gap-3 p-4 rounded-2xl border-2 transition-all duration-300 ${
        autoDetect ? "border-gold bg-card shadow-lg shadow-gold/5" : "border-dashed border-border/60 bg-card/20 hover:border-border"
      }`}
    >
      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${autoDetect ? "gradient-gold" : "bg-muted"}`}>
        <Camera size={18} className={autoDetect ? "text-foreground" : "text-muted-foreground"} />
      </div>
      <div className="text-left">
        <p className="font-display text-sm font-medium text-foreground">Auto-detect later</p>
        <p className="font-body text-[10px] text-muted-foreground">Use camera to find your perfect match</p>
      </div>
      {autoDetect && (
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="ml-auto w-5 h-5 rounded-full gradient-gold flex items-center justify-center">
          <Check size={10} className="text-foreground" />
        </motion.div>
      )}
    </motion.button>
  </>
);

export default SkinToneStep;
