import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Shield, Eye, Trash2, Info, ChevronRight, Crown, LogOut, LogIn, RefreshCw, Tag } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

const ProfilePage = () => {
  const navigate = useNavigate();
  const { user, subscribed, subscriptionEnd, signOut, checkSubscription, loading: authLoading } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [showCoupon, setShowCoupon] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      toast.info("Please sign in first");
      navigate("/");
    }
  }, [authLoading, user, navigate]);
  const [privacyOpen, setPrivacyOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);
  const [clearCacheOpen, setClearCacheOpen] = useState(false);
  const [portalLoading, setPortalLoading] = useState(false);

  const handleRefreshSubscription = async () => {
    setRefreshing(true);
    await checkSubscription();
    setRefreshing(false);
    toast.success("Subscription status refreshed");
  };

  const handleClearCache = async () => {
    try {
      if ("caches" in window) {
        const keys = await caches.keys();
        await Promise.all(keys.map((k) => caches.delete(k)));
      }
      localStorage.clear();
      sessionStorage.clear();
      toast.success("Cache cleared successfully!");
    } catch {
      toast.error("Failed to clear cache");
    }
    setClearCacheOpen(false);
  };

  const handleCheckout = () => {
    const email = user?.email ? `?prefilled_email=${encodeURIComponent(user.email)}` : "";
    window.open(`https://buy.stripe.com/fZuaEQeWN0qP8Ib63e3Nm03${email}`, "_blank");
  };

  const handleManageSubscription = async () => {
    setPortalLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("customer-portal");
      if (error) throw error;
      if (data?.url) window.location.href = data.url;
    } catch (err: any) {
      toast.error(err.message || "Failed to open portal");
    } finally {
      setPortalLoading(false);
    }
  };

  const settingsItems = [
    ...(user ? [{ icon: RefreshCw, label: "Refresh Subscription", desc: "Check your current plan status", action: handleRefreshSubscription }] : []),
    { icon: Eye, label: "Privacy Policy", desc: "How we protect your data", action: () => setPrivacyOpen(true) },
    { icon: Trash2, label: "Clear Cache", desc: "Remove temporary files", action: () => setClearCacheOpen(true) },
    { icon: Info, label: "About FinalGlow", desc: "Version 1.0.0", action: () => setAboutOpen(true) },
  ];

  return (
    <div className="min-h-screen pb-24 safe-top">
      <div className="px-5 pt-14 pb-6">
        <h1 className="font-display text-2xl font-semibold text-foreground">
          Profile
        </h1>
        <p className="font-body text-sm text-muted-foreground mt-1">
          {user ? user.email : "Your privacy, your control"}
        </p>
      </div>

      {/* Auth / Subscription Banner */}
      {!user ? (
        <motion.button
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={() => navigate("/auth")}
          className="mx-5 mb-6 rounded-2xl gradient-gold p-5 w-[calc(100%-2.5rem)] text-left"
        >
          <div className="flex items-center gap-3">
            <LogIn size={22} className="text-foreground flex-shrink-0" />
            <div>
              <p className="font-display text-base font-semibold text-foreground">
                Sign In
              </p>
              <p className="font-body text-xs text-foreground/80 mt-0.5">
                Create an account to unlock premium features
              </p>
            </div>
            <ChevronRight size={18} className="text-foreground/60 ml-auto" />
          </div>
        </motion.button>
      ) : !subscribed ? (
        <>
          <motion.button
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={() => handleCheckout()}
            disabled={checkoutLoading}
            className="mx-5 mb-6 rounded-2xl gradient-gold p-5 w-[calc(100%-2.5rem)] text-left disabled:opacity-60"
          >
            <div className="flex items-center gap-3">
              <Crown size={22} className="text-foreground flex-shrink-0" />
              <div>
                <p className="font-display text-base font-semibold text-foreground">
                  Upgrade to Pro — $9.99/mo
                </p>
                <p className="font-body text-xs text-foreground/80 mt-0.5">
                  Unlock "See My Look" face scan & AI enhancement
                </p>
              </div>
              <ChevronRight size={18} className="text-foreground/60 ml-auto" />
            </div>
          </motion.button>
        </>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-5 mb-6 rounded-2xl gradient-gold p-5"
        >
          <div className="flex items-start gap-3">
            <Crown size={22} className="text-foreground flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-display text-base font-semibold text-foreground">
                FinalGlow Pro
              </p>
              <p className="font-body text-xs text-foreground/80 mt-0.5">
                Active{subscriptionEnd ? ` · Renews ${new Date(subscriptionEnd).toLocaleDateString()}` : ""}
              </p>
              <button
                onClick={handleManageSubscription}
                disabled={portalLoading}
                className="font-body text-xs text-foreground underline mt-2 disabled:opacity-60"
              >
                {portalLoading ? "Loading…" : "Manage Subscription"}
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Privacy Banner */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mx-5 mb-6 rounded-2xl bg-card border border-border p-5"
      >
        <div className="flex items-start gap-3">
          <Shield size={22} className="text-muted-foreground flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-display text-base font-semibold text-foreground">
              Privacy First
            </p>
            <p className="font-body text-xs text-muted-foreground mt-1 leading-relaxed">
              FinalGlow AI never stores your photos or personal data. All analysis happens locally on your device.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Settings */}
      <div className="px-5 space-y-2">
        <p className="font-body text-[10px] uppercase tracking-widest text-muted-foreground mb-2 px-1">
          Privacy & Data
        </p>
        {settingsItems.map((item, i) => {
          const Icon = item.icon;
          return (
            <motion.button
              key={item.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + i * 0.08 }}
              onClick={item.action}
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

        {/* Sign Out */}
        {user && (
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            onClick={async () => { await signOut(); toast.success("Signed out"); }}
            className="w-full flex items-center gap-3 p-4 rounded-xl bg-card border border-border text-left hover:border-destructive/30 transition-colors"
          >
            <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center">
              <LogOut size={16} className="text-muted-foreground" />
            </div>
            <div className="flex-1">
              <p className="font-body text-sm font-medium text-foreground">Sign Out</p>
              <p className="font-body text-xs text-muted-foreground">{user.email}</p>
            </div>
          </motion.button>
        )}
      </div>

      {/* Footer */}
      <div className="mt-10 text-center">
        <p className="font-display text-lg text-gold tracking-wider">FinalGlow AI</p>
        <p className="font-body text-[10px] text-muted-foreground mt-1 uppercase tracking-widest">
          Beauty, Redefined
        </p>
      </div>

      {/* ── Privacy Policy Dialog ── */}
      <AlertDialog open={privacyOpen} onOpenChange={setPrivacyOpen}>
        <AlertDialogContent className="max-w-md max-h-[80vh] overflow-y-auto rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display text-lg">Privacy Policy</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
                <p><strong className="text-foreground">No data collection.</strong> FinalGlow AI does not collect, store, or share any personal information.</p>
                <p><strong className="text-foreground">On-device processing.</strong> All face scanning and color analysis run entirely on your device. No images are uploaded to any server.</p>
                <p><strong className="text-foreground">No accounts required.</strong> You can use the app without creating an account or providing any personal details.</p>
                <p><strong className="text-foreground">Third-party links.</strong> When you tap "Shop this look," you are redirected to external retailer websites. Their own privacy policies apply.</p>
                <p><strong className="text-foreground">Cache & local storage.</strong> Temporary data may be stored on your device for performance. You can clear it anytime from the Profile page.</p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction className="rounded-xl">Got it</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ── Clear Cache Dialog ── */}
      <AlertDialog open={clearCacheOpen} onOpenChange={setClearCacheOpen}>
        <AlertDialogContent className="max-w-sm rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display text-lg">Clear Cache</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove all temporary files and local storage. The app will reload fresh.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleClearCache} className="rounded-xl">Clear</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ── About Dialog ── */}
      <AlertDialog open={aboutOpen} onOpenChange={setAboutOpen}>
        <AlertDialogContent className="max-w-sm rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display text-lg">About FinalGlow</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p className="font-display text-gold text-base">FinalGlow AI</p>
                <p>Version 1.0.0</p>
                <p>AI-powered beauty stylist that matches makeup to your outfit, skin tone, and personal style.</p>
                <p className="text-xs pt-2">© {new Date().getFullYear()} FinalGlow AI. All rights reserved.</p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction className="rounded-xl">Close</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ProfilePage;
