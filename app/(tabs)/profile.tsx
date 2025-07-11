import React from 'react';
import { View, Text, Pressable, ScrollView, SafeAreaView, Alert, RefreshControl } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { router } from 'expo-router';
import { fetchDreamsByUserId } from '@/services/dreamService';
import { fetchFollowerCount } from '@/services/profileService';
import { useEffect, useState } from 'react';

type Props = {
  timestamp: string; // "2025-07-09T15:30:00Z"
};

function DateCircle({ timestamp }: Props) {
  const dateObj = new Date(timestamp);

  const day = dateObj.getDate().toString().padStart(2, '0');
  const month = dateObj.toLocaleString('en-US', { month: 'short' }).toLowerCase(); // örn: jul
  const hours = dateObj.getHours().toString().padStart(2, '0');
  const minutes = dateObj.getMinutes().toString().padStart(2, '0');
  const time = `${hours}:${minutes}`;
  

  return (
    <View className="w-12 h-14 bg-[#8F7EDC] rounded-full items-center justify-center mr-4 py-1">
      <Text className="text-white text-base font-bold leading-5 mb-1">{day}</Text>
      <Text className="text-white text-xs font-bold lowercase leading-3">{month}</Text>
    </View>
  );
}



export default function Profile() {
  const { signOut, user, profile } = useAuth();
  const [followerCount, setFollowerCount] = useState<number>(0);
  const [dreams, setDreams] = useState<Dream[]>([]);
  const [refreshing, setRefreshing] = useState(false);


  useEffect(() => {
    const fetchProfileData = async () => {
      if (!user) return;
      const data = await fetchDreamsByUserId(user?.id);
      const followerCount = await fetchFollowerCount(user?.id);
      setFollowerCount(followerCount);
      setDreams(data);
    };
  
    fetchProfileData();
  }, [user]);

  const handleSignOut = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            await signOut();
            router.push('/signin');
          },
        },
      ]
    );
  };

  const onRefresh = async () => {
    if (!user) return;
    setRefreshing(true);
    const data = await fetchDreamsByUserId(user.id);
    const followerCount = await fetchFollowerCount(user.id);
    setDreams(data);
    setFollowerCount(followerCount);
    setRefreshing(false);
  };
  

  return (
    <SafeAreaView className="flex-1 bg-[#181B3A]">
      <ScrollView contentContainerStyle={{ paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#8F7EDC']}
            tintColor="#8F7EDC"
          />
        }
      >
        {/* Header section */}
        <View className="bg-[#8F7EDC] rounded-b-3xl px-6 pt-2 pb-6 relative">
          {/* Settings icon */}
          <Pressable className="absolute right-6 top-6 z-10" onPress={handleSignOut}>
            <Text className="text-white text-base">🚪</Text>
          </Pressable>
          {/* Avatar - floating/overflow */}
          <View className="items-center">
            <View className="w-24 h-24 rounded-full bg-[#C1B6E3] border-4 border-white absolute-top-12 z-20 shadow-lg" />
          </View>
          {/* Username and stats */}
          <View className="items-center mt-4">
            <Text className="text-white text font-bold mt-1">{profile?.username}</Text>
            <Text className="text-white text-xl mt-2">{profile?.bio}</Text>
            
            <View className="flex-row space-x-8 mt-2">
              <View className="items-center mx-2">
                <Text className="text-white text-lg font-bold">{dreams.length}</Text>
                <Text className="text-white text-xs">Dreams</Text>
              </View>
              <Pressable className="items-center mx-2" onPress={() => router.push('/followers')}>
                <Text className="text-white text-lg font-bold">{followerCount}</Text>
                <Text className="text-white text-xs ">Followers</Text>
              </Pressable>
            </View>
          </View>
        </View>
        {/* Entries */}
        <View className="px-4 pt-8">
          <Text className="text-[#C1B6E3] text-lg font-semibold mb-2">Dreams</Text>
          {dreams.map((dream, idx) => (
            <Pressable
              key={idx}
              className="flex-row items-center mb-4 bg-[#393C6C] rounded-3xl px-4 py-3 shadow-lg"
              style={{ minHeight: 64 }}
              onPress={() => router.push(`/dream/${dream.id}` as any)}
            >
              <DateCircle timestamp={dream.dream_date} />
              <View className="flex-1">
                <Text className="text-white text-base font-semibold mb-1">{dream.title}</Text>
                <Text className="text-[#C1B6E3] text-xs" numberOfLines={1}>{dream.content}</Text>
              </View>
              {/* Private icon if needed */}
              {dream.is_private && (
                <Text className="ml-2 text-[#C1B6E3]">🔒</Text>
              )}
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}