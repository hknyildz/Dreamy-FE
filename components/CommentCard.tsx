import React from 'react';
import { View, Text, Pressable, Image } from 'react-native';

interface CommentCardProps {
  username?: string;
  avatar_url?: string;
  content: string;
  created_at: string;
  canDelete?: boolean;
  onDelete?: () => void;
}

const CommentCard: React.FC<CommentCardProps> = ({ username, avatar_url, content, created_at, canDelete, onDelete }) => (
  <View className="mb-3 bg-dark-400 rounded-2xl px-4 py-3 shadow-md relative">
    {/* Close button absolutely at top right */}
    {canDelete && (
      <Pressable
        onPress={onDelete}
        className="absolute right-2 top-2 z-10 bg-dark-300 mr-2 rounded-full w-7 h-7 items-center justify-center"
        style={{ alignSelf: 'flex-end' }} // (optional, for extra safety)
      >
        <Text className="text-[#ef4444] text-base font-bold">✕</Text>
      </Pressable>
    )}
    <View className="flex-row items-center mb-1">
      {avatar_url ? (
        <View className="w-8 h-8 rounded-full bg-[#C1B6E3] mr-3 overflow-hidden items-center justify-center">
          <Image source={{ uri: avatar_url }} className="w-8 h-8 rounded-full" />
        </View>
      ) : (
        <View className="w-8 h-8 rounded-full bg-[#C1B6E3] mr-3" />
      )}
      <Text className="text-white font-bold text-base">{username || 'User'}</Text>
    </View>
    <Text className="text-white text-base mb-1 leading-5">{content}</Text>
    <Text className="text-xs text-[#A8B5DB]">{new Date(created_at).toLocaleString()}</Text>
  </View>
);

export default CommentCard; 