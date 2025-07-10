import { supabase } from '@/lib/supabase';

export const fetchFollowerCount = async (userId: string): Promise<number> => {
  const { count, error } = await supabase
    .from('follows')
    .select('*', { count: 'exact', head: true })
    .eq('following_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching dreams:', error.message);
    return -1;
  }

  return count || 0;
};
