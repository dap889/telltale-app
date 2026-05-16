import Purchases, { PurchasesOffering, CustomerInfo, LOG_LEVEL } from 'react-native-purchases';
import { Platform } from 'react-native';

export async function initRevenueCat(userId: string) {
  Purchases.setLogLevel(LOG_LEVEL.ERROR);
  const apiKey = Platform.OS === 'ios'
    ? process.env.EXPO_PUBLIC_RC_API_KEY_IOS!
    : process.env.EXPO_PUBLIC_RC_API_KEY_ANDROID!;
  await Purchases.configure({ apiKey, appUserID: userId });
}

export async function getOfferings(): Promise<PurchasesOffering | null> {
  try {
    const offerings = await Purchases.getOfferings();
    return offerings.current ?? null;
  } catch { return null; }
}

export async function purchasePackage(pkg: any): Promise<{ success: boolean; customerInfo?: CustomerInfo; error?: string }> {
  try {
    const { customerInfo } = await Purchases.purchasePackage(pkg);
    return { success: true, customerInfo };
  } catch (err: any) {
    if (err.userCancelled) return { success: false, error: 'cancelled' };
    return { success: false, error: err.message };
  }
}

export async function restorePurchases(): Promise<CustomerInfo | null> {
  try { return await Purchases.restorePurchases(); } catch { return null; }
}

export async function getCustomerInfo(): Promise<CustomerInfo | null> {
  try { return await Purchases.getCustomerInfo(); } catch { return null; }
}

export function isPro(customerInfo: CustomerInfo | null): boolean {
  if (!customerInfo) return false;
  return typeof customerInfo.entitlements.active['pro'] !== 'undefined';
}
