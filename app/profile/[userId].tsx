import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, ScrollView, SafeAreaView, RefreshControl } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { useLocalSearchParams, router } from 'expo-router';
import { fetchDreamsByUserId } from '@/services/dreamService';
import { fetchProfileById, isFollowing, followUser, unfollowUser, fetchFollowerCount } from '@/services/profileService';
import DreamCard from '@/components/DreamCard';

export default function UserProfile() {
  const { userId } = useLocalSearchParams();
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [dreams, setDreams] = useState<any[]>([]);
  const [isFollowingUser, setIsFollowingUser] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [canViewContent, setCanViewContent] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);

  const fetchUserData = async () => {
    if (!userId || !user) return;
    const userIdStr = Array.isArray(userId) ? userId[0] : userId;
    
    // Profil bilgilerini getir
    const profileData = await fetchProfileById(userIdStr);
    setProfile(profileData);
    
    // Takip durumunu kontrol et
    const following = await isFollowing(user.id, userIdStr);
    setIsFollowingUser(following);
    
    // Takipçi sayısını getir
    const followerCountData = await fetchFollowerCount(userIdStr);
    setFollowerCount(followerCountData);
    
    // İçerik görüntüleme iznini kontrol et
    const canView = !profileData?.is_private || following || user.id === userIdStr;
    setCanViewContent(canView);
    
    // Eğer içerik görüntülenebiliyorsa rüyaları getir
    if (canView) {
      const dreamData = await fetchDreamsByUserId(userIdStr);
      setDreams(dreamData);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, [userId, user]);

  const handleFollowToggle = async () => {
    if (!userId || !user) return;
    const userIdStr = Array.isArray(userId) ? userId[0] : userId;
    
    if (isFollowingUser) {
      await unfollowUser(user.id, userIdStr);
    } else {
      await followUser(user.id, userIdStr);
    }
    setIsFollowingUser(!isFollowingUser);
    
    // Takip durumu değiştiyse içerik görüntüleme iznini yeniden kontrol et
    const newCanView = !profile?.is_private || !isFollowingUser || user.id === userIdStr;
    setCanViewContent(newCanView);
    if (newCanView) {
      const dreamData = await fetchDreamsByUserId(userIdStr);
      setDreams(dreamData);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchUserData();
    setRefreshing(false);
  };

  const isOwnProfile = user?.id === (Array.isArray(userId) ? userId[0] : userId);

  if (!profile) {
    return (
      <SafeAreaView className="flex-1 bg-[#181B3A] items-center justify-center">
        <Text className="text-white">Loading...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-[#181B3A]">
      <ScrollView
        contentContainerStyle={{ paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#8F7EDC"
          />
        }
      >
        {/* Header section */}
        <View className="bg-[#8F7EDC] rounded-b-3xl px-6 pt-2 pb-6 relative">
          {/* Avatar */}
          <View className="items-center">
            <View className="w-24 h-24 rounded-full bg-[#C1B6E3] border-4 border-white z-20 shadow-lg" />
          </View>
          {/* Username and bio */}
          <View className="items-center mt-4">
            <Text className="text-white text-lg font-bold mt-1">{profile?.username}</Text>
            <Text className="text-white text-base mt-2">{profile?.bio}</Text>
            
            {/* Stats */}
            <View className="flex-row space-x-8 mt-4">
              <View className="items-center mx-2">
                <Text className="text-white text-lg font-bold">{dreams.length}</Text>
                <Text className="text-white text-xs">Dreams</Text>
              </View>
              <View className="items-center mx-2">
                <Text className="text-white text-lg font-bold">{followerCount}</Text>
                <Text className="text-white text-xs">Followers</Text>
              </View>
            </View>
            
            {/* Follow/Unfollow butonu (kendi profilimiz değilse) */}
            {!isOwnProfile && (
              <Pressable
                onPress={handleFollowToggle}
                className={`px-6 py-2 rounded-full mt-4 ${isFollowingUser ? 'bg-red-500' : 'bg-blue-500'}`}
              >
                <Text className="text-white font-semibold">
                  {isFollowingUser ? 'Unfollow' : 'Follow'}
                </Text>
              </Pressable>
            )}
          </View>
        </View>

        {/* Content */}
        <View className="px-4 pt-8">
          {canViewContent ? (
            <>
              <Text className="text-[#C1B6E3] text-lg font-semibold mb-2">Dreams</Text>
              {dreams.length === 0 ? (
                <Text className="text-white text-center mt-8">No dreams found.</Text>
              ) : (
                dreams.map((dream, idx) => (
                  <DreamCard
                    key={dream.id}
                    title={dream.title}
                    content={dream.content}
                    date={dream.dream_date}
                    username={profile.username}
                    avatar_url={profile.avatar_url}
                    is_private={dream.is_private}
                    onPress={() => router.push(`/dream/${dream.id}` as any)}
                  />
                ))
              )}
            </>
          ) : (
            <View className="bg-[#393C6C] rounded-3xl p-6 mt-4 items-center">
              <Text className="text-white text-lg font-bold mb-2">This profile is private</Text>
              <Text className="text-[#A8B5DB] text-center mb-4">
                Follow {profile.username} to see their dreams
              </Text>
              <Pressable
                onPress={handleFollowToggle}
                className="px-6 py-2 rounded-full bg-blue-500"
              >
                <Text className="text-white font-semibold">Follow</Text>
              </Pressable>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
} 