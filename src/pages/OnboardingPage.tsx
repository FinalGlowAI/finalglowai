import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Shield, ArrowRight, Eye } from "lucide-react";
import heroImage from "@/assets/hero-beauty.jpg";
import heroBrown from "@/assets/hero-beauty-brown.jpg";
import heroDark from "@/assets/hero-beauty-dark.jpg";

const heroImages = [heroImage, heroBrown, heroDark];

const slides = [
  {
    title: "Welcome to",
    highlight: "Deep D'Ark & Light Glow",
    subtitle: "Your AI Beauty Stylist",
    description: "Effortlessly match your makeup to any outfit, occasion, and skin tone.",
    icon: Sparkles,
  },
  {
    title: "Intelligent",
    highlight: "Color Matching",
    subtitle: "Powered by AI",
    description: "Select your outfit pieces and colors — our AI creates a harmonized beauty look just for you.",
    icon: Eye,
  },
  {
    title: "Your Privacy",
    highlight: "Comes First",
    subtitle: "Zero data stored",
    description: "No photos saved. No accounts needed. No tracking. Everything stays on your device.",
    icon: Shield,
  },
];

interface OnboardingPageProps {
  onComplete: () => void;
}

const OnboardingPage = ({ onComplete }: OnboardingPageProps) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [currentBgImage, setCurrentBgImage] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBgImage((prev) => (prev + 1) % heroImages.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);
  const next = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      onComplete();
    }
  };

  const slide = slides[currentSlide];
  const Icon = slide.icon;

  return (
    <div className="fixed inset-0 z-[100] bg-foreground overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.img
          key={currentBgImage}
          src={heroImages[currentBgImage]}
          alt="Beauty portrait"
          className="absolute inset-0 w-full h-full object-cover"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.55 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2, ease: "easeInOut" }}
        />
      </AnimatePresence>
      <div className="absolute inset-0 bg-gradient-to-b from-foreground/30 via-foreground/20 to-foreground/90" />

      {/* Content */}
      <div className="relative z-10 flex flex-col h-full safe-top safe-bottom">
        {/* Skip */}
        {currentSlide < slides.length - 1 && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={onComplete}
            className="absolute top-14 right-5 font-body text-xs tracking-wider uppercase text-background/50 hover:text-background/80 transition-colors z-20"
          >
            Skip
          </motion.button>
        )}

        {/* Main Content */}
        <div className="flex-1 flex flex-col justify-end px-8 pb-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            >
              {/* Icon */}
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.15, duration: 0.4 }}
                className="w-14 h-14 rounded-2xl gradient-gold flex items-center justify-center mb-8"
              >
                <Icon size={24} className="text-foreground" />
              </motion.div>

              {/* Title */}
              <h1 className="font-display text-4xl font-semibold leading-tight text-background/90 mb-1">
                {slide.title}
              </h1>
              <h1 className="font-display text-4xl font-semibold leading-tight text-gold mb-2">
                {slide.highlight}
              </h1>
              <p className="font-display text-base italic text-background/60 mb-4">
                {slide.subtitle}
              </p>
              <p className="font-body text-sm text-background/50 leading-relaxed max-w-[300px]">
                {slide.description}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Bottom Controls */}
        <div className="px-8 pb-10 flex items-center justify-between">
          {/* Dots */}
          <div className="flex gap-2">
            {slides.map((_, i) => (
              <motion.div
                key={i}
                className={`h-1 rounded-full ${i === currentSlide ? "w-6 gradient-gold" : "w-1.5 bg-background/20"}`}
                layout
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            ))}
          </div>

          {/* Next Button */}
          <motion.button
            onClick={next}
            whileTap={{ scale: 0.95 }}
            className="w-14 h-14 rounded-full gradient-gold flex items-center justify-center shadow-lg"
          >
            {currentSlide === slides.length - 1 ? (
              <Sparkles size={20} className="text-foreground" />
            ) : (
              <ArrowRight size={20} className="text-foreground" />
            )}
          </motion.button>
        </div>
      </div>
    </div>
  );
};

export default OnboardingPage;
