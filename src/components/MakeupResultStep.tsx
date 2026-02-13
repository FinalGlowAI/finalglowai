import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ChevronRight, ChevronDown, RotateCcw, Share2, ExternalLink, ShieldCheck } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

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
  capturedImage?: string | null;
  enhancedImage?: string | null;
  isEnhancing?: boolean;
}

// ─── Brand-specific product recommendations ─────────────────────────
interface BrandProduct {
  category: string;
  name: string;
  shade: string;
}

const brandProducts: Record<string, BrandProduct[]> = {
  dior: [
    { category: "Foundation", name: "Dior Forever Skin Glow", shade: "Natural radiant finish" },
    { category: "Lipstick", name: "Rouge Dior Satin", shade: "Velvet couture color" },
    { category: "Highlighter", name: "Dior Backstage Glow Face Palette", shade: "Universal radiance" },
  ],
  fenty: [
    { category: "Foundation", name: "Fenty Pro Filt'r Soft Matte", shade: "Longwear foundation" },
    { category: "Lipstick", name: "Fenty Gloss Bomb Universal", shade: "Luminous lip color" },
    { category: "Highlighter", name: "Fenty Killawatt Highlighter", shade: "Blinding shimmer" },
  ],
  sephora: [
    { category: "Foundation", name: "Sephora Best Skin Ever", shade: "Lightweight coverage" },
    { category: "Lipstick", name: "Sephora Rouge Lacquer", shade: "High-shine finish" },
    { category: "Highlighter", name: "Sephora Colorful Face Powders", shade: "Buildable glow" },
  ],
  rare: [
    { category: "Foundation", name: "Rare Beauty Liquid Touch", shade: "Weightless formula" },
    { category: "Lipstick", name: "Rare Beauty Soft Pinch Lip Oil", shade: "Nourishing color" },
    { category: "Highlighter", name: "Rare Beauty Positive Light", shade: "Luminizer stick" },
  ],
  mac: [
    { category: "Foundation", name: "MAC Studio Fix Fluid SPF 15", shade: "Matte perfection" },
    { category: "Lipstick", name: "MAC Retro Matte Lipstick", shade: "Iconic satin finish" },
    { category: "Highlighter", name: "MAC Extra Dimension Skinfinish", shade: "Liquid-powder glow" },
  ],
};

const defaultProducts: BrandProduct[] = [
  { category: "Foundation", name: "Luminous Silk Foundation", shade: "Skin-perfecting coverage" },
  { category: "Lipstick", name: "Satin Lip Color", shade: "Rich velvet finish" },
  { category: "Highlighter", name: "Prismatic Glow Highlighter", shade: "Multi-dimensional shimmer" },
];

// ─── How-to-apply guides per category ───────────────────────────────
const applicationGuides: Record<string, string> = {
  Foundation:
    "Start with a pea-sized amount on the back of your hand. Using a damp beauty sponge or foundation brush, dot product on your forehead, cheeks, nose, and chin. Blend outward from the center of your face in light, even strokes. Build coverage gradually — less is more for a natural finish.",
  Lipstick:
    "Exfoliate lips gently beforehand. Line your lips with a matching liner for definition. Apply lipstick from the center of your upper lip outward, then glide across the lower lip. Blot with a tissue and reapply for longer-lasting color.",
  Highlighter:
    "Smile to find the highest points of your cheekbones. Using a fan brush or fingertip, sweep highlighter along the cheekbone tops, the bridge of your nose, your cupid's bow, and the inner corners of your eyes. Blend edges so the glow looks lit-from-within.",
};

// ─── Shop links ─────────────────────────────────────────────────────
const shopLinks = [
  { label: "Buy on Sephora", url: "https://www.sephora.com" },
  { label: "Buy on Dior", url: "https://www.dior.com/en_us/beauty" },
  { label: "Buy on Fenty", url: "https://fentybeauty.com" },
];

const beautyMessages = [
  "Analyzing your features…",
  "Perfecting your skin tone…",
  "Enhancing your natural glow…",
  "Applying virtual beauty look…",
  "Refining highlights & contour…",
  "Finalizing your glow…",
];

const MakeupResultStep = ({ results, style, brand, onStartOver, capturedImage, enhancedImage, isEnhancing }: MakeupResultStepProps) => {
  const [showOriginal, setShowOriginal] = useState(false);
  const [msgIndex, setMsgIndex] = useState(0);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const recommendedProducts = brandProducts[brand] || defaultProducts;
  const brandDisplayName = brand && brand !== "none"
    ? { dior: "Dior", fenty: "Fenty Beauty", sephora: "Sephora", rare: "Rare Beauty", mac: "MAC" }[brand] || brand
    : null;
  const displayImage = showOriginal ? capturedImage : (enhancedImage || capturedImage);

  useEffect(() => {
    if (!isEnhancing) return;
    setMsgIndex(0);
    const interval = setInterval(() => {
      setMsgIndex((prev) => (prev + 1) % beautyMessages.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [isEnhancing]);

  return (
    <div className="space-y-5">
      {/* ─── AI Enhanced Portrait ─── */}
      {(capturedImage || isEnhancing) && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative rounded-2xl overflow-hidden border border-gold/20"
        >
          {displayImage && !isEnhancing && (
            <img
              src={displayImage}
              alt="Your beauty look"
              className="w-full aspect-[3/4] object-cover"
            />
          )}

          {/* Enhancement skeleton overlay */}
          {isEnhancing && (
            <div className="w-full aspect-[3/4] bg-card flex flex-col items-center justify-center gap-5 p-6">
              {/* Face skeleton */}
              <div className="relative w-40 h-52 flex flex-col items-center gap-3">
                <Skeleton className="w-32 h-32 rounded-full" />
                <Skeleton className="w-24 h-3 rounded-full" />
                <Skeleton className="w-16 h-3 rounded-full" />
              </div>

              {/* Shimmer progress bar */}
              <div className="w-3/4 h-1.5 rounded-full bg-muted overflow-hidden">
                <motion.div
                  className="h-full rounded-full gradient-gold"
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 18, ease: "linear" }}
                />
              </div>

              {/* Rotating beauty message */}
              <AnimatePresence mode="wait">
                <motion.p
                  key={msgIndex}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.3 }}
                  className="font-display text-sm font-medium text-foreground text-center"
                >
                  {beautyMessages[msgIndex]}
                </motion.p>
              </AnimatePresence>
              <p className="font-body text-xs text-muted-foreground">AI beauty transformation in progress</p>
            </div>
          )}

          {/* Before/After toggle */}
          {enhancedImage && !isEnhancing && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2">
              <button
                onClick={() => setShowOriginal(!showOriginal)}
                className="px-4 py-1.5 rounded-full bg-card/80 backdrop-blur-md border border-border font-body text-xs text-foreground"
              >
                {showOriginal ? "Show Enhanced" : "Show Original"}
              </button>
            </div>
          )}
        </motion.div>
      )}
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
          {brandDisplayName && (
            <span className="font-body text-[10px] uppercase tracking-wider px-3 py-1 rounded-full bg-muted text-muted-foreground">
              {brandDisplayName}
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

      {/* ─── Recommended Products Section ─── */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="pt-2"
      >
        <p className="font-body text-[10px] uppercase tracking-widest text-gold font-medium mb-3">
          Recommended products for this look
        </p>

        <div className="space-y-3">
          {recommendedProducts.map((product, i) => {
            const isExpanded = expandedCategory === product.category;
            const guide = applicationGuides[product.category];
            return (
              <motion.div
                key={product.category}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.45 + i * 0.08 }}
                className="bg-card rounded-2xl border border-border overflow-hidden"
              >
                <button
                  onClick={() => setExpandedCategory(isExpanded ? null : product.category)}
                  className="w-full text-left p-4 flex items-center justify-between gap-3"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-body text-[10px] uppercase tracking-widest text-muted-foreground mb-1">
                      {product.category}
                    </p>
                    <p className="font-display text-sm font-semibold text-foreground">
                      {product.name}
                    </p>
                    <p className="font-body text-xs text-muted-foreground mt-0.5">
                      {product.shade}
                    </p>
                  </div>
                  {guide && (
                    <ChevronDown
                      size={16}
                      className={`text-muted-foreground flex-shrink-0 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}
                    />
                  )}
                </button>

                <AnimatePresence initial={false}>
                  {isExpanded && guide && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 pb-4 pt-0 border-t border-border">
                        <p className="font-body text-[10px] uppercase tracking-widest text-gold font-medium mt-3 mb-2">
                          How to apply
                        </p>
                        <p className="font-body text-xs text-muted-foreground leading-relaxed">
                          {guide}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* ─── Shop Buttons ─── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="space-y-2.5"
      >
        <p className="font-body text-[10px] uppercase tracking-widest text-muted-foreground">
          Shop this look
        </p>
        {shopLinks.map((link) => (
          <a
            key={link.label}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between w-full py-3.5 px-5 rounded-2xl bg-card border border-border hover:border-gold/30 transition-all group"
          >
            <span className="font-display text-sm font-medium text-foreground group-hover:text-gold transition-colors">
              {link.label}
            </span>
            <ExternalLink size={14} className="text-muted-foreground group-hover:text-gold transition-colors" />
          </a>
        ))}
      </motion.div>

      {/* ─── Privacy Notice ─── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="flex items-start gap-3 p-4 rounded-2xl bg-muted/50 border border-border"
      >
        <ShieldCheck size={16} className="text-gold flex-shrink-0 mt-0.5" />
        <p className="font-body text-xs text-muted-foreground leading-relaxed">
          We do not store your photos. Take a screenshot to save your look.
        </p>
      </motion.div>

      {/* Actions */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
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
