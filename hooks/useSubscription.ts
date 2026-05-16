import { useState, useEffect, useCallback } from 'react';
import { CustomerInfo } from 'react-native-purchases';
import { getCustomerInfo, restorePurchases, isPro } from '@/lib/revenuecat';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/authStore';

export function useSubscription() {
  const { user, profile, fetchProfile } = useAuthStore();
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const isProUser = isPro(customerInfo) || profile?.subscription_tier === 'pro';

  const checkSubscription = useCallback(async () => {
    setIsLoading(true);
    const info = await getCustomerInfo();
    setCustomerInfo(info);
    if (info && user?.id) {
      const tier = isPro(info) ? 'pro' : 'free';
      if (profile?.subscription_tier !== tier) {
        await supabase.from('profiles').update({ subscription_tier: tier }).eq('id', user.id);
        await fetchProfile(user.id);
      }
    }
    setIsLoading(false);
  }, [user?.id, profile?.subscription_tier]);

  useEffect(() => { checkSubscription(); }, []);

  const handleRestore = useCallback(async () => {
    const info = await restorePurchases();
    if (info) { setCustomerInfo(info); if (user?.id) fetchProfile(user.id); }
    return info;
  }, [user?.id]);

  return { isProUser, isLoading, customerInfo, freeSessionLimit: 3, checkSubscription, handleRestore };
}
