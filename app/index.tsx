import React, { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';

export default function Index() {
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (user) {
        router.replace('/(tabs)');
      } else {
        // Use setTimeout to avoid navigation issues
        setTimeout(() => {
          router.replace('signin');
        }, 100);
      }
    }
  }, [user, loading]);

  return (
    <View className="flex-1 bg-primary justify-center items-center">
      <ActivityIndicator size="large" color="#AB8BFF" />
    </View>
  );
}