import { supabase } from '@/lib/supabase';

export type Comment = {
  id: string;
  dream_id: string;
  user_id: string;
  username?: string;
  avatar_url?: string;
  content: string;
  created_at: string;
};

export const fetchComments = async (dreamId: string): Promise<Comment[]> => {
  const { data, error } = await supabase
    .from('comments')
    .select('*, profiles(username, avatar_url)')
    .eq('dream_id', dreamId)
    .order('created_at', { ascending: true });
  if (error) {
    console.error('Error fetching comments:', error.message);
    return [];
  }
  // username ve avatar_url'i düzleştir
  return (data || []).map((c: any) => ({ ...c, username: c.profiles?.username, avatar_url: c.profiles?.avatar_url }));
};

export const addComment = async (dreamId: string, userId: string, content: string): Promise<boolean> => {
  const { error } = await supabase
    .from('comments')
    .insert([{ dream_id: dreamId, user_id: userId, content }]);
  if (error) {
    console.error('Error adding comment:', error.message);
    return false;
  }
  return true;
};

export const deleteComment = async (commentId: string): Promise<boolean> => {
  const { error } = await supabase
    .from('comments')
    .delete()
    .eq('id', commentId);
  if (error) {
    console.error('Error deleting comment:', error.message);
    return false;
  }
  return true;
}; 