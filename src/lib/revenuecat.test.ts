import { describe, it, expect } from "vitest";
import { hasProEntitlement, ENTITLEMENT_ID, PRODUCT_ID, REVENUECAT_ANDROID_API_KEY } from "./revenuecat";
import type { CustomerInfo } from "@revenuecat/purchases-capacitor";

function makeInfo(active: Record<string, unknown>): CustomerInfo {
  return {
    entitlements: { active } as CustomerInfo["entitlements"],
  } as CustomerInfo;
}

describe("hasProEntitlement", () => {
  it("returns false for null", () => {
    expect(hasProEntitlement(null)).toBe(false);
  });

  it("returns false for undefined", () => {
    expect(hasProEntitlement(undefined)).toBe(false);
  });

  it("returns false when entitlements object is empty", () => {
    expect(hasProEntitlement(makeInfo({}))).toBe(false);
  });

  it("returns true when the pro entitlement is active", () => {
    expect(hasProEntitlement(makeInfo({ [ENTITLEMENT_ID]: {} }))).toBe(true);
  });

  it("returns false when only an unrelated entitlement is active", () => {
    expect(hasProEntitlement(makeInfo({ other_entitlement: {} }))).toBe(false);
  });

  it("uses ENTITLEMENT_ID key, not a hardcoded string", () => {
    const info = makeInfo({ [ENTITLEMENT_ID]: { isActive: true } });
    expect(hasProEntitlement(info)).toBe(true);
  });
});

describe("RevenueCat constants", () => {
  it("ENTITLEMENT_ID is a non-empty string", () => {
    expect(typeof ENTITLEMENT_ID).toBe("string");
    expect(ENTITLEMENT_ID.length).toBeGreaterThan(0);
  });

  it("PRODUCT_ID is a non-empty string", () => {
    expect(typeof PRODUCT_ID).toBe("string");
    expect(PRODUCT_ID.length).toBeGreaterThan(0);
  });

  it("REVENUECAT_ANDROID_API_KEY is a non-empty string", () => {
    expect(typeof REVENUECAT_ANDROID_API_KEY).toBe("string");
    expect(REVENUECAT_ANDROID_API_KEY.length).toBeGreaterThan(0);
  });
});
  });

  it("PRODUCT_ID is a non-empty string", () => {
    expect(typeof PRODUCT_ID).toBe("string");
    expect(PRODUCT_ID.length).toBeGreaterThan(0);
  });

  it("REVENUECAT_ANDROID_API_KEY is a non-empty string", () => {
    expect(typeof REVENUECAT_ANDROID_API_KEY).toBe("string");
    expect(REVENUECAT_ANDROID_API_KEY.length).toBeGreaterThan(0);
  });
});
