import { supabase } from '@/lib/supabase';

const FREE_LIMIT = 3;

export async function hasReachedFreeLimit(userId: string): Promise<boolean> {
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const { count, error } = await supabase
    .from('sessions')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gte('created_at', startOfMonth.toISOString());

  if (error) return false;
  return (count ?? 0) >= FREE_LIMIT;
}
