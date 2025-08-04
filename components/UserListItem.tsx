import React from 'react';
import { View, Text, Pressable, Image } from 'react-native';

interface UserListItemProps {
  username: string;
  bio?: string;
  avatar_url?: string;
  isFollowing: boolean;
  onFollowToggle: () => void;
  onPress?: () => void;
}

const UserListItem: React.FC<UserListItemProps> = ({ username, bio, avatar_url, isFollowing, onFollowToggle, onPress }) => (
  <Pressable onPress={onPress} className="flex-row items-center bg-dark-400 rounded-2xl px-4 py-3 mb-3 shadow-md">
    {avatar_url ? (
      <View className="w-12 h-12 rounded-full bg-[#C1B6E3] mr-4 overflow-hidden items-center justify-center">
        <Image source={{ uri: avatar_url }} className="w-12 h-12 rounded-full" />
      </View>
    ) : (
      <View className="w-12 h-12 rounded-full bg-[#C1B6E3] mr-4" />
    )}
    <View className="flex-1">
      <Text className="text-white text-base font-bold">{username}</Text>
      {bio && <Text className="text-[#A8B5DB] text-xs mt-1" numberOfLines={1}>{bio}</Text>}
    </View>
    <Pressable
      onPress={onFollowToggle}
      className={`px-4 py-2 rounded-full ml-2 ${isFollowing ? 'bg-red-500' : 'bg-blue-500'}`}
    >
      <Text className="text-white font-semibold">{isFollowing ? 'Unfollow' : 'Follow'}</Text>
    </Pressable>
  </Pressable>
);

export default UserListItem; 