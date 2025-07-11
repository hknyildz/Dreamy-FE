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

export const fetchProfileById = async (userId: string) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('username, bio, avatar_url, is_private')
    .eq('id', userId)
    .single();
  if (error) {
    console.error('Error fetching profile:', error.message);
    return null;
  }
  return data;
};

export const fetchFollowers = async (userId: string, limit = 20, offset = 0) => {
  const { data, error } = await supabase
    .from('follows')
    .select('follower_id, profiles:profiles!follows_follower_id_fkey(id, username, bio, avatar_url)')
    .eq('following_id', userId)
    .range(offset, offset + limit - 1);
  if (error) {
    console.error('Error fetching followers:', error.message);
    return [];
  }
  return (data || []).map((f: any) => ({ ...f.profiles, follower_id: f.follower_id }));
};

export const isFollowing = async (currentUserId: string, targetUserId: string) => {
  const { count } = await supabase
    .from('follows')
    .select('*', { count: 'exact', head: true })
    .eq('follower_id', currentUserId)
    .eq('following_id', targetUserId);
  return (count || 0) > 0;
};

export const followUser = async (currentUserId: string, targetUserId: string) => {
  const { error } = await supabase
    .from('follows')
    .insert([{ follower_id: currentUserId, following_id: targetUserId }]);
  if (error) {
    console.error('Error following user:', error.message);
    return false;
  }
  return true;
};

export const unfollowUser = async (currentUserId: string, targetUserId: string) => {
  const { error } = await supabase
    .from('follows')
    .delete()
    .eq('follower_id', currentUserId)
    .eq('following_id', targetUserId);
  if (error) {
    console.error('Error unfollowing user:', error.message);
    return false;
  }
  return true;
};

export const updateProfilePrivacy = async (userId: string, isPrivate: boolean): Promise<boolean> => {
  const { error } = await supabase
    .from('profiles')
    .update({ is_private: isPrivate })
    .eq('id', userId);
  if (error) {
    console.error('Error updating profile privacy:', error.message);
    return false;
  }
  return true;
};
