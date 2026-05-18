import { useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const PrivacyPage = () => {
  useEffect(() => {
    document.title = "Privacy Policy — FinalGlow AI";
    const desc = "Learn how FinalGlow AI protects your privacy with ephemeral, on-device image processing and minimal data collection.";
    let meta = document.querySelector('meta[name="description"]');
    if (!meta) {
      meta = document.createElement("meta");
      meta.setAttribute("name", "description");
      document.head.appendChild(meta);
    }
    meta.setAttribute("content", desc);

    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.setAttribute("rel", "canonical");
      document.head.appendChild(canonical);
    }
    canonical.setAttribute("href", "https://finalglowai.com/privacy");
  }, []);

  const lastUpdated = new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" });

  return (
    <main className="min-h-screen px-5 pt-10 pb-20">
      <Link
        to="/home"
        className="inline-flex items-center gap-2 font-body text-xs text-muted-foreground hover:text-foreground transition-colors mb-6"
      >
        <ArrowLeft size={14} />
        Back to Home
      </Link>

      <header className="mb-8">
        <p className="font-body text-[10px] uppercase tracking-[0.2em] text-gold mb-2">Legal</p>
        <h1 className="font-display text-3xl font-semibold text-foreground mb-2">Privacy Policy</h1>
        <p className="font-body text-xs text-muted-foreground">Last updated: {lastUpdated}</p>
      </header>

      <article className="space-y-5 font-body text-sm text-muted-foreground leading-relaxed">
        <p>Your privacy is at the heart of FinalGlow AI. This policy explains how we handle your data.</p>

        <section>
          <h2 className="font-display text-base font-semibold text-foreground mb-1">1. Privacy-First Approach</h2>
          <p>FinalGlow AI processes images ephemerally. We do not permanently store photos you upload for color analysis, face scans, or AI enhancements. Processing happens in real-time and images are discarded immediately after.</p>
        </section>

        <section>
          <h2 className="font-display text-base font-semibold text-foreground mb-1">2. Information We Collect</h2>
          <p>We collect minimal account information (email, authentication data) to provide our service. Subscription status is managed through Stripe and Google Play.</p>
        </section>

        <section>
          <h2 className="font-display text-base font-semibold text-foreground mb-1">3. Glow Community Posts</h2>
          <p>Posts you share in the Glow Community are stored temporarily (24 hours) and automatically deleted. Reactions and interactions are anonymized.</p>
        </section>

        <section>
          <h2 className="font-display text-base font-semibold text-foreground mb-1">4. AI Processing</h2>
          <p>Image processing uses on-device AI (MediaPipe) where possible. AI enhancements may be processed via secure third-party APIs but are never stored on our servers.</p>
        </section>

        <section>
          <h2 className="font-display text-base font-semibold text-foreground mb-1">5. Data Sharing</h2>
          <p>We do not sell, rent, or share your personal data with third parties for marketing purposes. Limited data is shared with payment processors (Stripe, Google) to process subscriptions.</p>
        </section>

        <section>
          <h2 className="font-display text-base font-semibold text-foreground mb-1">6. Your Rights</h2>
          <p>You can request access, correction, or deletion of your data at any time. To exercise these rights, contact us at privacy@finalglowai.com.</p>
        </section>

        <section>
          <h2 className="font-display text-base font-semibold text-foreground mb-1">7. Cookies & Analytics</h2>
          <p>We use minimal cookies necessary for authentication and app functionality. We do not use tracking cookies for advertising.</p>
        </section>

        <section>
          <h2 className="font-display text-base font-semibold text-foreground mb-1">8. Contact</h2>
          <p>For privacy concerns, contact us at privacy@finalglowai.com.</p>
        </section>
      </article>
    </main>
  );
};

export default PrivacyPage;
