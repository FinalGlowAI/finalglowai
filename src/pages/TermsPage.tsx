import { useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const TermsPage = () => {
  useEffect(() => {
    document.title = "Terms of Use — FinalGlow AI";
    const desc = "Read the Terms of Use for FinalGlow AI, the AI beauty stylist app for personalized makeup and color recommendations.";
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
    canonical.setAttribute("href", "https://finalglowai.com/terms");
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
        <h1 className="font-display text-3xl font-semibold text-foreground mb-2">Terms of Use</h1>
        <p className="font-body text-xs text-muted-foreground">Last updated: {lastUpdated}</p>
      </header>

      <article className="space-y-5 font-body text-sm text-muted-foreground leading-relaxed">
        <p>Welcome to FinalGlow AI. By accessing or using our application, you agree to be bound by these Terms of Use.</p>

        <section>
          <h2 className="font-display text-base font-semibold text-foreground mb-1">1. Use of Service</h2>
          <p>FinalGlow AI provides AI-powered beauty and styling recommendations for personal, non-commercial use. You must be at least 13 years old to use this service.</p>
        </section>

        <section>
          <h2 className="font-display text-base font-semibold text-foreground mb-1">2. AI-Generated Content</h2>
          <p>All beauty suggestions, color analyses, and AI-enhanced portraits are generated for guidance and inspiration only. Results may vary depending on individual features, lighting, and product availability.</p>
        </section>

        <section>
          <h2 className="font-display text-base font-semibold text-foreground mb-1">3. Subscriptions & Payments</h2>
          <p>FinalGlow Pro subscriptions are billed via Stripe (web/iOS) or Google Play (Android). Subscriptions auto-renew until cancelled. You may cancel anytime through your account settings or app store.</p>
        </section>

        <section>
          <h2 className="font-display text-base font-semibold text-foreground mb-1">4. User Content</h2>
          <p>You retain ownership of photos you upload. By posting to the Glow Community, you grant FinalGlow AI a limited license to display your content within the app for the duration of the post.</p>
        </section>

        <section>
          <h2 className="font-display text-base font-semibold text-foreground mb-1">5. Prohibited Conduct</h2>
          <p>You may not use FinalGlow AI for unlawful purposes, upload inappropriate content, or attempt to reverse-engineer the service.</p>
        </section>

        <section>
          <h2 className="font-display text-base font-semibold text-foreground mb-1">6. Disclaimer</h2>
          <p>FinalGlow AI is provided "as is" without warranties of any kind. We do not guarantee specific results from product recommendations.</p>
        </section>

        <section>
          <h2 className="font-display text-base font-semibold text-foreground mb-1">7. Contact</h2>
          <p>For questions about these Terms, contact us at support@finalglowai.com.</p>
        </section>
      </article>
    </main>
  );
};

export default TermsPage;
