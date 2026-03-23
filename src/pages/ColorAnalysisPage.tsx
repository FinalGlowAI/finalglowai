import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Droplets, Sun, Leaf, Snowflake, Scissors, Palette, ChevronDown } from "lucide-react";

interface FabricSuggestion {
  name: string;
  why: string;
  pairsWith: string[];
}

interface SkinToneFabric {
  tone: string;
  toneColor: string;
  fabrics: FabricSuggestion[];
}

interface Season {
  name: string;
  icon: React.ElementType;
  description: string;
  colors: string[];
  traits: string[];
  fabricsByTone: SkinToneFabric[];
}

const seasons: Season[] = [
  {
    name: "Spring",
    icon: Leaf,
    description: "Warm and light undertones",
    colors: ["hsl(45, 70%, 65%)", "hsl(20, 60%, 70%)", "hsl(140, 35%, 55%)", "hsl(5, 55%, 65%)", "hsl(30, 50%, 75%)"],
    traits: ["Golden undertone", "Warm blush", "Peachy tones"],
    fabricsByTone: [
      {
        tone: "Light",
        toneColor: "hsl(30, 35%, 85%)",
        fabrics: [
          { name: "Cotton Lawn", why: "Lightweight & breathable, lets warm tones glow", pairsWith: ["Linen shorts", "Silk camisole"] },
          { name: "Silk Charmeuse", why: "Soft sheen complements golden undertones", pairsWith: ["Cotton blazer", "Chiffon scarf"] },
          { name: "Light Linen", why: "Airy texture perfect for peachy palettes", pairsWith: ["Silk blouse", "Cotton skirt"] },
        ],
      },
      {
        tone: "Medium",
        toneColor: "hsl(25, 40%, 60%)",
        fabrics: [
          { name: "Chambray", why: "Soft blue contrast enhances warm skin", pairsWith: ["Linen pants", "Cotton tee"] },
          { name: "Eyelet Cotton", why: "Textured & feminine, flatters warm blush", pairsWith: ["Silk slip", "Denim jacket"] },
          { name: "Crepe de Chine", why: "Fluid drape highlights golden glow", pairsWith: ["Cotton cardigan", "Linen trousers"] },
        ],
      },
      {
        tone: "Deep",
        toneColor: "hsl(20, 45%, 35%)",
        fabrics: [
          { name: "Raw Silk", why: "Rich texture brings warmth & depth", pairsWith: ["Cotton blouse", "Linen vest"] },
          { name: "Cotton Sateen", why: "Subtle sheen plays off deep golden tones", pairsWith: ["Silk scarf", "Chambray shirt"] },
          { name: "Jacquard", why: "Woven patterns add dimension to warm skin", pairsWith: ["Silk tank", "Cotton trouser"] },
        ],
      },
    ],
  },
  {
    name: "Summer",
    icon: Droplets,
    description: "Cool and muted undertones",
    colors: ["hsl(340, 30%, 65%)", "hsl(220, 35%, 65%)", "hsl(280, 20%, 65%)", "hsl(350, 25%, 70%)", "hsl(200, 30%, 70%)"],
    traits: ["Pink undertone", "Soft rose", "Cool mauves"],
    fabricsByTone: [
      {
        tone: "Light",
        toneColor: "hsl(350, 20%, 88%)",
        fabrics: [
          { name: "Chiffon", why: "Sheer & soft, enhances cool pink undertones", pairsWith: ["Silk cami", "Cotton wide-leg"] },
          { name: "Organic Cotton", why: "Matte finish suits muted palette beautifully", pairsWith: ["Linen blazer", "Chiffon skirt"] },
          { name: "Georgette", why: "Flowing movement complements soft rose", pairsWith: ["Cotton cardigan", "Silk scarf"] },
        ],
      },
      {
        tone: "Medium",
        toneColor: "hsl(15, 30%, 55%)",
        fabrics: [
          { name: "Tencel", why: "Eco-luxe drape, cool to touch for summer skin", pairsWith: ["Linen shorts", "Cotton blouse"] },
          { name: "Silk Habotai", why: "Light silk echoes cool undertones perfectly", pairsWith: ["Cotton blazer", "Chiffon wrap"] },
          { name: "Modal Jersey", why: "Soft stretch flatters cool mauves", pairsWith: ["Silk slip skirt", "Linen jacket"] },
        ],
      },
      {
        tone: "Deep",
        toneColor: "hsl(10, 35%, 30%)",
        fabrics: [
          { name: "Matte Jersey", why: "No-shine fabric complements deep cool tones", pairsWith: ["Silk wrap top", "Cotton trouser"] },
          { name: "Bamboo Knit", why: "Soft & cool-toned, flatters deeper skin", pairsWith: ["Tencel blazer", "Linen pant"] },
          { name: "Ponte", why: "Structured elegance for deep cool palettes", pairsWith: ["Chiffon blouse", "Silk scarf"] },
        ],
      },
    ],
  },
  {
    name: "Autumn",
    icon: Sun,
    description: "Warm and deep undertones",
    colors: ["hsl(15, 55%, 45%)", "hsl(35, 60%, 50%)", "hsl(25, 70%, 35%)", "hsl(45, 50%, 45%)", "hsl(10, 45%, 40%)"],
    traits: ["Olive undertone", "Terracotta", "Rich bronze"],
    fabricsByTone: [
      {
        tone: "Light",
        toneColor: "hsl(35, 30%, 80%)",
        fabrics: [
          { name: "Wool Flannel", why: "Warm & textured, perfect for olive undertones", pairsWith: ["Silk blouse", "Corduroy pants"] },
          { name: "Corduroy", why: "Ribbed texture adds depth to warm palettes", pairsWith: ["Cotton turtleneck", "Wool scarf"] },
          { name: "Brushed Cotton", why: "Soft warmth enhances terracotta tones", pairsWith: ["Velvet vest", "Linen shirt"] },
        ],
      },
      {
        tone: "Medium",
        toneColor: "hsl(25, 45%, 50%)",
        fabrics: [
          { name: "Suede", why: "Rich nap texture mirrors bronze glow", pairsWith: ["Silk cami", "Wool trouser"] },
          { name: "Tweed", why: "Multi-tonal weave complements olive warmth", pairsWith: ["Cotton blouse", "Corduroy skirt"] },
          { name: "Cashmere Blend", why: "Luxe softness enhances warm depth", pairsWith: ["Silk scarf", "Wool pant"] },
        ],
      },
      {
        tone: "Deep",
        toneColor: "hsl(15, 50%, 28%)",
        fabrics: [
          { name: "Velvet", why: "Deep pile catches light, stunning on dark skin", pairsWith: ["Silk blouse", "Wool jacket"] },
          { name: "Brocade", why: "Woven metallic adds richness to deep tones", pairsWith: ["Cotton tee", "Suede skirt"] },
          { name: "Bouclé", why: "Textured loops bring dimension to bronze skin", pairsWith: ["Cashmere top", "Corduroy trouser"] },
        ],
      },
    ],
  },
  {
    name: "Winter",
    icon: Snowflake,
    description: "Cool and vivid undertones",
    colors: ["hsl(350, 65%, 45%)", "hsl(260, 50%, 40%)", "hsl(210, 60%, 35%)", "hsl(330, 55%, 50%)", "hsl(0, 0%, 15%)"],
    traits: ["Blue undertone", "Berry tones", "High contrast"],
    fabricsByTone: [
      {
        tone: "Light",
        toneColor: "hsl(210, 15%, 90%)",
        fabrics: [
          { name: "Satin", why: "High sheen mirrors winter's vivid contrast", pairsWith: ["Wool coat", "Silk blouse"] },
          { name: "Taffeta", why: "Crisp structure suits bold berry tones", pairsWith: ["Cashmere sweater", "Cotton shirt"] },
          { name: "Wool Crepe", why: "Matte elegance for high-contrast palettes", pairsWith: ["Satin cami", "Silk scarf"] },
        ],
      },
      {
        tone: "Medium",
        toneColor: "hsl(20, 30%, 50%)",
        fabrics: [
          { name: "Duchess Satin", why: "Luxe weight and sheen for cool mid-tones", pairsWith: ["Wool blazer", "Cotton blouse"] },
          { name: "Mikado", why: "Structured silk holds bold color beautifully", pairsWith: ["Cashmere wrap", "Satin skirt"] },
          { name: "Double Crepe", why: "Clean lines complement blue undertones", pairsWith: ["Silk tank", "Wool trouser"] },
        ],
      },
      {
        tone: "Deep",
        toneColor: "hsl(0, 10%, 20%)",
        fabrics: [
          { name: "Silk Velvet", why: "Ultimate luxury, stunning on deep cool skin", pairsWith: ["Satin blouse", "Wool pant"] },
          { name: "Sequin Mesh", why: "High-impact texture for bold winter palettes", pairsWith: ["Matte jersey tank", "Wool coat"] },
          { name: "Leather", why: "Sleek & modern, amplifies high contrast", pairsWith: ["Silk turtleneck", "Cashmere scarf"] },
        ],
      },
    ],
  },
];

const ColorAnalysisPage = () => {
  const [selected, setSelected] = useState<number | null>(null);
  const [selectedTone, setSelectedTone] = useState<Record<number, number>>({});

  const handleToneSelect = (seasonIdx: number, toneIdx: number) => {
    setSelectedTone((prev) => ({ ...prev, [seasonIdx]: toneIdx }));
  };

  return (
    <div className="min-h-screen pb-24 safe-top">
      <div className="px-5 pt-14 pb-6">
        <h1 className="font-display text-2xl font-semibold text-foreground">
          Color Analysis
        </h1>
        <p className="font-body text-sm text-muted-foreground mt-1">
          Discover your seasonal color palette & ideal fabrics
        </p>
      </div>

      <div className="px-5 space-y-3">
        {seasons.map((season, i) => {
          const Icon = season.icon;
          const isSelected = selected === i;
          const activeTone = selectedTone[i] ?? 0;
          const toneData = season.fabricsByTone[activeTone];

          return (
            <motion.div
              key={season.name}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className={`w-full text-left rounded-2xl border transition-all overflow-hidden ${
                isSelected ? "border-gold bg-card" : "border-border bg-card/50"
              }`}
            >
              <button
                onClick={() => setSelected(isSelected ? null : i)}
                className="w-full p-4 flex items-center gap-3"
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  isSelected ? "gradient-gold" : "bg-muted"
                }`}>
                  <Icon size={18} className={isSelected ? "text-foreground" : "text-muted-foreground"} />
                </div>
                <div className="flex-1 text-left">
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
                <ChevronDown
                  size={16}
                  className={`text-muted-foreground transition-transform ${isSelected ? "rotate-180" : ""}`}
                />
              </button>

              <AnimatePresence>
                {isSelected && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-4">
                      {/* Palette Section */}
                      <div className="pt-3 border-t border-border">
                        <p className="font-body text-xs text-muted-foreground uppercase tracking-wider mb-3">
                          <Palette size={12} className="inline mr-1.5" />
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
                        <div className="flex flex-wrap gap-1.5 mb-5">
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

                      {/* Fabric Suggestions Section */}
                      <div className="pt-3 border-t border-border">
                        <p className="font-body text-xs text-muted-foreground uppercase tracking-wider mb-3">
                          <Scissors size={12} className="inline mr-1.5" />
                          Fabric Suggestions
                        </p>

                        {/* Skin Tone Selector */}
                        <p className="font-body text-[10px] text-muted-foreground mb-2">
                          Select your skin tone:
                        </p>
                        <div className="flex gap-2 mb-4">
                          {season.fabricsByTone.map((st, ti) => (
                            <button
                              key={st.tone}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleToneSelect(i, ti);
                              }}
                              className={`flex-1 flex flex-col items-center gap-1.5 p-2 rounded-xl transition-all ${
                                activeTone === ti
                                  ? "bg-muted ring-2 ring-gold"
                                  : "bg-muted/40 hover:bg-muted/70"
                              }`}
                            >
                              <div
                                className="w-8 h-8 rounded-full border border-border shadow-sm"
                                style={{ backgroundColor: st.toneColor }}
                              />
                              <span className="font-body text-[10px] text-muted-foreground">
                                {st.tone}
                              </span>
                            </button>
                          ))}
                        </div>

                        {/* Fabric Cards */}
                        <div className="space-y-2.5">
                          {toneData.fabrics.map((fabric, fi) => (
                            <motion.div
                              key={fabric.name}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: fi * 0.06 }}
                              className="rounded-xl bg-muted/50 border border-border p-3"
                            >
                              <div className="flex items-start gap-2.5">
                                <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center shrink-0 mt-0.5">
                                  <Scissors size={14} className="text-accent" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="font-display text-sm font-medium text-foreground">
                                    {fabric.name}
                                  </p>
                                  <p className="font-body text-[11px] text-muted-foreground mt-0.5 leading-relaxed">
                                    {fabric.why}
                                  </p>
                                  <div className="mt-2">
                                    <p className="font-body text-[9px] text-muted-foreground uppercase tracking-wider mb-1">
                                      Pairs with
                                    </p>
                                    <div className="flex flex-wrap gap-1">
                                      {fabric.pairsWith.map((p) => (
                                        <span
                                          key={p}
                                          className="font-body text-[10px] px-2 py-0.5 rounded-full bg-background border border-border text-muted-foreground"
                                        >
                                          {p}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default ColorAnalysisPage;
