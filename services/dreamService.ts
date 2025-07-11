import { supabase } from '@/lib/supabase';

export const fetchDreamsByUserId = async (userId: string): Promise<Dream[]> => {
  const { data, error } = await supabase
    .from('dreams')
    .select('id, title, content, is_private, dream_date, user_id, created_at')
    .eq('user_id', userId)
    .order('dream_date', { ascending: false });

  if (error) {
    console.error('Error fetching dreams:', error.message);
    return [];
  }

  return data || [];
};

export const fetchDreamById = async (id: string): Promise<Dream | null> => {
  const { data, error } = await supabase
    .from('dreams')
    .select('id, title, content, is_private, dream_date, user_id, created_at')
    .eq('id', id)
    .single();
  if (error || !data || !data.user_id) {
    console.error('Error fetching dream:', error?.message);
    return null;
  }
  return data;
};

export const updateDream = async (id: string, content: string): Promise<boolean> => {
  const { error } = await supabase
    .from('dreams')
    .update({ content })
    .eq('id', id);
  if (error) {
    console.error('Error updating dream:', error.message);
    return false;
  }
  return true;
};

export const updateDreamPrivacy = async (dreamId: string, isPrivate: boolean): Promise<boolean> => {
  const { error } = await supabase
    .from('dreams')
    .update({ is_private: isPrivate })
    .eq('id', dreamId);
  if (error) {
    console.error('Error updating dream privacy:', error.message);
    return false;
  }
  return true;
};

export const deleteDream = async (id: string): Promise<boolean> => {
  const { error } = await supabase
    .from('dreams')
    .delete()
    .eq('id', id);
  if (error) {
    console.error('Error deleting dream:', error.message);
    return false;
  }
  return true;
};

export const likeDream = async (dreamId: string, userId: string): Promise<boolean> => {
  console.log(`User ${userId} liked dream ${dreamId}`); //TODO
  return true;
};

// TODO
// export const createDream = ...
