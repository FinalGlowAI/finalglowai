import { describe, it, expect, vi, beforeEach } from "vitest";
import type { CustomerInfo, PurchasesPackage } from "@revenuecat/purchases-capacitor";

// ─── Mock @capacitor/core ────────────────────────────────────────────────────
const mockIsNativePlatform = vi.fn(() => false);
const mockGetPlatform = vi.fn(() => "web");

vi.mock("@capacitor/core", () => ({
  Capacitor: {
    isNativePlatform: () => mockIsNativePlatform(),
    getPlatform: () => mockGetPlatform(),
  },
}));

// ─── Mock @revenuecat/purchases-capacitor ────────────────────────────────────
const mockSetLogLevel = vi.fn().mockResolvedValue(undefined);
const mockConfigure = vi.fn().mockResolvedValue(undefined);
const mockIsConfigured = vi.fn().mockResolvedValue(false);
const mockLogOut = vi.fn().mockResolvedValue(undefined);
const mockGetOfferings = vi.fn();
const mockPurchasePackage = vi.fn();
const mockRestorePurchases = vi.fn();

vi.mock("@revenuecat/purchases-capacitor", () => ({
  LOG_LEVEL: { WARN: "WARN" },
  Purchases: {
    setLogLevel: (args: unknown) => mockSetLogLevel(args),
    configure: (args: unknown) => mockConfigure(args),
    isConfigured: () => mockIsConfigured(),
    logOut: () => mockLogOut(),
    getOfferings: () => mockGetOfferings(),
    purchasePackage: (args: unknown) => mockPurchasePackage(args),
    restorePurchases: () => mockRestorePurchases(),
  },
}));

// ─── Import AFTER mocks ───────────────────────────────────────────────────────
import {
  isNativeAndroid,
  initRevenueCat,
  logOutRevenueCat,
  getProPackage,
  purchasePro,
  restorePurchases,
  hasProEntitlement,
  ENTITLEMENT_ID,
  REVENUECAT_ANDROID_API_KEY,
} from "./revenuecat";

// ─── Helpers ──────────────────────────────────────────────────────────────────
function makeCustomerInfo(active: Record<string, unknown> = {}): CustomerInfo {
  return { entitlements: { active } } as unknown as CustomerInfo;
}
function makePackage(id = "monthly"): PurchasesPackage {
  return { identifier: id } as unknown as PurchasesPackage;
}
function setAndroid(on: boolean) {
  mockIsNativePlatform.mockReturnValue(on);
  mockGetPlatform.mockReturnValue(on ? "android" : "web");
}

// ─── isNativeAndroid ─────────────────────────────────────────────────────────
describe("isNativeAndroid", () => {
  it("returns false on web", () => { setAndroid(false); expect(isNativeAndroid()).toBe(false); });
  it("returns false on iOS native", () => {
    mockIsNativePlatform.mockReturnValue(true);
    mockGetPlatform.mockReturnValue("ios");
    expect(isNativeAndroid()).toBe(false);
  });
  it("returns true on Android native", () => { setAndroid(true); expect(isNativeAndroid()).toBe(true); });
});

// ─── initRevenueCat ──────────────────────────────────────────────────────────
describe("initRevenueCat", () => {
  beforeEach(() => {
    mockConfigure.mockClear();
    mockSetLogLevel.mockClear();
    mockIsConfigured.mockResolvedValue(false);
  });

  it("does nothing on non-android", async () => {
    setAndroid(false);
    await initRevenueCat("user-123");
    expect(mockConfigure).not.toHaveBeenCalled();
  });

  it("configures with correct API key and userId on android", async () => {
    setAndroid(true);
    await logOutRevenueCat();
    await initRevenueCat("user-abc");
    expect(mockConfigure).toHaveBeenCalledWith({
      apiKey: REVENUECAT_ANDROID_API_KEY,
      appUserID: "user-abc",
    });
  });

  it("calls setLogLevel before configure", async () => {
    setAndroid(true);
    await logOutRevenueCat();
    const callOrder: string[] = [];
    mockSetLogLevel.mockImplementation(() => { callOrder.push("setLogLevel"); return Promise.resolve(); });
    mockConfigure.mockImplementation(() => { callOrder.push("configure"); return Promise.resolve(); });
    await initRevenueCat("user-abc");
    expect(callOrder).toEqual(["setLogLevel", "configure"]);
  });

  it("skips re-init when already configured", async () => {
    setAndroid(true);
    mockIsConfigured.mockResolvedValue(true);
    await initRevenueCat("user-abc");
    mockConfigure.mockClear();
    await initRevenueCat("user-abc");
    expect(mockConfigure).not.toHaveBeenCalled();
  });

  it("re-initialises when SDK lost its config (e.g. hot-reload)", async () => {
    setAndroid(true);
    await logOutRevenueCat();
    mockIsConfigured.mockResolvedValue(false);
    await initRevenueCat("user-abc");
    expect(mockConfigure).toHaveBeenCalledTimes(1);
  });
});

// ─── logOutRevenueCat ────────────────────────────────────────────────────────
describe("logOutRevenueCat", () => {
  it("does nothing on non-android", async () => {
    setAndroid(false);
    mockLogOut.mockClear();
    await logOutRevenueCat();
    expect(mockLogOut).not.toHaveBeenCalled();
  });

  it("does not throw if Purchases.logOut rejects", async () => {
    setAndroid(true);
    await initRevenueCat("user-xyz");
    mockLogOut.mockRejectedValueOnce(new Error("network error"));
    await expect(logOutRevenueCat()).resolves.not.toThrow();
  });
});

// ─── getProPackage ────────────────────────────────────────────────────────────
describe("getProPackage", () => {
  it("returns null on non-android", async () => {
    setAndroid(false);
    expect(await getProPackage()).toBeNull();
  });

  it("returns null when no current offering", async () => {
    setAndroid(true);
    mockGetOfferings.mockResolvedValue({ current: null });
    expect(await getProPackage()).toBeNull();
  });

  it("returns monthly package when available", async () => {
    setAndroid(true);
    const monthly = makePackage("monthly");
    mockGetOfferings.mockResolvedValue({ current: { monthly, availablePackages: [monthly] } });
    expect(await getProPackage()).toBe(monthly);
  });

  it("falls back to first availablePackage when monthly is null", async () => {
    setAndroid(true);
    const annual = makePackage("annual");
    mockGetOfferings.mockResolvedValue({ current: { monthly: null, availablePackages: [annual] } });
    expect(await getProPackage()).toBe(annual);
  });

  it("returns null when monthly is null and availablePackages is empty", async () => {
    setAndroid(true);
    mockGetOfferings.mockResolvedValue({ current: { monthly: null, availablePackages: [] } });
    expect(await getProPackage()).toBeNull();
  });

  it("rejects after timeout if getOfferings hangs", async () => {
    setAndroid(true);
    vi.useFakeTimers();
    mockGetOfferings.mockReturnValue(new Promise(() => {}));
    const promise = getProPackage();
    vi.advanceTimersByTime(11_000);
    await expect(promise).rejects.toThrow("timed out");
    vi.useRealTimers();
  });
});

// ─── purchasePro ─────────────────────────────────────────────────────────────
describe("purchasePro", () => {
  it("throws a clear error on non-android (not 'no package available')", async () => {
    setAndroid(false);
    await expect(purchasePro()).rejects.toThrow("only available on Android");
  });

  it("throws when no package is available on android", async () => {
    setAndroid(true);
    mockGetOfferings.mockResolvedValue({ current: { monthly: null, availablePackages: [] } });
    await expect(purchasePro()).rejects.toThrow("No subscription package available");
  });

  it("returns customerInfo on successful purchase", async () => {
    setAndroid(true);
    const pkg = makePackage("monthly");
    const info = makeCustomerInfo({ pro: {} });
    mockGetOfferings.mockResolvedValue({ current: { monthly: pkg, availablePackages: [pkg] } });
    mockPurchasePackage.mockResolvedValue({ customerInfo: info });
    expect(await purchasePro()).toBe(info);
  });

  it("calls purchasePackage with the resolved package", async () => {
    setAndroid(true);
    const pkg = makePackage("monthly");
    mockGetOfferings.mockResolvedValue({ current: { monthly: pkg, availablePackages: [pkg] } });
    mockPurchasePackage.mockResolvedValue({ customerInfo: makeCustomerInfo() });
    await purchasePro();
    expect(mockPurchasePackage).toHaveBeenCalledWith({ aPackage: pkg });
  });
});

// ─── restorePurchases ─────────────────────────────────────────────────────────
describe("restorePurchases", () => {
  it("returns null (not throws) on non-android", async () => {
    setAndroid(false);
    expect(await restorePurchases()).toBeNull();
  });

  it("returns customerInfo on android", async () => {
    setAndroid(true);
    const info = makeCustomerInfo({ pro: {} });
    mockRestorePurchases.mockResolvedValue({ customerInfo: info });
    expect(await restorePurchases()).toBe(info);
  });

  it("rejects after timeout if restorePurchases hangs", async () => {
    setAndroid(true);
    vi.useFakeTimers();
    mockRestorePurchases.mockReturnValue(new Promise(() => {}));
    const promise = restorePurchases();
    vi.advanceTimersByTime(11_000);
    await expect(promise).rejects.toThrow("timed out");
    vi.useRealTimers();
  });
});

// ─── hasProEntitlement ────────────────────────────────────────────────────────
describe("hasProEntitlement", () => {
  it("returns false for null", () => expect(hasProEntitlement(null)).toBe(false));
  it("returns false for undefined", () => expect(hasProEntitlement(undefined)).toBe(false));
  it("returns false when no active entitlements", () => expect(hasProEntitlement(makeCustomerInfo({}))).toBe(false));
  it("returns true when pro entitlement is active", () => expect(hasProEntitlement(makeCustomerInfo({ [ENTITLEMENT_ID]: {} }))).toBe(true));
  it("returns false for an unrelated entitlement", () => expect(hasProEntitlement(makeCustomerInfo({ other: {} }))).toBe(false));
});
