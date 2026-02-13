import { motion } from "framer-motion";
import { Shield, Eye, Trash2, Info, ChevronRight } from "lucide-react";

const ProfilePage = () => {
  return (
    <div className="min-h-screen pb-24 safe-top">
      <div className="px-5 pt-14 pb-6">
        <h1 className="font-display text-2xl font-semibold text-foreground">
          Profile
        </h1>
        <p className="font-body text-sm text-muted-foreground mt-1">
          Your privacy, your control
        </p>
      </div>

      {/* Privacy Banner */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-5 mb-6 rounded-2xl gradient-gold p-5"
      >
        <div className="flex items-start gap-3">
          <Shield size={22} className="text-foreground flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-display text-base font-semibold text-foreground">
              Privacy First
            </p>
            <p className="font-body text-xs text-foreground/80 mt-1 leading-relaxed">
              Deep D'Ark & Light Glow never stores your photos or personal data. All analysis happens locally on your device.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Settings */}
      <div className="px-5 space-y-2">
        <p className="font-body text-[10px] uppercase tracking-widest text-muted-foreground mb-2 px-1">
          Privacy & Data
        </p>
        {[
          { icon: Eye, label: "Privacy Policy", desc: "How we protect your data" },
          { icon: Trash2, label: "Clear Cache", desc: "Remove temporary files" },
          { icon: Info, label: "About DD&LG", desc: "Version 1.0.0" },
        ].map((item, i) => {
          const Icon = item.icon;
          return (
            <motion.button
              key={item.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="w-full flex items-center gap-3 p-4 rounded-xl bg-card border border-border text-left hover:border-gold/30 transition-colors"
            >
              <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center">
                <Icon size={16} className="text-muted-foreground" />
              </div>
              <div className="flex-1">
                <p className="font-body text-sm font-medium text-foreground">
                  {item.label}
                </p>
                <p className="font-body text-xs text-muted-foreground">
                  {item.desc}
                </p>
              </div>
              <ChevronRight size={16} className="text-muted-foreground" />
            </motion.button>
          );
        })}
      </div>

      {/* Footer */}
      <div className="mt-10 text-center">
        <p className="font-display text-lg text-gold tracking-wider">Deep D'Ark & Light Glow</p>
        <p className="font-body text-[10px] text-muted-foreground mt-1 uppercase tracking-widest">
          Beauty, Redefined
        </p>
      </div>
    </div>
  );
};

export default ProfilePage;
