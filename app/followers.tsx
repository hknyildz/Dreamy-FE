import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, RefreshControl, SafeAreaView } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { fetchFollowers, isFollowing, followUser, unfollowUser } from '@/services/profileService';
import UserListItem from '@/components/UserListItem';
import { router } from 'expo-router';

const PAGE_SIZE = 20;

export default function FollowersPage() {
  const { user } = useAuth();
  const [followers, setFollowers] = useState<any[]>([]);
  const [followingMap, setFollowingMap] = useState<{ [id: string]: boolean }>({});
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const loadFollowers = async (reset = false) => {
    if (!user) return;
    setLoading(true);
    const offset = reset ? 0 : page * PAGE_SIZE;
    const data = await fetchFollowers(user.id, PAGE_SIZE, offset);
    if (reset) {
      setFollowers(data);
    } else {
      setFollowers(prev => [...prev, ...data]);
    }
    setHasMore(data.length === PAGE_SIZE);
    setLoading(false);
    // Takip durumlarını getir
    const map: { [id: string]: boolean } = {};
    await Promise.all(data.map(async (f: any) => {
      map[f.id] = await isFollowing(user.id, f.id);
    }));
    setFollowingMap(prev => reset ? map : { ...prev, ...map });
  };

  useEffect(() => {
    loadFollowers(true);
  }, [user]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    setPage(0);
    loadFollowers(true).then(() => setRefreshing(false));
  }, [user]);

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      setPage(prev => prev + 1);
      loadFollowers();
    }
  };

  const handleFollowToggle = async (followerId: string) => {
    if (!user) return;
    const isNowFollowing = followingMap[followerId];
    if (isNowFollowing) {
      await unfollowUser(user.id, followerId);
    } else {
      await followUser(user.id, followerId);
    }
    setFollowingMap(prev => ({ ...prev, [followerId]: !isNowFollowing }));
  };

  return (
    <SafeAreaView className="flex-1 bg-[#181B3A]">
      <View className="flex-1 px-4 pt-8">
        <Text className="text-[#C1B6E3] text-lg font-bold mb-4">Followers</Text>
        <FlatList
          className="flex-1"
          data={followers}
          keyExtractor={item => item.id || item.follower_id}
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
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#8F7EDC" />}
          ListEmptyComponent={<Text className="text-white text-center mt-8">No followers found.</Text>}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </SafeAreaView>
  );
} 