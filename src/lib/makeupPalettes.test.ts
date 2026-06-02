import { describe, it, expect } from "vitest";
import { generatePalettes, shadeName } from "./makeupPalettes";

describe("generatePalettes", () => {
  const base = {
    outfitColors: ["hsl(0,0%,8%)", "hsl(0,70%,45%)"],
    vibe: "elegant",
    skinTone: "hsl(25, 38%, 65%)",
  };

  it("always returns exactly 4 palettes", () => {
    expect(generatePalettes(base)).toHaveLength(4);
  });

  it("returns palettes with the correct ids", () => {
    const ids = generatePalettes(base).map((p) => p.id);
    expect(ids).toEqual(["harmonious", "complementary", "neutral", "statement"]);
  });

  it("every palette has valid hsl colors", () => {
    const hslRegex = /^hsl\(\d+, \d+%, \d+%\)$/;
    generatePalettes(base).forEach((p) => {
      expect(p.lipColor).toMatch(hslRegex);
      expect(p.eyeshadowColor).toMatch(hslRegex);
      expect(p.blushColor).toMatch(hslRegex);
    });
  });

  it("confidence scores are between 0 and 100", () => {
    generatePalettes(base).forEach((p) => {
      expect(p.confidence).toBeGreaterThanOrEqual(0);
      expect(p.confidence).toBeLessThanOrEqual(100);
    });
  });

  it("confidenceLabel matches the score", () => {
    generatePalettes(base).forEach((p) => {
      if (p.confidence >= 88) expect(p.confidenceLabel).toBe("Excellent");
      else if (p.confidence >= 75) expect(p.confidenceLabel).toBe("Strong");
      else if (p.confidence >= 60) expect(p.confidenceLabel).toBe("Good");
      else expect(p.confidenceLabel).toBe("Fair");
    });
  });

  it("all palettes have non-empty name, description and confidenceReason", () => {
    generatePalettes(base).forEach((p) => {
      expect(p.name.length).toBeGreaterThan(0);
      expect(p.description.length).toBeGreaterThan(0);
      expect(p.confidenceReason.length).toBeGreaterThan(0);
    });
  });

  it("works with no outfit colors", () => {
    const result = generatePalettes({ ...base, outfitColors: [] });
    expect(result).toHaveLength(4);
    result.forEach((p) => {
      expect(p.confidence).toBeGreaterThanOrEqual(0);
    });
  });

  it("works with an unknown vibe (falls back to elegant)", () => {
    expect(generatePalettes({ ...base, vibe: "unknown_vibe" })).toHaveLength(4);
  });

  it("neutral palette always has name 'Soft Nude'", () => {
    const neutral = generatePalettes(base).find((p) => p.id === "neutral");
    expect(neutral?.name).toBe("Soft Nude");
  });

  it("produces different lip colors for harmonious vs statement", () => {
    const palettes = generatePalettes(base);
    const harmonious = palettes.find((p) => p.id === "harmonious")!;
    const statement = palettes.find((p) => p.id === "statement")!;
    expect(harmonious.lipColor).not.toBe(statement.lipColor);
  });

  it("very light skin tone increases lightness vs very dark skin", () => {
    const lightSkin = generatePalettes({ ...base, skinTone: "hsl(30, 45%, 92%)" });
    const darkSkin  = generatePalettes({ ...base, skinTone: "hsl(16, 30%, 18%)" });
    const getL = (hsl: string) => parseInt(hsl.match(/(\d+)%\)$/)![1]);
    expect(getL(lightSkin[0].lipColor)).toBeGreaterThanOrEqual(getL(darkSkin[0].lipColor));
  });
});

describe("shadeName", () => {
  it("low saturation + high lightness → soft beige", () => {
    expect(shadeName([30, 10, 80])).toBe("soft beige");
  });
  it("low saturation + mid lightness → warm taupe", () => {
    expect(shadeName([30, 10, 60])).toBe("warm taupe");
  });
  it("low saturation + low lightness → smoky cocoa", () => {
    expect(shadeName([30, 10, 40])).toBe("smoky cocoa");
  });
  it("low saturation + very low lightness → deep espresso", () => {
    expect(shadeName([30, 10, 25])).toBe("deep espresso");
  });
  it("red hue → rose family", () => {
    expect(shadeName([5, 60, 45])).toContain("rose");
  });
  it("coral hue → coral family", () => {
    expect(shadeName([20, 60, 55])).toContain("coral");
  });
  it("golden hue → honey gold family", () => {
    expect(shadeName([38, 60, 60])).toContain("gold");
  });
  it("blue hue → sapphire family", () => {
    expect(shadeName([220, 60, 40])).toContain("sapphire");
  });
  it("violet hue → violet family", () => {
    expect(shadeName([270, 50, 50])).toContain("violet");
  });
  it("high lightness → 'soft' prefix", () => {
    expect(shadeName([350, 50, 70])).toMatch(/^soft /);
  });
  it("mid lightness → 'warm' prefix", () => {
    expect(shadeName([350, 50, 55])).toMatch(/^warm /);
  });
  it("low lightness → 'rich' prefix", () => {
    expect(shadeName([350, 50, 40])).toMatch(/^rich /);
  });
  it("very low lightness → 'deep' prefix", () => {
    expect(shadeName([350, 50, 25])).toMatch(/^deep /);
  });
});
