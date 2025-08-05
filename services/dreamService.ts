import { supabase } from '@/lib/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';

const DREAMS_CACHE_KEY = 'user_dreams_cache';
const OFFLINE_DREAMS_KEY = 'offline_dreams';

export const fetchDreamsByUserId = async (userId: string): Promise<Dream[]> => {
  try {
    const { data, error } = await supabase
      .from('dreams')
      .select('*')
      .eq('user_id', userId);

    if (error) {
      console.error('Error fetching dreams:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Network error fetching dreams:', error);
    return [];
  }
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

export const updateDreamTitle = async (id: string, title: string): Promise<boolean> => {
  const { error } = await supabase
    .from('dreams')
    .update({ title: title.trim() })
    .eq('id', id);
  if (error) {
    console.error('Error updating dream title:', error.message);
    return false;
  }
  return true;
};

export const updateDreamFull = async (id: string, title: string, content: string): Promise<boolean> => {
  const { error } = await supabase
    .from('dreams')
    .update({ 
      title: title.trim(),
      content: content.trim()
    })
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

// Cache management functions
export const cacheDreams = async (userId: string, dreams: Dream[]): Promise<void> => {
  try {
    const cacheData = {
      userId,
      dreams,
      timestamp: Date.now(),
    };
    await AsyncStorage.setItem(DREAMS_CACHE_KEY, JSON.stringify(cacheData));
  } catch (error) {
    console.error('Error caching dreams:', error);
  }
};

export const getCachedDreams = async (userId: string): Promise<Dream[]> => {
  try {
    const cachedData = await AsyncStorage.getItem(DREAMS_CACHE_KEY);
    if (!cachedData) return [];
    
    const { userId: cachedUserId, dreams } = JSON.parse(cachedData);
    if (cachedUserId !== userId) return [];
    
    return dreams || [];
  } catch (error) {
    console.error('Error getting cached dreams:', error);
    return [];
  }
};

// Create dream function with offline support
export const createDream = async (
  title: string,
  content: string,
  isPrivate: boolean,
  dreamDate: string,
  userId: string
): Promise<boolean> => {
  const dreamData = {
    title: title.trim(),
    content: content.trim(),
    is_private: isPrivate,
    dream_date: dreamDate,
    user_id: userId,
  };

  try {
    const { error } = await supabase
      .from('dreams')
      .insert([dreamData]);

    if (error) {
      console.error('Error creating dream:', error.message);
      await storeOfflineDream(dreamData);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Network error creating dream:', error);
    await storeOfflineDream(dreamData);
    return false;
  }
};

// Offline dreams management
export const storeOfflineDream = async (dreamData: any): Promise<void> => {
  try {
    const existingOfflineDreams = await AsyncStorage.getItem(OFFLINE_DREAMS_KEY);
    const offlineDreams = existingOfflineDreams ? JSON.parse(existingOfflineDreams) : [];
    
    // Add timestamp and temp ID for offline dream
    const offlineDream = {
      ...dreamData,
      id: `offline_${Date.now()}`,
      created_at: new Date().toISOString(),
      isOffline: true,
    };
    
    offlineDreams.push(offlineDream);
    await AsyncStorage.setItem(OFFLINE_DREAMS_KEY, JSON.stringify(offlineDreams));
  } catch (error) {
    console.error('Error storing offline dream:', error);
  }
};

export const getOfflineDreams = async (): Promise<any[]> => {
  try {
    const offlineDreams = await AsyncStorage.getItem(OFFLINE_DREAMS_KEY);
    return offlineDreams ? JSON.parse(offlineDreams) : [];
  } catch (error) {
    console.error('Error getting offline dreams:', error);
    return [];
  }
};

export const syncOfflineDreams = async (): Promise<void> => {
  try {
    const offlineDreams = await getOfflineDreams();
    if (offlineDreams.length === 0) return;

    const promises = offlineDreams.map(async (dream) => {
      const { id, isOffline, ...dreamData } = dream;
      return supabase.from('dreams').insert([dreamData]);
    });

    await Promise.all(promises);
    
    // Clear offline dreams after successful sync
    await AsyncStorage.removeItem(OFFLINE_DREAMS_KEY);
    console.log('Offline dreams synced successfully');
  } catch (error) {
    console.error('Error syncing offline dreams:', error);
  }
};
