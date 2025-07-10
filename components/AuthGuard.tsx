import React, { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';

export const AuthGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (user) {
        // User is authenticated, redirect to main app
        router.push('/(tabs)');
      } else {
        // User is not authenticated, redirect to sign in
        router.push('/signin');
      }
    }
  }, [user, loading]);

  if (loading) {
    return (
      <View className="flex-1 bg-primary justify-center items-center">
        <ActivityIndicator size="large" color="#AB8BFF" />
      </View>
    );
  }

  return <>{children}</>;
};