import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import {
  initRevenueCat,
  logOutRevenueCat,
  isNativeAndroid,
  hasProEntitlement,
} from "@/lib/revenuecat";
import { Purchases } from "@revenuecat/purchases-capacitor";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  subscribed: boolean;
  subscriptionEnd: string | null;
  checkSubscription: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  subscribed: false,
  subscriptionEnd: null,
  checkSubscription: async () => {},
  signOut: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [subscribed, setSubscribed] = useState(false);
  const [subscriptionEnd, setSubscriptionEnd] = useState<string | null>(null);

  const checkSubscription = async () => {
    try {
      // 1. On Android, check RevenueCat first (Play Billing)
      if (isNativeAndroid()) {
        try {
          const { customerInfo } = await Purchases.getCustomerInfo();
          if (hasProEntitlement(customerInfo)) {
            const ent = customerInfo.entitlements.active["pro"];
            setSubscribed(true);
            setSubscriptionEnd(ent?.expirationDate ?? null);
            return;
          }
        } catch (e) {
          console.warn("[AuthContext] RevenueCat check failed", e);
        }
      }

      // 2. Fallback / web / iOS: Stripe via edge function
      const { data, error } = await supabase.functions.invoke("check-subscription");
      if (error) throw error;
      setSubscribed(data?.subscribed ?? false);
      setSubscriptionEnd(data?.subscription_end ?? null);
    } catch {
      setSubscribed(false);
      setSubscriptionEnd(null);
    }
  };

  const signOut = async () => {
    await logOutRevenueCat();
    await supabase.auth.signOut();
    setSubscribed(false);
    setSubscriptionEnd(null);
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Check subscription when user changes
  useEffect(() => {
    if (user) {
      // Initialize RevenueCat with the Supabase user id as appUserID (Android only)
      initRevenueCat(user.id).catch((e) =>
        console.warn("[AuthContext] RevenueCat init failed", e)
      );
      checkSubscription();
      const interval = setInterval(checkSubscription, 60000);

      // Re-check when tab regains focus (e.g. returning from Stripe checkout)
      const handleVisibility = () => {
        if (document.visibilityState === "visible") {
          checkSubscription();
        }
      };
      document.addEventListener("visibilitychange", handleVisibility);

      return () => {
        clearInterval(interval);
        document.removeEventListener("visibilitychange", handleVisibility);
      };
    } else {
      setSubscribed(false);
      setSubscriptionEnd(null);
    }
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, session, loading, subscribed, subscriptionEnd, checkSubscription, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};
