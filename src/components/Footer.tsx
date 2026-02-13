import { Separator } from "@/components/ui/separator";

const Footer = () => {
  return (
    <footer className="px-5 pt-8 pb-28 mt-6">
      <Separator className="mb-6 bg-border" />

      {/* Brand */}
      <p className="font-display text-lg text-gold tracking-wider text-center mb-4">
        Deep D'Ark & Light Glow
      </p>

      {/* About Us */}
      <div className="mb-5">
        <p className="font-body text-[10px] uppercase tracking-widest text-muted-foreground mb-2">
          About Us
        </p>
        <p className="font-body text-xs text-muted-foreground leading-relaxed">
          Deep D'Ark & Light Glow is an AI beauty stylist that recommends makeup based on skin tone, outfit and personal style.
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
          Deep D'Ark & Light Glow uses artificial intelligence to generate personalized beauty suggestions.
          Results are for guidance and inspiration and may vary depending on individual features and product availability.
        </p>
      </div>

      {/* Copyright */}
      <p className="font-body text-[10px] text-muted-foreground/50 text-center mt-4">
        © {new Date().getFullYear()} Deep D'Ark & Light Glow. All rights reserved.
      </p>
    </footer>
  );
};

export default Footer;
