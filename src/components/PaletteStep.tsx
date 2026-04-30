import { motion } from "framer-motion";
import { Check, Sparkles, Gauge } from "lucide-react";
import type { MakeupPalette } from "@/lib/makeupPalettes";

// Tailwind classes for confidence colors
const confidenceTone = (score: number) => {
  if (score >= 88) return { dot: "bg-emerald-500", text: "text-emerald-500", bar: "bg-emerald-500" };
  if (score >= 75) return { dot: "bg-gold", text: "text-gold", bar: "bg-gold" };
  if (score >= 60) return { dot: "bg-amber-500", text: "text-amber-500", bar: "bg-amber-500" };
  return { dot: "bg-muted-foreground", text: "text-muted-foreground", bar: "bg-muted-foreground" };
};

interface PaletteStepProps {
  palettes: MakeupPalette[];
  selectedPaletteId: string | null;
  onSelect: (id: string) => void;
  skinTone: string;
}

// ─── Mini face preview – CSS-only oval with tinted lip / eye / cheek zones
const MiniFacePreview = ({ palette, skinTone }: { palette: MakeupPalette | null; skinTone: string }) => (
  <div className="relative w-32 h-40 mx-auto">
    {/* Face oval */}
    <div
      className="absolute inset-0 rounded-[50%] border border-border shadow-inner"
      style={{ backgroundColor: skinTone }}
    />
    {/* Eyeshadow – two arcs */}
    {palette && (
      <>
        <div
          className="absolute rounded-full opacity-60 blur-[2px]"
          style={{
            top: "32%", left: "22%", width: "20%", height: "8%",
            backgroundColor: palette.eyeshadowColor,
          }}
        />
        <div
          className="absolute rounded-full opacity-60 blur-[2px]"
          style={{
            top: "32%", right: "22%", width: "20%", height: "8%",
            backgroundColor: palette.eyeshadowColor,
          }}
        />
        {/* Pupils for character */}
        <div className="absolute rounded-full bg-foreground/70" style={{ top: "36%", left: "28%", width: "5%", height: "4%" }} />
        <div className="absolute rounded-full bg-foreground/70" style={{ top: "36%", right: "28%", width: "5%", height: "4%" }} />
        {/* Blush – two soft circles */}
        <div
          className="absolute rounded-full opacity-50 blur-[3px]"
          style={{
            top: "55%", left: "12%", width: "22%", height: "16%",
            backgroundColor: palette.blushColor,
          }}
        />
        <div
          className="absolute rounded-full opacity-50 blur-[3px]"
          style={{
            top: "55%", right: "12%", width: "22%", height: "16%",
            backgroundColor: palette.blushColor,
          }}
        />
        {/* Lips */}
        <div
          className="absolute rounded-full"
          style={{
            top: "75%", left: "32%", width: "36%", height: "7%",
            backgroundColor: palette.lipColor,
            boxShadow: `0 0 6px ${palette.lipColor}`,
          }}
        />
      </>
    )}
  </div>
);

const PaletteStep = ({ palettes, selectedPaletteId, onSelect, skinTone }: PaletteStepProps) => {
  const selected = palettes.find((p) => p.id === selectedPaletteId) || null;

  return (
    <div className="px-5 space-y-5">
      <div className="text-center space-y-1.5">
        <p className="font-body text-[10px] uppercase tracking-widest text-gold font-medium">
          Step Preview
        </p>
        <h2 className="font-display text-xl font-semibold text-foreground">
          Choose your makeup palette
        </h2>
        <p className="font-body text-xs text-muted-foreground">
          Curated from your outfit. Tap one to preview before scanning.
        </p>
      </div>

      {/* Live preview */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-gold/20 bg-card p-5 flex flex-col items-center gap-3"
      >
        <MiniFacePreview palette={selected} skinTone={skinTone} />
        {selected ? (
          <div className="text-center w-full">
            <p className="font-display text-base font-semibold text-foreground">{selected.name}</p>
            <p className="font-body text-xs text-muted-foreground mt-0.5">{selected.description}</p>

            {/* Confidence meter */}
            <div className="mt-3 px-2">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-1.5">
                  <Gauge size={11} className={confidenceTone(selected.confidence).text} />
                  <span className="font-body text-[10px] uppercase tracking-widest text-muted-foreground">
                    Match confidence
                  </span>
                </div>
                <span className={`font-display text-xs font-semibold ${confidenceTone(selected.confidence).text}`}>
                  {selected.confidence}% · {selected.confidenceLabel}
                </span>
              </div>
              <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                <motion.div
                  key={selected.id}
                  initial={{ width: 0 }}
                  animate={{ width: `${selected.confidence}%` }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  className={`h-full ${confidenceTone(selected.confidence).bar}`}
                />
              </div>
              <p className="font-body text-[10px] text-muted-foreground mt-1.5 italic">
                {selected.confidenceReason}
              </p>
            </div>
          </div>
        ) : (
          <p className="font-body text-xs text-muted-foreground">Select a palette below</p>
        )}
      </motion.div>

      {/* Palette cards */}
      <div className="grid grid-cols-2 gap-3">
        {palettes.map((p, i) => {
          const isSelected = selectedPaletteId === p.id;
          return (
            <motion.button
              key={p.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => onSelect(p.id)}
              className={`relative text-left p-3 rounded-2xl border transition-all bg-card ${
                isSelected ? "border-gold shadow-md" : "border-border hover:border-gold/30"
              }`}
            >
              {isSelected && (
                <div className="absolute top-2 right-2 w-5 h-5 rounded-full gradient-gold flex items-center justify-center">
                  <Check size={10} className="text-foreground" />
                </div>
              )}
              <div className="flex gap-1.5 mb-2.5">
                {[p.lipColor, p.eyeshadowColor, p.blushColor].map((c, idx) => (
                  <div
                    key={idx}
                    className="flex-1 h-7 rounded-lg border border-border/40"
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
              <p className="font-display text-sm font-semibold text-foreground leading-tight">{p.name}</p>
              <p className="font-body text-[10px] text-muted-foreground mt-1 leading-snug">
                {p.description}
              </p>
              <div className="flex gap-1 mt-2">
                {["Lip", "Eye", "Blush"].map((l) => (
                  <span
                    key={l}
                    className="font-body text-[8px] uppercase tracking-wider text-muted-foreground"
                  >
                    {l}
                  </span>
                ))}
              </div>
            </motion.button>
          );
        })}
      </div>

      <div className="flex items-center gap-2 justify-center pt-1">
        <Sparkles size={12} className="text-gold" />
        <p className="font-body text-[10px] text-muted-foreground">
          Your AI scan will use the exact shades shown above
        </p>
      </div>
    </div>
  );
};

export default PaletteStep;
