import { Capacitor } from "@capacitor/core";
import {
  Purchases,
  LOG_LEVEL,
  type PurchasesPackage,
  type CustomerInfo,
} from "@revenuecat/purchases-capacitor";

// RevenueCat Android SDK key — this is a PUBLIC key (safe in client code).
// Replace with your real key from app.revenuecat.com → Project → API Keys.
export const REVENUECAT_ANDROID_API_KEY = "goog_YOUR_REVENUECAT_ANDROID_KEY";

// Entitlement identifier configured in RevenueCat (e.g. "pro").
export const ENTITLEMENT_ID = "pro";

// Subscription product ID (must match Google Play Console).
export const PRODUCT_ID = "finalglow_pro_monthly";

let initialized = false;

export const isNativeAndroid = () =>
  Capacitor.isNativePlatform() && Capacitor.getPlatform() === "android";

export async function initRevenueCat(appUserId: string) {
  if (!isNativeAndroid() || initialized) return;
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
  } catch {
    /* noop */
  }
  initialized = false;
}

export async function getProPackage(): Promise<PurchasesPackage | null> {
  if (!isNativeAndroid()) return null;
  const offerings = await Purchases.getOfferings();
  const current = offerings.current;
  if (!current) return null;
  // Prefer monthly package, otherwise first available
  return current.monthly ?? current.availablePackages[0] ?? null;
}

export async function purchasePro(): Promise<CustomerInfo | null> {
  const pkg = await getProPackage();
  if (!pkg) throw new Error("No subscription package available");
  const result = await Purchases.purchasePackage({ aPackage: pkg });
  return result.customerInfo;
}

export async function restorePurchases(): Promise<CustomerInfo | null> {
  if (!isNativeAndroid()) return null;
  const { customerInfo } = await Purchases.restorePurchases();
  return customerInfo;
}

export function hasProEntitlement(info: CustomerInfo | null | undefined): boolean {
  if (!info) return false;
  return Boolean(info.entitlements.active[ENTITLEMENT_ID]);
}
