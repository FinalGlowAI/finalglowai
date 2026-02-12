import { useState } from "react";
import { motion } from "framer-motion";
import { Droplets, Sun, Leaf, Snowflake } from "lucide-react";

const seasons = [
  {
    name: "Spring",
    icon: Leaf,
    description: "Warm and light undertones",
    colors: ["hsl(45, 70%, 65%)", "hsl(20, 60%, 70%)", "hsl(140, 35%, 55%)", "hsl(5, 55%, 65%)", "hsl(30, 50%, 75%)"],
    traits: ["Golden undertone", "Warm blush", "Peachy tones"],
  },
  {
    name: "Summer",
    icon: Droplets,
    description: "Cool and muted undertones",
    colors: ["hsl(340, 30%, 65%)", "hsl(220, 35%, 65%)", "hsl(280, 20%, 65%)", "hsl(350, 25%, 70%)", "hsl(200, 30%, 70%)"],
    traits: ["Pink undertone", "Soft rose", "Cool mauves"],
  },
  {
    name: "Autumn",
    icon: Sun,
    description: "Warm and deep undertones",
    colors: ["hsl(15, 55%, 45%)", "hsl(35, 60%, 50%)", "hsl(25, 70%, 35%)", "hsl(45, 50%, 45%)", "hsl(10, 45%, 40%)"],
    traits: ["Olive undertone", "Terracotta", "Rich bronze"],
  },
  {
    name: "Winter",
    icon: Snowflake,
    description: "Cool and vivid undertones",
    colors: ["hsl(350, 65%, 45%)", "hsl(260, 50%, 40%)", "hsl(210, 60%, 35%)", "hsl(330, 55%, 50%)", "hsl(0, 0%, 15%)"],
    traits: ["Blue undertone", "Berry tones", "High contrast"],
  },
];

const ColorAnalysisPage = () => {
  const [selected, setSelected] = useState<number | null>(null);

  return (
    <div className="min-h-screen pb-24 safe-top">
      <div className="px-5 pt-14 pb-6">
        <h1 className="font-display text-2xl font-semibold text-foreground">
          Color Analysis
        </h1>
        <p className="font-body text-sm text-muted-foreground mt-1">
          Discover your seasonal color palette
        </p>
      </div>

      <div className="px-5 space-y-3">
        {seasons.map((season, i) => {
          const Icon = season.icon;
          const isSelected = selected === i;
          return (
            <motion.button
              key={season.name}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              onClick={() => setSelected(isSelected ? null : i)}
              className={`w-full text-left rounded-2xl border transition-all overflow-hidden ${
                isSelected ? "border-gold bg-card" : "border-border bg-card/50"
              }`}
            >
              <div className="p-4 flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  isSelected ? "gradient-gold" : "bg-muted"
                }`}>
                  <Icon size={18} className={isSelected ? "text-foreground" : "text-muted-foreground"} />
                </div>
                <div className="flex-1">
                  <p className="font-display text-base font-medium text-foreground">
                    {season.name}
                  </p>
                  <p className="font-body text-xs text-muted-foreground">
                    {season.description}
                  </p>
                </div>
                <div className="flex -space-x-1">
                  {season.colors.slice(0, 3).map((c, ci) => (
                    <div
                      key={ci}
                      className="w-5 h-5 rounded-full border-2 border-card"
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>

              {isSelected && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="px-4 pb-4"
                >
                  <div className="pt-3 border-t border-border">
                    <p className="font-body text-xs text-muted-foreground uppercase tracking-wider mb-3">
                      Your Palette
                    </p>
                    <div className="flex gap-2 mb-4">
                      {season.colors.map((c, ci) => (
                        <div
                          key={ci}
                          className="flex-1 h-12 rounded-lg first:rounded-l-xl last:rounded-r-xl"
                          style={{ backgroundColor: c }}
                        />
                      ))}
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {season.traits.map((trait) => (
                        <span
                          key={trait}
                          className="font-body text-xs px-2.5 py-1 rounded-full bg-muted text-muted-foreground"
                        >
                          {trait}
                        </span>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};

export default ColorAnalysisPage;
