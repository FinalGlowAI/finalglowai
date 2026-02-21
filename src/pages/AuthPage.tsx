import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Lock, ArrowRight, Sparkles, Eye, EyeOff } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const AuthPage = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "signup" | "forgot">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (mode === "forgot") {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        if (error) throw error;
        toast.success("Check your email for the reset link!");
        setMode("login");
      } else if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Welcome back!");
        navigate("/home");
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin },
        });
        if (error) throw error;
        toast.success("Account created! You can now sign in.");
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const title = mode === "forgot" ? "Reset Password" : mode === "login" ? "FinalGlow AI" : "FinalGlow AI";
  const subtitle = mode === "forgot"
    ? "Enter your email to receive a reset link"
    : mode === "login"
    ? "Welcome back, gorgeous"
    : "Join the glow";

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 pb-24 safe-top bg-background">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm space-y-8"
      >
        {/* Logo */}
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl gradient-gold flex items-center justify-center mx-auto mb-4">
            <Sparkles size={28} className="text-foreground" />
          </div>
          <h1 className="font-display text-2xl font-semibold text-foreground">{title}</h1>
          <p className="font-body text-sm text-muted-foreground mt-1">{subtitle}</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-3">
            <div className="relative">
              <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-card border border-border font-body text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-gold/50 transition-colors"
              />
            </div>
            {mode !== "forgot" && (
              <div className="relative">
                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full pl-11 pr-11 py-3.5 rounded-2xl bg-card border border-border font-body text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-gold/50 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            )}
          </div>

          {mode === "login" && (
            <div className="text-right">
              <button
                type="button"
                onClick={() => setMode("forgot")}
                className="font-body text-xs text-gold hover:underline"
              >
                Forgot password?
              </button>
            </div>
          )}

          <motion.button
            type="submit"
            disabled={loading}
            whileTap={{ scale: 0.98 }}
            className="w-full py-4 rounded-2xl gradient-gold font-display text-base font-medium text-foreground shadow-lg shadow-gold/20 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading
              ? "Please wait…"
              : mode === "forgot"
              ? "Send Reset Link"
              : mode === "login"
              ? "Sign In"
              : "Create Account"}
            <ArrowRight size={16} />
          </motion.button>
        </form>

        <p className="text-center font-body text-sm text-muted-foreground">
          {mode === "forgot" ? (
            <>
              Remember your password?{" "}
              <button onClick={() => setMode("login")} className="text-gold font-medium hover:underline">
                Sign In
              </button>
            </>
          ) : mode === "login" ? (
            <>
              Don't have an account?{" "}
              <button onClick={() => setMode("signup")} className="text-gold font-medium hover:underline">
                Sign Up
              </button>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <button onClick={() => setMode("login")} className="text-gold font-medium hover:underline">
                Sign In
              </button>
            </>
          )}
        </p>
      </motion.div>
    </div>
  );
};

export default AuthPage;
