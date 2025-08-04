import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, SafeAreaView, Pressable, TextInput, Alert } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { fetchDreamById, updateDream, deleteDream, likeDream } from '@/services/dreamService';
import { fetchComments, addComment, Comment, deleteComment } from '@/services/commentService';
import { fetchProfileById } from '@/services/profileService';
import CommentCard from '@/components/CommentCard';
// Dream tipini burada tanımla (import etme)
type Dream = {
  id: string;
  title: string;
  content: string;
  is_private: boolean;
  dream_date: string;
  user_id: string;
  created_at?: string;
};

export default function DreamDetail() {
  const { id } = useLocalSearchParams();
  const { user } = useAuth();
  const [dream, setDream] = useState<Dream | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isOwner, setIsOwner] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState('');
  const [ownerProfile, setOwnerProfile] = useState<{ username: string; avatar_url: string } | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const dreamData = await fetchDreamById(Array.isArray(id) ? id[0] : id);
      setDream(dreamData);
      setIsOwner(user?.id === dreamData?.user_id);
      setEditedContent(dreamData?.content || '');
      if (dreamData?.user_id) {
        const profile = await fetchProfileById(dreamData.user_id);
        setOwnerProfile(profile);
      }
      const commentsData = await fetchComments(Array.isArray(id) ? id[0] : id);
      setComments(commentsData);
    };
    fetchData();
  }, [id, user]);

  // Dream silme için sağ üst çarpı
  const handleDreamDelete = async () => {
    Alert.alert('Delete Dream', 'Are you sure you want to delete this dream?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        await deleteDream(Array.isArray(id) ? id[0] : id);
        router.back();
      }}
    ]);
  };

  // Yorum silme
  const handleCommentDelete = async (commentId: string) => {
    Alert.alert('Delete Comment', 'Are you sure you want to delete this comment?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        await deleteComment(commentId);
        const commentsData = await fetchComments(Array.isArray(id) ? id[0] : id);
        setComments(commentsData);
      }}
    ]);
  };

  const handleEdit = async () => {
    await updateDream(Array.isArray(id) ? id[0] : id, editedContent);
    setDream(dream ? { ...dream, content: editedContent } : null);
    setIsEditing(false);
  };

  const handleLike = async () => {
    await likeDream(Array.isArray(id) ? id[0] : id, user?.id || '');
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    await addComment(Array.isArray(id) ? id[0] : id, user?.id || '', newComment);
    const commentsData = await fetchComments(Array.isArray(id) ? id[0] : id);
    setComments(commentsData);
    setNewComment('');
  };

  if (!dream) return <Text className="text-white">Loading...</Text>;

  return (
    <SafeAreaView className="flex-1 bg-[#181B3A]">
      <ScrollView contentContainerStyle={{ padding: 0 }}>
        {/* Dream Content */}
        <View className="bg-dark-300 rounded-3xl mx-4 mt-8 mb-4 shadow-xl p-0 overflow-hidden">
          {/* Sağ üst çarpı */}
          {isOwner && (
            <Pressable onPress={handleDreamDelete} className="absolute top-4 right-4 z-10 bg-dark-400 rounded-full w-9 h-9 items-center justify-center shadow-md">
              <Text className="text-[#ef4444] text-2xl font-bold">✕</Text>
            </Pressable>
          )}
          {/* Rüya sahibi avatar ve username */}
          <View className="flex-row items-center px-6 py-5 bg-dark-400 border-b border-[#8F7EDC]">
            {ownerProfile?.avatar_url ? (
              <View className="w-12 h-12 rounded-full bg-[#C1B6E3] mr-4 overflow-hidden items-center justify-center">
                <img src={ownerProfile.avatar_url} alt="avatar" className="w-12 h-12 rounded-full" />
              </View>
            ) : (
              <View className="w-12 h-12 rounded-full bg-[#C1B6E3] mr-4" />
            )}
            <Text className="text-white text-lg font-bold">{ownerProfile?.username || 'User'}</Text>
          </View>
          <View className="px-6 pt-5 pb-2">
            <Text className="text-white text-xl font-bold mb-2">{dream.title}</Text>
            {isEditing ? (
              <TextInput
                className="bg-dark-300 text-white rounded-xl p-3 mb-2 border border-[#8F7EDC]"
                multiline
                value={editedContent}
                onChangeText={setEditedContent}
                style={{ minHeight: 100 }}
              />
            ) : (
              <Text className="text-white text-base mb-2 leading-6">{dream.content}</Text>
            )}
            <Text className="text-[#A8B5DB] text-xs mb-2">{new Date(dream.dream_date || dream.created_at || '').toLocaleString()}</Text>
            {/* Buttons */}
            <View className="flex-row space-x-3 mt-2">
              {isOwner ? (
                <>
                  {isEditing ? (
                    <Pressable onPress={handleEdit} className="px-5 py-2 bg-[#8F7EDC] rounded-full mr-2 shadow-md">
                      <Text className="text-white font-semibold">Save</Text>
                    </Pressable>
                  ) : (
                    <Pressable onPress={() => setIsEditing(true)} className="px-5 py-2 bg-[#8F7EDC] rounded-full mr-2 shadow-md">
                      <Text className="text-white font-semibold">Edit</Text>
                    </Pressable>
                  )}
                </>
              ) : null}
            </View>
          </View>
        </View>
        {/* Comments */}
        <View className="bg-dark-300 rounded-3xl mx-4 mb-8 shadow-xl p-0 overflow-hidden">
          <Text className="text-[#C1B6E3] text-lg font-bold px-6 pt-6 pb-2">Comments</Text>
          <View className="px-4 pb-4">
            {comments.length === 0 ? (
              <Text className="text-white px-2 py-4">No comments yet.</Text>
            ) : (
              comments.map((comment, idx) => (
                <CommentCard
                  key={comment.id}
                  username={comment.username}
                  avatar_url={comment.avatar_url}
                  content={comment.content}
                  created_at={comment.created_at}
                  canDelete={comment.user_id === user?.id}
                  onDelete={() => handleCommentDelete(comment.id)}
                />
              ))
            )}
          </View>
          {/* Add Comment */}
          <View className="flex-row items-center bg-dark-400 rounded-2xl mx-4 mb-6 px-4 py-3 shadow-md">
            <TextInput
              className="flex-1 bg-dark-300 text-white rounded-xl p-3 mr-2 border border-[#8F7EDC]"
              placeholder="Add a comment..."
              placeholderTextColor="#A8B5DB"
              value={newComment}
              onChangeText={setNewComment}
              style={{ minHeight: 40 }}
            />
            <Pressable onPress={handleAddComment} className="px-4 py-2 bg-[#22c55e] rounded-full shadow-md">
              <Text className="text-white font-semibold">Send</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
} 