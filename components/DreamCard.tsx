import React from 'react';
import { View, Text, Pressable, Image } from 'react-native';

interface DreamCardProps {
  title: string;
  content: string;
  date: string;
  username?: string;
  avatar_url?: string;
  is_private?: boolean;
  onPress?: () => void;
}

const DreamCard: React.FC<DreamCardProps> = ({ title, content, date, username, avatar_url, is_private, onPress }) => (
  <Pressable onPress={onPress} className="flex-row items-center bg-dark-400 rounded-3xl px-4 py-4 shadow-lg mt-2 min-h-[80px]">
    {avatar_url ? (
      <View className="w-12 h-12 rounded-full bg-[#C1B6E3] mr-4 overflow-hidden items-center justify-center">
        <Image source={{ uri: avatar_url }} className="w-12 h-12 rounded-full" />
      </View>
    ) : (
      <View className="w-12 h-12 rounded-full bg-[#C1B6E3] mr-4" />
    )}
    <View className="flex-1">
      <Text className="text-white text-base font-semibold mb-1">{title}</Text>
      <Text className="text-[#C1B6E3] text-xs" numberOfLines={2}>{content}</Text>
      <View className="flex-row items-center mt-1">
        <Text className="text-xs text-[#A8B5DB] mr-2">{new Date(date).toLocaleDateString()}</Text>
        {is_private && <Text className="ml-1 text-[#C1B6E3]">🔒</Text>}
      </View>
      {username && <Text className="text-xs text-[#C1B6E3] mt-1">{username}</Text>}
    </View>
  </Pressable>
);

export default DreamCard; 