import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ChevronRight, Shield } from "lucide-react";
import heroImage from "@/assets/hero-beauty.jpg";
import heroBrown from "@/assets/hero-beauty-brown.jpg";
import heroDark from "@/assets/hero-beauty-dark.jpg";
import { useNavigate } from "react-router-dom";
import Footer from "@/components/Footer";

const heroImages = [heroImage, heroBrown, heroDark];

const HomePage = () => {
  const navigate = useNavigate();
  const [currentImage, setCurrentImage] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % heroImages.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen pb-20">
      {/* Hero Section */}
      <div className="relative h-[70vh] overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.img
            key={currentImage}
            src={heroImages[currentImage]}
            alt="Luxury beauty editorial"
            className="absolute inset-0 w-full h-full object-cover"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2, ease: "easeInOut" }}
          />
        </AnimatePresence>
        <div className="absolute inset-0 bg-gradient-to-b from-foreground/20 via-transparent to-background" />
        <div className="absolute inset-0 flex flex-col justify-end p-6 pb-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <h1 className="font-display text-5xl font-semibold tracking-tight text-primary-foreground leading-[1.1] mb-3">
              <span className="text-gold">LUXE</span>
            </h1>
            <p className="font-display text-xl text-primary-foreground/90 italic mb-1">
              AI Beauty Stylist
            </p>
            <p className="font-body text-sm text-primary-foreground/70 max-w-[260px]">
              Match your makeup to any outfit with AI precision
            </p>
          </motion.div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="px-5 -mt-6 relative z-10 space-y-3">
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          onClick={() => navigate("/outfit")}
          className="w-full gradient-gold rounded-2xl p-5 flex items-center justify-between shadow-lg"
        >
          <div className="flex items-center gap-3">
            <Sparkles size={22} className="text-foreground" />
            <div className="text-left">
              <p className="font-display text-lg font-semibold text-foreground">
                Start Styling
              </p>
              <p className="font-body text-xs text-foreground/70">
                Pick outfit colors → Get matched looks
              </p>
            </div>
          </div>
          <ChevronRight size={20} className="text-foreground/60" />
        </motion.button>

        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.5 }}
          onClick={() => navigate("/colors")}
          className="w-full bg-card rounded-2xl p-5 flex items-center justify-between border border-border"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-nude flex items-center justify-center">
              <div className="w-4 h-4 rounded-full gradient-gold" />
            </div>
            <div className="text-left">
              <p className="font-display text-base font-medium text-foreground">
                Color Analysis
              </p>
              <p className="font-body text-xs text-muted-foreground">
                Discover your perfect palette
              </p>
            </div>
          </div>
          <ChevronRight size={20} className="text-muted-foreground" />
        </motion.button>
      </div>

      {/* Privacy Badge */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="flex items-center justify-center gap-2 mt-8 px-5"
      >
        <Shield size={14} className="text-muted-foreground" />
        <p className="font-body text-xs text-muted-foreground tracking-wide">
          Privacy-first · No data stored · All processing on-device
        </p>
      </motion.div>

      <Footer />
    </div>
  );
};

export default HomePage;
