import { Shirt, Footprints, Gem, Briefcase, Crown, Star, Flower2, Sun, Zap, Moon, Heart } from "lucide-react";

export type FlowStep = "outfit" | "style" | "skin" | "brand" | "palette" | "scan" | "result";

export const stepLabels: { key: FlowStep; label: string }[] = [
  { key: "outfit", label: "Outfit" },
  { key: "style", label: "Style" },
  { key: "skin", label: "Skin" },
  { key: "brand", label: "Brand" },
  { key: "palette", label: "Palette" },
  { key: "scan", label: "Face Scan" },
  { key: "result", label: "Results" },
];

export const pageVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 80 : -80,
    opacity: 0,
    scale: 0.97,
  }),
  center: { x: 0, opacity: 1, scale: 1 },
  exit: (direction: number) => ({
    x: direction < 0 ? 80 : -80,
    opacity: 0,
    scale: 0.97,
  }),
};

export const pageTransition = {
  type: "spring" as const,
  stiffness: 350,
  damping: 35,
  mass: 0.8,
};

export const presetPalettes = [
  { name: "Classic Noir",    colors: ["hsl(0,0%,8%)", "hsl(0,0%,98%)", "hsl(0,70%,45%)", "hsl(42,60%,55%)"] },
  { name: "Soft Neutrals",   colors: ["hsl(40,30%,90%)", "hsl(25,25%,75%)", "hsl(30,40%,60%)", "hsl(0,0%,55%)"] },
  { name: "Evening Glamour", colors: ["hsl(0,0%,8%)", "hsl(42,60%,55%)", "hsl(345,55%,30%)", "hsl(0,0%,75%)"] },
  { name: "Spring Garden",   colors: ["hsl(350,40%,75%)", "hsl(140,15%,60%)", "hsl(0,0%,98%)", "hsl(25,25%,75%)"] },
];

export interface OutfitCategory {
  id: string;
  label: string;
  icon: React.ElementType;
  colors: { name: string; value: string }[];
}

export const categories: OutfitCategory[] = [
  {
    id: "top", label: "Top", icon: Shirt,
    colors: [
      { name: "White",    value: "hsl(0,0%,98%)" },   { name: "Black",    value: "hsl(0,0%,8%)" },
      { name: "Navy",     value: "hsl(220,50%,22%)" }, { name: "Red",      value: "hsl(0,70%,45%)" },
      { name: "Blush",    value: "hsl(350,40%,75%)" }, { name: "Camel",    value: "hsl(30,40%,60%)" },
      { name: "Olive",    value: "hsl(85,25%,40%)" },  { name: "Burgundy", value: "hsl(345,55%,30%)" },
      { name: "Cream",    value: "hsl(40,30%,90%)" },  { name: "Grey",     value: "hsl(0,0%,55%)" },
      { name: "Sage",     value: "hsl(140,15%,60%)" }, { name: "Cobalt",   value: "hsl(215,65%,45%)" },
    ],
  },
  {
    id: "long_pant", label: "Long Pant", icon: Shirt,
    colors: [
      { name: "Black",    value: "hsl(0,0%,8%)" },     { name: "White",    value: "hsl(0,0%,98%)" },
      { name: "Denim",    value: "hsl(215,40%,50%)" }, { name: "Navy",     value: "hsl(220,50%,22%)" },
      { name: "Khaki",    value: "hsl(40,30%,55%)" },  { name: "Grey",     value: "hsl(0,0%,55%)" },
      { name: "Olive",    value: "hsl(85,25%,40%)" },  { name: "Camel",    value: "hsl(30,40%,60%)" },
      { name: "Burgundy", value: "hsl(345,55%,30%)" }, { name: "Cream",    value: "hsl(40,30%,90%)" },
      { name: "Tan",      value: "hsl(35,35%,65%)" },  { name: "Charcoal", value: "hsl(0,0%,25%)" },
    ],
  },
  {
    id: "skirt", label: "Skirt", icon: Shirt,
    colors: [
      { name: "Black",   value: "hsl(0,0%,8%)" },     { name: "White",   value: "hsl(0,0%,98%)" },
      { name: "Blush",   value: "hsl(350,40%,75%)" }, { name: "Red",     value: "hsl(0,70%,45%)" },
      { name: "Navy",    value: "hsl(220,50%,22%)" }, { name: "Denim",   value: "hsl(215,40%,50%)" },
      { name: "Plaid",   value: "hsl(10,35%,45%)" },  { name: "Nude",    value: "hsl(25,25%,75%)" },
      { name: "Emerald", value: "hsl(155,45%,35%)" }, { name: "Cream",   value: "hsl(40,30%,90%)" },
      { name: "Mauve",   value: "hsl(310,20%,55%)" }, { name: "Camel",   value: "hsl(30,40%,60%)" },
    ],
  },
  {
    id: "dress", label: "Dress", icon: Shirt,
    colors: [
      { name: "Black",     value: "hsl(0,0%,8%)" },     { name: "White",     value: "hsl(0,0%,98%)" },
      { name: "Red",       value: "hsl(0,70%,45%)" },   { name: "Navy",      value: "hsl(220,50%,22%)" },
      { name: "Blush",     value: "hsl(350,40%,75%)" }, { name: "Emerald",   value: "hsl(155,45%,35%)" },
      { name: "Gold",      value: "hsl(42,60%,55%)" },  { name: "Burgundy",  value: "hsl(345,55%,30%)" },
      { name: "Nude",      value: "hsl(25,25%,75%)" },  { name: "Cobalt",    value: "hsl(215,65%,45%)" },
      { name: "Champagne", value: "hsl(38,35%,78%)" },  { name: "Lavender",  value: "hsl(270,30%,70%)" },
    ],
  },
  {
    id: "shoes", label: "Shoes", icon: Footprints,
    colors: [
      { name: "Black",   value: "hsl(0,0%,8%)" },     { name: "White",   value: "hsl(0,0%,98%)" },
      { name: "Nude",    value: "hsl(25,25%,75%)" },  { name: "Red",     value: "hsl(0,70%,45%)" },
      { name: "Gold",    value: "hsl(42,60%,55%)" },  { name: "Silver",  value: "hsl(0,0%,75%)" },
      { name: "Brown",   value: "hsl(25,40%,35%)" },  { name: "Tan",     value: "hsl(35,35%,55%)" },
      { name: "Navy",    value: "hsl(220,50%,22%)" }, { name: "Blush",   value: "hsl(350,40%,75%)" },
      { name: "Snake",   value: "hsl(35,15%,50%)" },  { name: "Leopard", value: "hsl(30,35%,45%)" },
    ],
  },
  {
    id: "handbag", label: "Handbag", icon: Briefcase,
    colors: [
      { name: "Black",    value: "hsl(0,0%,8%)" },     { name: "White",    value: "hsl(0,0%,98%)" },
      { name: "Tan",      value: "hsl(35,35%,55%)" },  { name: "Brown",    value: "hsl(25,40%,35%)" },
      { name: "Red",      value: "hsl(0,70%,45%)" },   { name: "Nude",     value: "hsl(25,25%,75%)" },
      { name: "Gold",     value: "hsl(42,60%,55%)" },  { name: "Navy",     value: "hsl(220,50%,22%)" },
      { name: "Cream",    value: "hsl(40,30%,90%)" },  { name: "Blush",    value: "hsl(350,40%,75%)" },
      { name: "Olive",    value: "hsl(85,25%,40%)" },  { name: "Burgundy", value: "hsl(345,55%,30%)" },
    ],
  },
  {
    id: "jewelry", label: "Jewelry", icon: Gem,
    colors: [
      { name: "Gold",      value: "hsl(42,60%,55%)" },  { name: "Silver",    value: "hsl(0,0%,75%)" },
      { name: "Rose Gold", value: "hsl(15,45%,65%)" },  { name: "Pearl",     value: "hsl(40,20%,90%)" },
      { name: "Diamond",   value: "hsl(210,10%,88%)" }, { name: "Emerald",   value: "hsl(155,55%,40%)" },
      { name: "Ruby",      value: "hsl(350,65%,40%)" }, { name: "Sapphire",  value: "hsl(220,65%,40%)" },
      { name: "Onyx",      value: "hsl(0,0%,10%)" },    { name: "Turquoise", value: "hsl(175,50%,50%)" },
      { name: "Amethyst",  value: "hsl(275,40%,50%)" }, { name: "Coral",     value: "hsl(15,65%,60%)" },
    ],
  },
];

export const styleVibes = [
  { id: "luxury",     label: "Luxury",     icon: Crown,   desc: "Opulent & refined" },
  { id: "classy",     label: "Classy",     icon: Star,    desc: "Timeless sophistication" },
  { id: "elegant",    label: "Elegant",    icon: Gem,     desc: "Graceful & polished" },
  { id: "soft_glam",  label: "Soft Glam",  icon: Flower2, desc: "Effortless radiance" },
  { id: "natural",    label: "Natural",    icon: Sun,     desc: "Barely-there beauty" },
  { id: "party",      label: "Party",      icon: Zap,     desc: "Bold & dazzling" },
  { id: "clean_girl", label: "Clean Girl", icon: Moon,    desc: "Dewy & minimal" },
  { id: "bold",       label: "Bold",       icon: Heart,   desc: "Statement-making" },
];

export const skinTones = [
  { name: "Very Light", color: "hsl(30, 45%, 92%)", undertone: "Porcelain" },
  { name: "Light",      color: "hsl(28, 40%, 82%)", undertone: "Ivory" },
  { name: "Medium",     color: "hsl(25, 38%, 65%)", undertone: "Warm Beige" },
  { name: "Tan",        color: "hsl(22, 35%, 52%)", undertone: "Golden" },
  { name: "Brown",      color: "hsl(20, 38%, 40%)", undertone: "Caramel" },
  { name: "Dark",       color: "hsl(18, 35%, 28%)", undertone: "Espresso" },
  { name: "Deep Dark",  color: "hsl(16, 30%, 18%)", undertone: "Ebony" },
];

export const brands = [
  { id: "fenty",   name: "Fenty Beauty",      tagline: "Beauty for all" },
  { id: "dior",    name: "Dior Beauty",        tagline: "French luxury" },
  { id: "sephora", name: "Sephora Collection", tagline: "Expert curation" },
  { id: "rare",    name: "Rare Beauty",        tagline: "By Selena Gomez" },
  { id: "mac",     name: "MAC",                tagline: "Professional artistry" },
  { id: "none",    name: "No Preference",      tagline: "Show me everything" },
];
