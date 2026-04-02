import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ChevronRight, Shield, Camera, Palette, Wand2, ArrowDown } from "lucide-react";
import heroImage from "@/assets/hero-beauty.jpg";
import heroBrown from "@/assets/hero-beauty-brown.jpg";
import heroDark from "@/assets/hero-beauty-dark.jpg";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import Footer from "@/components/Footer";

const heroImages = [heroImage, heroBrown, heroDark];

const steps = [
  {
    icon: Palette,
    title: "Pick Your Outfit Colors",
    description: "Select the colors of your outfit or snap a photo — our AI detects the palette instantly.",
  },
  {
    icon: Sparkles,
    title: "Choose Your Vibe",
    description: "From minimal no-makeup looks to full glam — pick a style and adjust the intensity.",
  },
  {
    icon: Camera,
    title: "Scan Your Face",
    description: "Take a quick selfie so our AI can match makeup to your unique skin tone and features.",
  },
  {
    icon: Wand2,
    title: "Get Your AI Look",
    description: "Receive an AI-enhanced portrait with perfectly matched makeup — ready to recreate.",
  },
];

const HomePage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentImage, setCurrentImage] = useState(0);
  const howItWorksRef = useRef<HTMLDivElement>(null);

  const handleProtectedNav = (path: string) => {
    if (!user) {
      toast.info("Please sign in first");
      navigate("/");
    } else {
      navigate(path);
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % heroImages.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const scrollToHowItWorks = () => {
    howItWorksRef.current?.scrollIntoView({ behavior: "smooth" });
  };

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
            <h1 className="font-display text-3xl font-semibold tracking-tight text-primary-foreground leading-[1.1] mb-3">
              <span className="text-primary">FinalGlow AI</span>
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
          onClick={() => handleProtectedNav("/outfit")}
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
          onClick={() => handleProtectedNav("/colors")}
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

        {/* How It Works Button */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          onClick={scrollToHowItWorks}
          className="w-full bg-card/80 rounded-2xl p-4 flex items-center justify-center gap-2 border border-border/50"
        >
          <p className="font-display text-sm font-medium text-muted-foreground">
            How It Works
          </p>
          <ArrowDown size={16} className="text-gold animate-bounce" />
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

      {/* How It Works Section */}
      <div ref={howItWorksRef} className="px-5 mt-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <p className="font-body text-[10px] uppercase tracking-[0.2em] text-gold mb-2">
            Simple & Intuitive
          </p>
          <h2 className="font-display text-2xl font-semibold text-foreground">
            How It Works
          </h2>
        </motion.div>

        <div className="space-y-4">
          {steps.map((step, index) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-30px" }}
              transition={{ duration: 0.5, delay: index * 0.12 }}
              className="bg-card rounded-2xl p-5 border border-border flex gap-4 items-start"
            >
              <div className="flex-shrink-0 w-10 h-10 rounded-xl gradient-gold flex items-center justify-center">
                <step.icon size={20} className="text-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-body text-[10px] font-semibold text-gold uppercase tracking-wider">
                    Step {index + 1}
                  </span>
                </div>
                <p className="font-display text-base font-medium text-foreground leading-snug mb-1">
                  {step.title}
                </p>
                <p className="font-body text-xs text-muted-foreground leading-relaxed">
                  {step.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA after steps */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.5 }}
          onClick={() => handleProtectedNav("/outfit")}
          className="w-full gradient-gold rounded-2xl p-4 mt-6 flex items-center justify-center gap-2 shadow-lg"
        >
          <Sparkles size={18} className="text-foreground" />
          <p className="font-display text-base font-semibold text-foreground">
            Try It Now — It's Free
          </p>
        </motion.button>
      </div>

      <Footer />
    </div>
  );
};

export default HomePage;
