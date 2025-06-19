import React, { useState } from 'react';
import { images } from "@/constants/images";
import { View, Image, Text, Pressable, TextInput, KeyboardAvoidingView, Platform } from 'react-native';

export default function Index() {
  const [expanded, setExpanded] = useState(false);
  const [dream, setDream] = useState('');

  // Placeholder markdown controls
  const handleMarkdown = (type: 'bold' | 'italic' | 'underline') => {
    // For now, just append markdown symbols
    if (type === 'bold') setDream(dream + '**bold**');
    if (type === 'italic') setDream(dream + '*italic*');
    if (type === 'underline') setDream(dream + '__underline__');
  };

  return (
    <View className="flex-1 bg-primary justify-between py-20">
      {/* Night sky background */}
      <Image source={images.bg} className="absolute w-full h-full z-0" resizeMode="cover" />
      {/* Moon and branch (optional, can be added to bg image) */}
      {/* Collapsed state */}
      {!expanded && (
        <View className="w-full items-center mb-16 z-10">
          <Pressable
            className="w-4/5 py-4 bg-dark-200 rounded-full items-center shadow-lg"
            onPress={() => setExpanded(true)}
          >
            <Text className="text-light-100 text-base font-semibold">Write Your Dream</Text>
          </Pressable>
        </View>
      )}
      {/* Expanded state */}
      {expanded && (
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          className="absolute inset-0 flex-1 justify-center items-center bg-primary/95 z-20"
        >
          <View className="w-11/12 bg-dark-100 rounded-2xl p-5 shadow-xl my-30">
            <TextInput
              className="text-light-100 text-base min-h-[120px] max-h-60 mb-4"
              multiline
              placeholder="Write your dream..."
              placeholderTextColor="#A8B5DB"
              value={dream}
              onChangeText={setDream}
              maxLength={2000}
              autoFocus
            />
            {/* Markdown controls */}
            <View className="flex-row justify-center space-x-4 mb-2">
              <Pressable onPress={() => handleMarkdown('bold')} className="px-3 py-1 bg-dark-200 rounded-full border border-accent">
                <Text className="text-light-100 font-bold">Tt</Text>
              </Pressable>
              <Pressable onPress={() => handleMarkdown('bold')} className="px-3 py-1 bg-dark-200 rounded-full border border-accent">
                <Text className="text-light-100 font-bold">B</Text>
              </Pressable>
              <Pressable onPress={() => handleMarkdown('italic')} className="px-3 py-1 bg-dark-200 rounded-full border border-accent">
                <Text className="text-light-100 italic">I</Text>
              </Pressable>
              <Pressable onPress={() => handleMarkdown('underline')} className="px-3 py-1 bg-dark-200 rounded-full border border-accent">
                <Text className="text-light-100 underline">U</Text>
              </Pressable>
            </View>
            {/* Submit and close */}
            <View className="flex-row justify-end space-x-3 mt-2">
              <Pressable onPress={() => setExpanded(false)} className="px-4 py-2 bg-dark-200 rounded-full">
                <Text className="text-light-200">Cancel</Text>
              </Pressable>
              <Pressable onPress={() => { setDream(''); setExpanded(false); }} className="px-4 py-2 bg-accent rounded-full">
                <Text className="text-primary font-semibold">Save</Text>
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      )}
    </View>
  );
}
