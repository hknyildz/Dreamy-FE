import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, SafeAreaView } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { searchUsers, isFollowing, followUser, unfollowUser } from '@/services/profileService';
import UserListItem from '@/components/UserListItem';
import SearchBar from '@/components/SearchBar';
import { router } from 'expo-router';

export default function Search() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [followingMap, setFollowingMap] = useState<{ [id: string]: boolean }>({});
  const [loading, setLoading] = useState(false);

  // Debounced search function
  const performSearch = useCallback(async (term: string) => {
    if (!user || !term.trim()) {
      setSearchResults([]);
      return;
    }

    setLoading(true);
    const results = await searchUsers(term);
    setSearchResults(results);
    setLoading(false);

    // Check following status for each user
    const map: { [id: string]: boolean } = {};
    await Promise.all(results.map(async (result: any) => {
      map[result.id] = await isFollowing(user.id, result.id);
    }));
    setFollowingMap(map);
  }, [user]);

  // Debounce search
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      performSearch(searchTerm);
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchTerm, performSearch]);

  const handleFollowToggle = async (userId: string) => {
    if (!user) return;
    const isNowFollowing = followingMap[userId];
    if (isNowFollowing) {
      await unfollowUser(user.id, userId);
    } else {
      await followUser(user.id, userId);
    }
    setFollowingMap(prev => ({ ...prev, [userId]: !isNowFollowing }));
  };

  return (
    <SafeAreaView className="flex-1 bg-[#181B3A]">
      <View className="flex-1 px-4 pt-8">
        <Text className="text-[#C1B6E3] text-lg font-bold mb-4">Search Users</Text>
        
        <View className="mb-4">
          <SearchBar
            placeholder="Search users..."
            value={searchTerm}
            onChangeText={setSearchTerm}
          />
        </View>

        <FlatList
          className="flex-1"
          data={searchResults}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <UserListItem
              username={item.username}
              bio={item.bio}
              avatar_url={item.avatar_url}
              isFollowing={!!followingMap[item.id]}
              onFollowToggle={() => handleFollowToggle(item.id)}
              onPress={() => router.push(`/profile/${item.id}` as any)}
            />
          )}
          ListEmptyComponent={
            searchTerm.trim() ? (
              <Text className="text-white text-center mt-8">
                {loading ? 'Searching...' : 'No users found.'}
              </Text>
            ) : (
              <Text className="text-[#A8B5DB] text-center mt-8">
                Start typing to search for users
              </Text>
            )
          }
          showsVerticalScrollIndicator={false}
        />
      </View>
    </SafeAreaView>
  );
};