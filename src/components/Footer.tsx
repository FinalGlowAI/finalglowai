import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Link } from "react-router-dom";
import { ExternalLink } from "lucide-react";


const Footer = () => {
  return (
    <footer className="px-5 pt-8 pb-28 mt-6">
      <Separator className="mb-6 bg-border" />

      {/* Brand */}
      <p className="font-display text-lg text-gold tracking-wider text-center mb-4">
        FinalGlow AI
      </p>

      {/* About Us */}
      <div className="mb-5">
        <p className="font-body text-[10px] uppercase tracking-widest text-muted-foreground mb-2">
          About Us
        </p>
        <p className="font-body text-xs text-muted-foreground leading-relaxed">
          FinalGlow AI is an AI beauty stylist that recommends makeup based on skin tone, outfit and personal style.
          Users are matched with beauty products from major brands and redirected to official websites to purchase recommended items.
          We connect users to recommended products from top beauty brands through seamless in-app discovery.
        </p>
      </div>

      {/* Disclaimer */}
      <div className="mb-5">
        <p className="font-body text-[10px] uppercase tracking-widest text-muted-foreground mb-2">
          Disclaimer
        </p>
        <p className="font-body text-[11px] text-muted-foreground/70 leading-relaxed">
          FinalGlow AI uses artificial intelligence to generate personalized beauty suggestions.
          Results are for guidance and inspiration and may vary depending on individual features and product availability.
        </p>
      </div>

      {/* Legal Links */}
      <div className="flex items-center justify-center gap-4 mt-5 mb-3">
        <Dialog>
          <DialogTrigger asChild>
            <button className="font-body text-[11px] uppercase tracking-widest text-gold hover:text-gold/80 transition-colors">
              Terms of Use
            </button>
          </DialogTrigger>
          <DialogContent className="max-h-[80vh] overflow-y-auto bg-card border-border">
            <DialogHeader>
              <DialogTitle className="font-display text-xl text-gold">Terms of Use</DialogTitle>
              <DialogDescription className="font-body text-xs text-muted-foreground">
                Last updated: {new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })}
              </DialogDescription>
              <Link to="/terms" className="inline-flex items-center gap-1 font-body text-[10px] uppercase tracking-widest text-gold hover:text-gold/80 transition-colors">
                Open full page <ExternalLink size={10} />
              </Link>
            </DialogHeader>
            <div className="space-y-4 font-body text-xs text-muted-foreground leading-relaxed">
              <p>Welcome to FinalGlow AI. By accessing or using our application, you agree to be bound by these Terms of Use.</p>
              <div>
                <p className="font-semibold text-foreground mb-1">1. Use of Service</p>
                <p>FinalGlow AI provides AI-powered beauty and styling recommendations for personal, non-commercial use. You must be at least 13 years old to use this service.</p>
              </div>
              <div>
                <p className="font-semibold text-foreground mb-1">2. AI-Generated Content</p>
                <p>All beauty suggestions, color analyses, and AI-enhanced portraits are generated for guidance and inspiration only. Results may vary depending on individual features, lighting, and product availability.</p>
              </div>
              <div>
                <p className="font-semibold text-foreground mb-1">3. Subscriptions & Payments</p>
                <p>FinalGlow Pro subscriptions are billed via Stripe (web/iOS) or Google Play (Android). Subscriptions auto-renew until cancelled. You may cancel anytime through your account settings or app store.</p>
              </div>
              <div>
                <p className="font-semibold text-foreground mb-1">4. User Content</p>
                <p>You retain ownership of photos you upload. By posting to the Glow Community, you grant FinalGlow AI a limited license to display your content within the app for the duration of the post.</p>
              </div>
              <div>
                <p className="font-semibold text-foreground mb-1">5. Prohibited Conduct</p>
                <p>You may not use FinalGlow AI for unlawful purposes, upload inappropriate content, or attempt to reverse-engineer the service.</p>
              </div>
              <div>
                <p className="font-semibold text-foreground mb-1">6. Disclaimer</p>
                <p>FinalGlow AI is provided "as is" without warranties of any kind. We do not guarantee specific results from product recommendations.</p>
              </div>
              <div>
                <p className="font-semibold text-foreground mb-1">7. Contact</p>
                <p>For questions about these Terms, contact us at support@finalglowai.com.</p>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <span className="text-muted-foreground/30">·</span>

        <Dialog>
          <DialogTrigger asChild>
            <button className="font-body text-[11px] uppercase tracking-widest text-gold hover:text-gold/80 transition-colors">
              Privacy Policy
            </button>
          </DialogTrigger>
          <DialogContent className="max-h-[80vh] overflow-y-auto bg-card border-border">
            <DialogHeader>
              <DialogTitle className="font-display text-xl text-gold">Privacy Policy</DialogTitle>
              <DialogDescription className="font-body text-xs text-muted-foreground">
                Last updated: {new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })}
              </DialogDescription>
              <Link to="/privacy" className="inline-flex items-center gap-1 font-body text-[10px] uppercase tracking-widest text-gold hover:text-gold/80 transition-colors">
                Open full page <ExternalLink size={10} />
              </Link>
            </DialogHeader>
            <div className="space-y-4 font-body text-xs text-muted-foreground leading-relaxed">
              <p>Your privacy is at the heart of FinalGlow AI. This policy explains how we handle your data.</p>
              <div>
                <p className="font-semibold text-foreground mb-1">1. Privacy-First Approach</p>
                <p>FinalGlow AI processes images ephemerally. We do not permanently store photos you upload for color analysis, face scans, or AI enhancements. Processing happens in real-time and images are discarded immediately after.</p>
              </div>
              <div>
                <p className="font-semibold text-foreground mb-1">2. Information We Collect</p>
                <p>We collect minimal account information (email, authentication data) to provide our service. Subscription status is managed through Stripe and Google Play.</p>
              </div>
              <div>
                <p className="font-semibold text-foreground mb-1">3. Glow Community Posts</p>
                <p>Posts you share in the Glow Community are stored temporarily (24 hours) and automatically deleted. Reactions and interactions are anonymized.</p>
              </div>
              <div>
                <p className="font-semibold text-foreground mb-1">4. AI Processing</p>
                <p>Image processing uses on-device AI (MediaPipe) where possible. AI enhancements may be processed via secure third-party APIs but are never stored on our servers.</p>
              </div>
              <div>
                <p className="font-semibold text-foreground mb-1">5. Data Sharing</p>
                <p>We do not sell, rent, or share your personal data with third parties for marketing purposes. Limited data is shared with payment processors (Stripe, Google) to process subscriptions.</p>
              </div>
              <div>
                <p className="font-semibold text-foreground mb-1">6. Your Rights</p>
                <p>You can request access, correction, or deletion of your data at any time. To exercise these rights, contact us at privacy@finalglowai.com.</p>
              </div>
              <div>
                <p className="font-semibold text-foreground mb-1">7. Cookies & Analytics</p>
                <p>We use minimal cookies necessary for authentication and app functionality. We do not use tracking cookies for advertising.</p>
              </div>
              <div>
                <p className="font-semibold text-foreground mb-1">8. Contact</p>
                <p>For privacy concerns, contact us at privacy@finalglowai.com.</p>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Copyright */}
      <p className="font-body text-[10px] text-muted-foreground/50 text-center mt-4">
        © {new Date().getFullYear()} FinalGlow AI. All rights reserved.
      </p>
    </footer>
  );
};

export default Footer;
