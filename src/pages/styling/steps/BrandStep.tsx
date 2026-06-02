import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { brands } from "../flowConstants";

interface BrandStepProps {
  selectedBrand: string | null;
  onSelectBrand: (id: string | null) => void;
}

const BrandStep = ({ selectedBrand, onSelectBrand }: BrandStepProps) => (
  <>
    <p className="font-body text-sm text-muted-foreground mb-5">Choose your preferred beauty house</p>
    <div className="space-y-2">
      {brands.map((brand, i) => {
        const isSelected = selectedBrand === brand.id;
        return (
          <motion.button
            key={brand.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            onClick={() => onSelectBrand(isSelected ? null : brand.id)}
            className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all duration-300 ${
              isSelected ? "border-gold bg-card shadow-lg shadow-gold/5" : "border-border/50 bg-card/30 hover:bg-card/60"
            }`}
          >
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center font-display text-base font-bold transition-all ${isSelected ? "gradient-gold text-foreground" : "bg-muted text-muted-foreground"}`}>
              {brand.name.charAt(0)}
            </div>
            <div className="text-left flex-1">
              <p className="font-display text-sm font-semibold text-foreground">{brand.name}</p>
              <p className="font-body text-[10px] text-muted-foreground">{brand.tagline}</p>
            </div>
            {isSelected && (
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-5 h-5 rounded-full gradient-gold flex items-center justify-center">
                <Check size={10} className="text-foreground" />
              </motion.div>
            )}
          </motion.button>
        );
      })}
    </div>
  </>
);

export default BrandStep;
