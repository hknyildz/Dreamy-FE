import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  Pressable, 
  Image, 
  KeyboardAvoidingView, 
  Platform,
  Switch,
  Alert
} from 'react-native';
import { router } from 'expo-router';
import { images } from '@/constants/images';
import { useAuth } from '@/contexts/AuthContext';
import { createDream } from '@/services/dreamService';

export default function CreateDream() {
  const { user } = useAuth();
  const [dreamTitle, setDreamTitle] = useState('');
  const [dreamContent, setDreamContent] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleClose = () => {
    // Son bulunulan sayfaya yönlendir, eğer direkt landing'den geldiyse feed'e git
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)');
    }
  };

  const handleSave = async () => {
    if (!dreamTitle.trim() || !dreamContent.trim()) {
      Alert.alert('Hata', 'Lütfen rüya başlığı ve içeriğini girin.');
      return;
    }

    if (!user?.id) {
      Alert.alert('Hata', 'Kullanıcı oturumu bulunamadı.');
      return;
    }

    setIsLoading(true);
    
    try {
      // DreamService üzerinden rüyayı kaydet
      const dreamDate = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
      const success = await createDream(
        dreamTitle.trim(),
        dreamContent.trim(),
        isPrivate,
        dreamDate,
        user.id
      );

      if (success) {
        Alert.alert('Başarılı', 'Rüyanız kaydedildi!', [
          {
            text: 'Tamam',
            onPress: handleClose
          }
        ]);
      } else {
        Alert.alert('Bilgi', 'Rüya offline olarak kaydedildi ve bağlantı sağlandığında senkronize edilecek.', [
          {
            text: 'Tamam',
            onPress: handleClose
          }
        ]);
      }
    } catch (error) {
      console.error('Error saving dream:', error);
      Alert.alert('Hata', 'Rüya kaydedilemedi.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-primary">
      {/* Background image */}
      <Image 
        source={images.bg} 
        className="absolute w-full h-full z-0" 
        resizeMode="cover" 
      />
      
      {/* Blurred overlay */}
      <View className="absolute inset-0 bg-primary/95 z-10" />
      
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1 z-20"
      >
        {/* Header with close button */}
        <View className="flex-row justify-between items-center px-6 pt-16 pb-16 mt-6">
          <Text className="text-light-100 text-xl font-semibold">Yeni Rüya</Text>
          <Pressable
            onPress={handleClose}
            className="w-10 h-10 rounded-full bg-dark-200 items-center justify-center"
          >
            <Text className="text-light-100 text-3xl font-semibold">×</Text>
          </Pressable>
        </View>

        {/* Content area */}
        <View className="flex-1 px-6 mb-16">
          <View className="bg-dark-100 rounded-3xl p-5 flex-1 max-h-[80%]">
            {/* Title input */}
            <TextInput
              className="text-light-100 text-lg font-semibold mb-4 pb-2 border-b border-dark-200"
              placeholder="Rüya başlığı..."
              placeholderTextColor="#A8B5DB"
              value={dreamTitle}
              onChangeText={setDreamTitle}
              maxLength={100}
            />

            {/* Content input */}
            <TextInput
              className="text-light-100 text-base flex-1 max-h-96"
              multiline
              placeholder="Rüyanızı yazın..."
              placeholderTextColor="#A8B5DB"
              value={dreamContent}
              onChangeText={setDreamContent}
              maxLength={2000}
              textAlignVertical="top"
            />

            {/* Private switch */}
            <View className="flex-row items-center justify-between mt-4 pt-4 border-t border-dark-200">
              <Text className="text-light-100 text-base">Özel Rüya</Text>
              <Switch
                value={isPrivate}
                onValueChange={setIsPrivate}
                trackColor={{ false: '#0F0D23', true: '#AB8BFF' }}
                thumbColor={isPrivate ? '#D6C7FF' : '#A8B5DB'}
              />
            </View>

            {/* Character count */}
            <Text className="text-light-200 text-xs text-right mt-2">
              {dreamContent.length}/2000
            </Text>

            {/* Save button */}
            <Pressable
              onPress={handleSave}
              disabled={isLoading || !dreamTitle.trim() || !dreamContent.trim()}
              className={`mt-4 py-3 rounded-xl ${
                isLoading || !dreamTitle.trim() || !dreamContent.trim()
                  ? 'bg-dark-200'
                  : 'bg-accent'
              }`}
            >
              <Text
                className={`text-center font-semibold text-base ${
                  isLoading || !dreamTitle.trim() || !dreamContent.trim()
                    ? 'text-light-200'
                    : 'text-primary'
                }`}
              >
                {isLoading ? 'Kaydediliyor...' : 'Rüyayı Kaydet'}
              </Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
} 