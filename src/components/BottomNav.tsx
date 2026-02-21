import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Home, Sparkles, Palette, User, Flame } from "lucide-react";

const tabs = [
  { path: "/home", icon: Home, label: "Home" },
  { path: "/outfit", icon: Sparkles, label: "Stylist" },
  { path: "/community", icon: Flame, label: "Glow" },
  { path: "/colors", icon: Palette, label: "Colors" },
  { path: "/profile", icon: User, label: "Profile" },
];

const BottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-t border-border safe-bottom">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-4">
        {tabs.map((tab) => {
          const isActive = location.pathname === tab.path;
          const Icon = tab.icon;
          return (
            <button
              key={tab.path}
              onClick={() => navigate(tab.path)}
              className="relative flex flex-col items-center justify-center w-16 h-full gap-0.5 transition-colors"
            >
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute -top-px left-1/2 -translate-x-1/2 w-8 h-0.5 gradient-gold rounded-full"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <Icon
                size={20}
                className={isActive ? "text-gold" : "text-muted-foreground"}
                strokeWidth={isActive ? 2 : 1.5}
              />
              <span
                className={`text-[10px] tracking-wide uppercase font-body ${
                  isActive ? "text-gold font-medium" : "text-muted-foreground font-normal"
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
