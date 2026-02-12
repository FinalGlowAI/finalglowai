import { motion } from "framer-motion";
import { Sparkles, ChevronRight, RotateCcw, Share2 } from "lucide-react";

interface MakeupResult {
  area: string;
  product: string;
  shade: string;
  tip: string;
}

interface MakeupResultStepProps {
  results: MakeupResult[];
  style: string;
  brand: string;
  onStartOver: () => void;
}

const MakeupResultStep = ({ results, style, brand, onStartOver }: MakeupResultStepProps) => {
  return (
    <div className="space-y-5">
      {/* Result Header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl overflow-hidden border border-gold/20"
      >
        <div className="gradient-gold p-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-foreground/10 backdrop-blur-sm flex items-center justify-center">
              <Sparkles size={22} className="text-foreground" />
            </div>
            <div>
              <h2 className="font-display text-xl font-semibold text-foreground">
                Your Perfect Look
              </h2>
              <p className="font-body text-xs text-foreground/70">
                Curated for your style & complexion
              </p>
            </div>
          </div>
        </div>
        <div className="bg-card p-4 flex gap-2 flex-wrap">
          {style && (
            <span className="font-body text-[10px] uppercase tracking-wider px-3 py-1 rounded-full bg-muted text-muted-foreground">
              {style.replace("_", " ")}
            </span>
          )}
          {brand && brand !== "none" && (
            <span className="font-body text-[10px] uppercase tracking-wider px-3 py-1 rounded-full bg-muted text-muted-foreground">
              {brand}
            </span>
          )}
        </div>
      </motion.div>

      {/* Product Recommendations */}
      {results.map((item, i) => (
        <motion.div
          key={item.area}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 + i * 0.08 }}
          className="bg-card rounded-2xl p-4 border border-border hover:border-gold/20 transition-colors"
        >
          <div className="flex items-start gap-3">
            <div
              className="w-12 h-12 rounded-xl flex-shrink-0 border border-border shadow-sm"
              style={{ backgroundColor: item.shade }}
            />
            <div className="flex-1 min-w-0">
              <p className="font-body text-[10px] uppercase tracking-widest text-gold font-medium">
                {item.area}
              </p>
              <p className="font-display text-sm font-semibold text-foreground mt-0.5">
                {item.product}
              </p>
              <p className="font-body text-xs text-muted-foreground mt-1 leading-relaxed">
                {item.tip}
              </p>
            </div>
            <ChevronRight size={16} className="text-muted-foreground mt-2 flex-shrink-0" />
          </div>
        </motion.div>
      ))}

      {/* Actions */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="flex gap-3 pt-2"
      >
        <button
          onClick={onStartOver}
          className="flex-1 py-3.5 rounded-2xl border border-border font-body text-sm text-muted-foreground hover:text-foreground hover:bg-card transition-all flex items-center justify-center gap-2"
        >
          <RotateCcw size={14} />
          Start Over
        </button>
        <button
          className="flex-1 py-3.5 rounded-2xl gradient-gold font-display text-sm font-medium text-foreground shadow-lg flex items-center justify-center gap-2"
        >
          <Share2 size={14} />
          Share Look
        </button>
      </motion.div>
    </div>
  );
};

export default MakeupResultStep;
