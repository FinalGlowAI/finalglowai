import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shirt,
  Sparkles,
  ArrowLeft,
  Gem,
  HandMetal,
  Footprints,
  Check,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

interface OutfitCategory {
  id: string;
  label: string;
  icon: React.ElementType;
  colors: { name: string; value: string }[];
}

const categories: OutfitCategory[] = [
  {
    id: "top",
    label: "Top",
    icon: Shirt,
    colors: [
      { name: "White", value: "hsl(0,0%,98%)" },
      { name: "Black", value: "hsl(0,0%,8%)" },
      { name: "Navy", value: "hsl(220,50%,22%)" },
      { name: "Red", value: "hsl(0,70%,45%)" },
      { name: "Blush", value: "hsl(350,40%,75%)" },
      { name: "Camel", value: "hsl(30,40%,60%)" },
      { name: "Olive", value: "hsl(85,25%,40%)" },
      { name: "Burgundy", value: "hsl(345,55%,30%)" },
      { name: "Cream", value: "hsl(40,30%,90%)" },
      { name: "Grey", value: "hsl(0,0%,55%)" },
      { name: "Sage", value: "hsl(140,15%,60%)" },
      { name: "Cobalt", value: "hsl(215,65%,45%)" },
    ],
  },
  {
    id: "long_pant",
    label: "Long Pant",
    icon: Shirt,
    colors: [
      { name: "Black", value: "hsl(0,0%,8%)" },
      { name: "White", value: "hsl(0,0%,98%)" },
      { name: "Denim", value: "hsl(215,40%,50%)" },
      { name: "Navy", value: "hsl(220,50%,22%)" },
      { name: "Khaki", value: "hsl(40,30%,55%)" },
      { name: "Grey", value: "hsl(0,0%,55%)" },
      { name: "Olive", value: "hsl(85,25%,40%)" },
      { name: "Camel", value: "hsl(30,40%,60%)" },
      { name: "Burgundy", value: "hsl(345,55%,30%)" },
      { name: "Cream", value: "hsl(40,30%,90%)" },
      { name: "Tan", value: "hsl(35,35%,65%)" },
      { name: "Charcoal", value: "hsl(0,0%,25%)" },
    ],
  },
  {
    id: "skirt",
    label: "Skirt",
    icon: Shirt,
    colors: [
      { name: "Black", value: "hsl(0,0%,8%)" },
      { name: "White", value: "hsl(0,0%,98%)" },
      { name: "Blush", value: "hsl(350,40%,75%)" },
      { name: "Red", value: "hsl(0,70%,45%)" },
      { name: "Navy", value: "hsl(220,50%,22%)" },
      { name: "Denim", value: "hsl(215,40%,50%)" },
      { name: "Plaid", value: "hsl(10,35%,45%)" },
      { name: "Nude", value: "hsl(25,25%,75%)" },
      { name: "Emerald", value: "hsl(155,45%,35%)" },
      { name: "Cream", value: "hsl(40,30%,90%)" },
      { name: "Mauve", value: "hsl(310,20%,55%)" },
      { name: "Camel", value: "hsl(30,40%,60%)" },
    ],
  },
  {
    id: "dress",
    label: "Dress",
    icon: Shirt,
    colors: [
      { name: "Black", value: "hsl(0,0%,8%)" },
      { name: "White", value: "hsl(0,0%,98%)" },
      { name: "Red", value: "hsl(0,70%,45%)" },
      { name: "Navy", value: "hsl(220,50%,22%)" },
      { name: "Blush", value: "hsl(350,40%,75%)" },
      { name: "Emerald", value: "hsl(155,45%,35%)" },
      { name: "Gold", value: "hsl(42,60%,55%)" },
      { name: "Burgundy", value: "hsl(345,55%,30%)" },
      { name: "Nude", value: "hsl(25,25%,75%)" },
      { name: "Cobalt", value: "hsl(215,65%,45%)" },
      { name: "Champagne", value: "hsl(38,35%,78%)" },
      { name: "Lavender", value: "hsl(270,30%,70%)" },
    ],
  },
  {
    id: "shoes",
    label: "Shoes",
    icon: Footprints,
    colors: [
      { name: "Black", value: "hsl(0,0%,8%)" },
      { name: "White", value: "hsl(0,0%,98%)" },
      { name: "Nude", value: "hsl(25,25%,75%)" },
      { name: "Red", value: "hsl(0,70%,45%)" },
      { name: "Gold", value: "hsl(42,60%,55%)" },
      { name: "Silver", value: "hsl(0,0%,75%)" },
      { name: "Brown", value: "hsl(25,40%,35%)" },
      { name: "Tan", value: "hsl(35,35%,55%)" },
      { name: "Navy", value: "hsl(220,50%,22%)" },
      { name: "Blush", value: "hsl(350,40%,75%)" },
      { name: "Snake", value: "hsl(35,15%,50%)" },
      { name: "Leopard", value: "hsl(30,35%,45%)" },
    ],
  },
  {
    id: "handbag",
    label: "Handbag",
    icon: HandMetal,
    colors: [
      { name: "Black", value: "hsl(0,0%,8%)" },
      { name: "White", value: "hsl(0,0%,98%)" },
      { name: "Tan", value: "hsl(35,35%,55%)" },
      { name: "Brown", value: "hsl(25,40%,35%)" },
      { name: "Red", value: "hsl(0,70%,45%)" },
      { name: "Nude", value: "hsl(25,25%,75%)" },
      { name: "Gold", value: "hsl(42,60%,55%)" },
      { name: "Navy", value: "hsl(220,50%,22%)" },
      { name: "Cream", value: "hsl(40,30%,90%)" },
      { name: "Blush", value: "hsl(350,40%,75%)" },
      { name: "Olive", value: "hsl(85,25%,40%)" },
      { name: "Burgundy", value: "hsl(345,55%,30%)" },
    ],
  },
  {
    id: "jewelry",
    label: "Jewelry",
    icon: Gem,
    colors: [
      { name: "Gold", value: "hsl(42,60%,55%)" },
      { name: "Silver", value: "hsl(0,0%,75%)" },
      { name: "Rose Gold", value: "hsl(15,45%,65%)" },
      { name: "Pearl", value: "hsl(40,20%,90%)" },
      { name: "Diamond", value: "hsl(210,10%,88%)" },
      { name: "Emerald", value: "hsl(155,55%,40%)" },
      { name: "Ruby", value: "hsl(350,65%,40%)" },
      { name: "Sapphire", value: "hsl(220,65%,40%)" },
      { name: "Onyx", value: "hsl(0,0%,10%)" },
      { name: "Turquoise", value: "hsl(175,50%,50%)" },
      { name: "Amethyst", value: "hsl(275,40%,50%)" },
      { name: "Coral", value: "hsl(15,65%,60%)" },
    ],
  },
];

const OutfitColorPage = () => {
  const navigate = useNavigate();
  const [selections, setSelections] = useState<Record<string, string | null>>({});
  const [expandedCategory, setExpandedCategory] = useState<string | null>("top");

  const toggleCategory = (id: string) => {
    setExpandedCategory(expandedCategory === id ? null : id);
  };

  const selectColor = (categoryId: string, colorValue: string) => {
    setSelections((prev) => ({
      ...prev,
      [categoryId]: prev[categoryId] === colorValue ? null : colorValue,
    }));
  };

  const selectedCount = Object.values(selections).filter(Boolean).length;

  return (
    <div className="min-h-screen pb-24 safe-top">
      {/* Header */}
      <div className="px-5 pt-14 pb-2 flex items-center gap-3">
        <button
          onClick={() => navigate("/stylist")}
          className="w-9 h-9 rounded-full bg-card border border-border flex items-center justify-center"
        >
          <ArrowLeft size={16} className="text-foreground" />
        </button>
        <div>
          <h1 className="font-display text-2xl font-semibold text-foreground">
            Your Outfit
          </h1>
          <p className="font-body text-xs text-muted-foreground">
            Select colors for each piece you're wearing
          </p>
        </div>
      </div>

      {/* Selection count */}
      <div className="px-5 py-3">
        <div className="flex items-center gap-2">
          <span className="font-body text-xs text-muted-foreground">
            {selectedCount} {selectedCount === 1 ? "piece" : "pieces"} selected
          </span>
          {selectedCount > 0 && (
            <div className="flex -space-x-1">
              {Object.values(selections)
                .filter(Boolean)
                .slice(0, 5)
                .map((color, i) => (
                  <div
                    key={i}
                    className="w-4 h-4 rounded-full border-2 border-background"
                    style={{ backgroundColor: color! }}
                  />
                ))}
            </div>
          )}
        </div>
      </div>

      {/* Categories */}
      <div className="px-5 space-y-2">
        {categories.map((cat) => {
          const Icon = cat.icon;
          const isExpanded = expandedCategory === cat.id;
          const selectedColor = selections[cat.id];

          return (
            <motion.div
              key={cat.id}
              layout
              className={`rounded-2xl border overflow-hidden transition-colors ${
                selectedColor
                  ? "border-gold/40 bg-card"
                  : isExpanded
                  ? "border-border bg-card"
                  : "border-border bg-card/50"
              }`}
            >
              <button
                onClick={() => toggleCategory(cat.id)}
                className="w-full flex items-center gap-3 p-4"
              >
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center ${
                    selectedColor ? "gradient-gold" : "bg-muted"
                  }`}
                >
                  {selectedColor ? (
                    <Check size={16} className="text-foreground" />
                  ) : (
                    <Icon size={16} className="text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1 text-left">
                  <p className="font-display text-sm font-medium text-foreground">
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
                    className="w-7 h-7 rounded-full border-2 border-border"
                    style={{ backgroundColor: selectedColor }}
                  />
                )}
              </button>

              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-4">
                      <div className="grid grid-cols-4 gap-2">
                        {cat.colors.map((color) => {
                          const isSelected = selections[cat.id] === color.value;
                          return (
                            <button
                              key={color.name}
                              onClick={() => selectColor(cat.id, color.value)}
                              className={`flex flex-col items-center gap-1.5 p-2 rounded-xl transition-all ${
                                isSelected
                                  ? "bg-muted ring-2 ring-gold"
                                  : "hover:bg-muted/50"
                              }`}
                            >
                              <div
                                className="w-9 h-9 rounded-full border border-border shadow-sm"
                                style={{ backgroundColor: color.value }}
                              />
                              <span className="font-body text-[9px] text-muted-foreground leading-tight text-center">
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
            </motion.div>
          );
        })}
      </div>

      {/* Continue Button — fixed at bottom */}
      {selectedCount >= 1 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-20 left-0 right-0 px-5 z-40 max-w-lg mx-auto"
        >
          <button
            onClick={() => navigate("/stylist")}
            className="w-full py-4 rounded-2xl gradient-gold font-display text-base font-medium tracking-wide shadow-lg flex items-center justify-center gap-2 text-foreground"
          >
            <Sparkles size={18} />
            Continue to Stylist
          </button>
        </motion.div>
      )}
    </div>
  );
};

export default OutfitColorPage;
