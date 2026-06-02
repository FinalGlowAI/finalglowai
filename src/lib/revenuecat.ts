import { Capacitor } from "@capacitor/core";
import {
  Purchases,
  LOG_LEVEL,
  type PurchasesPackage,
  type CustomerInfo,
} from "@revenuecat/purchases-capacitor";

// RevenueCat Android SDK key — this is a PUBLIC key (safe in client code).
// Replace with your real key from app.revenuecat.com → Project → API Keys.
export const REVENUECAT_ANDROID_API_KEY = "goog_BegXAXcFVmAVgXljWjdkIFaKTaK";

// Entitlement identifier configured in RevenueCat (e.g. "pro").
export const ENTITLEMENT_ID = "pro";

// Subscription product ID (must match Google Play Console).
export const PRODUCT_ID = "finalglow_pro_monthly";

const NETWORK_TIMEOUT_MS = 10_000;

let initialized = false;

export const isNativeAndroid = () =>
  Capacitor.isNativePlatform() && Capacitor.getPlatform() === "android";

// Rejects after `ms` milliseconds — used to cap slow network calls.
function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  let timerId: ReturnType<typeof setTimeout>;
  const timeout = new Promise<never>((_, reject) => {
    timerId = setTimeout(() => reject(new Error(`RevenueCat call timed out after ${ms}ms`)), ms);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timerId));
}

export async function initRevenueCat(appUserId: string) {
  if (!isNativeAndroid()) return;
  // Re-initialise whenever the SDK is not yet configured (e.g. after a hot-reload).
  const alreadyConfigured = initialized && await Purchases.isConfigured().catch(() => false);
  if (alreadyConfigured) return;
  await Purchases.setLogLevel({ level: LOG_LEVEL.WARN });
  await Purchases.configure({
    apiKey: REVENUECAT_ANDROID_API_KEY,
    appUserID: appUserId,
  });
  initialized = true;
}

export async function logOutRevenueCat() {
  if (!isNativeAndroid() || !initialized) return;
  try {
    await Purchases.logOut();
  } catch (err) {
    console.warn("[RevenueCat] logOut failed:", err);
  }
  initialized = false;
}

export async function getProPackage(): Promise<PurchasesPackage | null> {
  if (!isNativeAndroid()) return null;
  const offerings = await withTimeout(Purchases.getOfferings(), NETWORK_TIMEOUT_MS);
  const current = offerings.current;
  if (!current) return null;
  // Prefer monthly package, otherwise first available
  return current.monthly ?? current.availablePackages[0] ?? null;
}

export async function purchasePro(): Promise<CustomerInfo> {
  if (!isNativeAndroid()) throw new Error("Purchases are only available on Android");
  const pkg = await getProPackage();
  if (!pkg) throw new Error("No subscription package available");
  const result = await withTimeout(
    Purchases.purchasePackage({ aPackage: pkg }),
    NETWORK_TIMEOUT_MS
  );
  return result.customerInfo;
}

export async function restorePurchases(): Promise<CustomerInfo | null> {
  if (!isNativeAndroid()) return null;
  const { customerInfo } = await withTimeout(
    Purchases.restorePurchases(),
    NETWORK_TIMEOUT_MS
  );
  return customerInfo;
}

export function hasProEntitlement(info: CustomerInfo | null | undefined): boolean {
  if (!info) return false;
  return Boolean(info.entitlements.active[ENTITLEMENT_ID]);
}
