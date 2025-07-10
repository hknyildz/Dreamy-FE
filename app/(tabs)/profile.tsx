import React from 'react';
import { View, Text, Pressable, ScrollView, SafeAreaView, Alert } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { router } from 'expo-router';

const entries = [
  { date: '16 mar', title: 'Fena bi rüya', preview: 'rüyamın özeti/dam gibi, olay özetim', private: false },
  { date: '15 mar', title: 'Rüya 2', preview: 'rüya içeriği', private: false },
  { date: '09 mar', title: 'Rüya 3', preview: 'rüya içeriği', private: false },
  { date: '28 feb', title: 'Rüya 4', preview: 'rüya içeriği', private: false },
  { date: '27 feb', title: 'Rüya 5', preview: 'rüya içeriği', private: false },
];

function DateCircle({ date }: { date: string }) {
  const [day, month] = date.split(' ');
  return (
    <View className="w-12 h-12 bg-[#8F7EDC] rounded-full items-center justify-center mr-4">
      <Text className="text-white text-base font-bold leading-5">{day}</Text>
      <Text className="text-white text-xs lowercase leading-3">{month}</Text>
    </View>
  );
}

export default function Profile() {
  const { signOut, user, profile } = useAuth();

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

  return (
    <SafeAreaView className="flex-1 bg-[#181B3A]">
      <ScrollView contentContainerStyle={{ paddingBottom: 32 }} showsVerticalScrollIndicator={false}>
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
                <Text className="text-white text-lg font-bold">20</Text>
                <Text className="text-white text-xs">Dreams</Text>
              </View>
              <View className="items-center mx-2">
                <Text className="text-white text-lg font-bold">5</Text>
                <Text className="text-white text-xs ">Friends</Text>
              </View>
            </View>
          </View>
        </View>
        {/* Entries */}
        <View className="px-4 pt-8">
          <Text className="text-[#C1B6E3] text-lg font-semibold mb-2">Dreams</Text>
          {entries.map((entry, idx) => (
            <View
              key={idx}
              className="flex-row items-center mb-4 bg-[#393C6C] rounded-3xl px-4 py-3 shadow-lg"
              style={{ minHeight: 64 }}
            >
              <DateCircle date={entry.date} />
              <View className="flex-1">
                <Text className="text-white text-base font-semibold mb-1">{entry.title}</Text>
                <Text className="text-[#C1B6E3] text-xs" numberOfLines={1}>{entry.preview}</Text>
              </View>
              {/* Private icon if needed */}
              {entry.private && (
                <Text className="ml-2 text-[#C1B6E3]">🔒</Text>
              )}
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}