import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ChevronDown, RotateCcw, Share2, ExternalLink, ShieldCheck, Download } from "lucide-react";
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
interface GuideStep {
  icon: string;
  text: string;
}

// Map alternate area names to guide keys
const areaToGuideKey: Record<string, string> = {
  Cheeks: "Blush",
  Base: "Foundation",
  Skin: "Foundation",
};

const applicationGuides: Record<string, GuideStep[]> = {
  Foundation: [
    { icon: "💧", text: "Start with a pea-sized amount on the back of your hand" },
    { icon: "🖌️", text: "Using a damp beauty sponge or brush, dot product on forehead, cheeks, nose & chin" },
    { icon: "✋", text: "Blend outward from the center of your face in light, even strokes" },
    { icon: "✨", text: "Build coverage gradually — less is more for a natural finish" },
  ],
  Lipstick: [
    { icon: "🫧", text: "Exfoliate lips gently beforehand for a smooth canvas" },
    { icon: "✏️", text: "Line your lips with a matching liner for definition" },
    { icon: "💄", text: "Apply from the center of your upper lip outward, then glide across the lower lip" },
    { icon: "💋", text: "Blot with a tissue and reapply for longer-lasting color" },
  ],
  Highlighter: [
    { icon: "😊", text: "Smile to find the highest points of your cheekbones" },
    { icon: "🖌️", text: "Using a fan brush or fingertip, sweep along cheekbone tops" },
    { icon: "👃", text: "Add to the bridge of your nose, cupid's bow & inner eye corners" },
    { icon: "✨", text: "Blend edges so the glow looks lit-from-within" },
  ],
  Eyes: [
    { icon: "🧴", text: "Apply a primer on lids first for lasting wear" },
    { icon: "🎨", text: "Pat a base shade across the lid, then deepen the crease with a darker tone" },
    { icon: "✨", text: "Add shimmer to the center of the lid with your fingertip" },
    { icon: "✏️", text: "Line the lash line with short, feathered strokes" },
  ],
  Lips: [
    { icon: "💧", text: "Hydrate lips with balm, then blot" },
    { icon: "✏️", text: "Outline your natural lip shape with liner — slightly overdraw for fullness" },
    { icon: "💄", text: "Fill in with your chosen color, starting at the center" },
    { icon: "💋", text: "Blend outward for a seamless, polished finish" },
  ],
  Blush: [
    { icon: "😊", text: "Smile and locate the apples of your cheeks" },
    { icon: "🖌️", text: "Apply blush using a fluffy brush in soft, circular motions" },
    { icon: "⬆️", text: "Sweep upward toward your temples for a lifted look" },
    { icon: "👆", text: "For cream blush, use fingertips for a dewy finish" },
  ],
  Contour: [
    { icon: "🔍", text: "Suck in cheeks to find the hollows — that's your guide" },
    { icon: "✏️", text: "Draw along hollows, jawline & hairline with bronzer or contour stick" },
    { icon: "🖌️", text: "Blend thoroughly with a dense brush using upward strokes" },
    { icon: "👌", text: "Keep it subtle — harsh lines break the illusion" },
  ],
  Brows: [
    { icon: "🪥", text: "Brush brows upward with a spoolie" },
    { icon: "✏️", text: "Fill sparse areas with light, hair-like strokes" },
    { icon: "📐", text: "Follow your natural arch — avoid over-drawing" },
    { icon: "💫", text: "Set with a clear or tinted brow gel for all-day hold" },
  ],
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
  const [expandedArea, setExpandedArea] = useState<string | null>(null);
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
      {results.map((item, i) => {
        const areaKey = item.area;
        const isAreaExpanded = expandedArea === areaKey;
        const areaGuide = applicationGuides[areaKey] || applicationGuides[areaToGuideKey[areaKey]];
        return (
          <motion.div
            key={item.area}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.08 }}
            className="bg-card rounded-2xl border border-border hover:border-gold/20 transition-colors overflow-hidden"
          >
            <button
              onClick={() => areaGuide && setExpandedArea(isAreaExpanded ? null : areaKey)}
              className="w-full text-left p-4"
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
                {areaGuide && (
                  <ChevronDown
                    size={16}
                    className={`text-muted-foreground mt-2 flex-shrink-0 transition-transform duration-200 ${isAreaExpanded ? "rotate-180" : ""}`}
                  />
                )}
              </div>
            </button>

            <AnimatePresence initial={false}>
              {isAreaExpanded && areaGuide && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="overflow-hidden"
                >
                  <div className="px-4 pb-4 pt-0 border-t border-border">
                     <p className="font-body text-[10px] uppercase tracking-widest text-gold font-medium mt-3 mb-3">
                       How to apply
                     </p>
                     <div className="space-y-3">
                       {areaGuide.map((step, idx) => (
                         <div key={idx} className="flex items-start gap-3">
                           <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0 text-sm">
                             {step.icon}
                           </div>
                           <div className="flex-1 min-w-0">
                             <p className="font-body text-[10px] uppercase tracking-widest text-muted-foreground mb-0.5">Step {idx + 1}</p>
                             <p className="font-body text-xs text-foreground leading-relaxed">{step.text}</p>
                           </div>
                         </div>
                       ))}
                     </div>
                   </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        );
      })}

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
                         <p className="font-body text-[10px] uppercase tracking-widest text-gold font-medium mt-3 mb-3">
                           How to apply
                         </p>
                         <div className="space-y-3">
                           {guide.map((step, idx) => (
                             <div key={idx} className="flex items-start gap-3">
                               <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0 text-sm">
                                 {step.icon}
                               </div>
                               <div className="flex-1 min-w-0">
                                 <p className="font-body text-[10px] uppercase tracking-widest text-muted-foreground mb-0.5">Step {idx + 1}</p>
                                 <p className="font-body text-xs text-foreground leading-relaxed">{step.text}</p>
                               </div>
                             </div>
                           ))}
                         </div>
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
        className="space-y-3 pt-2"
      >
        {/* Download enhanced photo */}
        {enhancedImage && !isEnhancing && (
          <button
            onClick={() => {
              const link = document.createElement("a");
              link.href = enhancedImage;
              link.download = "enhanced-beauty-look.png";
              link.click();
            }}
            className="w-full py-3.5 rounded-2xl gradient-gold font-display text-sm font-medium text-foreground shadow-lg flex items-center justify-center gap-2"
          >
            <Download size={14} />
            Save Enhanced Photo
          </button>
        )}

        {/* Social Media Share Buttons */}
        <div className="space-y-2.5">
          <p className="font-body text-[10px] uppercase tracking-widest text-muted-foreground">
            Share on social media
          </p>
          <div className="grid grid-cols-2 gap-2.5">
            {[
              {
                label: "WhatsApp",
                icon: (
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                ),
                color: "bg-[#25D366]/10 text-[#25D366] border-[#25D366]/20 hover:bg-[#25D366]/20",
                getUrl: (text: string) => `https://wa.me/?text=${encodeURIComponent(text)}`,
              },
              {
                label: "X (Twitter)",
                icon: (
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                ),
                color: "bg-foreground/5 text-foreground border-border hover:bg-foreground/10",
                getUrl: (text: string) => `https://x.com/intent/tweet?text=${encodeURIComponent(text)}`,
              },
              {
                label: "Facebook",
                icon: (
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                ),
                color: "bg-[#1877F2]/10 text-[#1877F2] border-[#1877F2]/20 hover:bg-[#1877F2]/20",
                getUrl: (text: string) => `https://www.facebook.com/sharer/sharer.php?quote=${encodeURIComponent(text)}`,
              },
              {
                label: "Pinterest",
                icon: (
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                    <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 01.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12.017 24c6.624 0 11.99-5.367 11.99-11.988C24.007 5.367 18.641 0 12.017 0z" />
                  </svg>
                ),
                color: "bg-[#E60023]/10 text-[#E60023] border-[#E60023]/20 hover:bg-[#E60023]/20",
                getUrl: (text: string) => `https://pinterest.com/pin/create/button/?description=${encodeURIComponent(text)}`,
              },
            ].map((platform) => {
              const shareText = `Check out my ${style.replace("_", " ")} beauty look curated by FinalGlow AI! ✨💄`;
              return (
                <button
                  key={platform.label}
                  onClick={async () => {
                    // Try Web Share API with image file first (works on mobile for WhatsApp etc.)
                    if (navigator.share && enhancedImage) {
                      try {
                        const res = await fetch(enhancedImage);
                        const blob = await res.blob();
                        const file = new File([blob], "beauty-look.png", { type: blob.type });
                        const shareData: ShareData = {
                          title: "My FinalGlow Beauty Look",
                          text: shareText,
                        };
                        if (navigator.canShare?.({ files: [file] })) {
                          shareData.files = [file];
                        }
                        await navigator.share(shareData);
                        return;
                      } catch (e) {
                        // User cancelled or API failed — fall through to URL
                      }
                    }
                    // Fallback: open platform URL (text-only)
                    window.open(platform.getUrl(shareText), "_blank", "noopener,noreferrer");
                  }}
                  className={`flex items-center justify-center gap-2 py-3 rounded-2xl border font-body text-sm font-medium transition-all ${platform.color}`}
                >
                  {platform.icon}
                  {platform.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onStartOver}
            className="flex-1 py-3.5 rounded-2xl border border-border font-body text-sm text-muted-foreground hover:text-foreground hover:bg-card transition-all flex items-center justify-center gap-2"
          >
            <RotateCcw size={14} />
            Start Over
          </button>
          <button
            onClick={async () => {
              const shareText = `Check out my ${style.replace("_", " ")} beauty look curated by FinalGlow AI! ✨💄`;
              if (navigator.share) {
                const shareData: ShareData = { title: "My FinalGlow Beauty Look", text: shareText };
                if (enhancedImage) {
                  try {
                    const res = await fetch(enhancedImage);
                    const blob = await res.blob();
                    const file = new File([blob], "beauty-look.png", { type: blob.type });
                    if (navigator.canShare?.({ files: [file] })) shareData.files = [file];
                  } catch {}
                }
                try { await navigator.share(shareData); } catch {}
              } else {
                await navigator.clipboard.writeText(shareText);
                const { toast } = await import("sonner");
                toast.success("Look details copied to clipboard!");
              }
            }}
            className="flex-1 py-3.5 rounded-2xl border border-border font-body text-sm text-muted-foreground hover:text-foreground hover:bg-card transition-all flex items-center justify-center gap-2"
          >
            <Share2 size={14} />
            Share Look
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default MakeupResultStep;
