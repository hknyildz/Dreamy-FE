import { supabase } from '@/lib/supabase';

export const fetchDreamsByUserId = async (userId: string): Promise<Dream[]> => {
  const { data, error } = await supabase
    .from('dreams')
    .select('id, title, content, is_private, dream_date')
    .eq('user_id', userId)
    .order('dream_date', { ascending: false });

  if (error) {
    console.error('Error fetching dreams:', error.message);
    return [];
  }

  return data || [];
};

// TODO
// export const createDream = ...
// export const deleteDream = ...
// export const updateDream = ...
