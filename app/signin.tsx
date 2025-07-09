import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, Image, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { Link, router } from 'expo-router';
import { images } from '@/constants/images';
import { useAuth } from '@/contexts/AuthContext';

export default function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();

  const handleSignIn = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    const { error } = await signIn(email, password);
    setLoading(false);

    if (error) {
      Alert.alert('Error', error.message);
    } else {
      router.replace('/(tabs)');
    }
  };

  return (
    <View className="flex-1 bg-primary">
      {/* Night sky background */}
      <Image source={images.bg} className="absolute w-full h-full z-0" resizeMode="cover" />
      
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1 justify-center px-8 z-10"
      >
        <View className="bg-dark-100/90 rounded-3xl p-8 shadow-2xl">
          {/* Header */}
          <View className="items-center mb-8">
            <Text className="text-light-100 text-3xl font-bold mb-2">Welcome Back</Text>
            <Text className="text-light-200 text-base text-center">
              Sign in to continue your dream journey
            </Text>
          </View>

          {/* Form */}
          <View className="space-y-6">
            {/* Email Input */}
            <View>
              <Text className="text-light-100 text-sm font-medium mb-2">Email</Text>
              <TextInput
                className="bg-dark-200 rounded-xl px-4 py-4 text-light-100 border border-dark-200 focus:border-accent"
                placeholder="Enter your email"
                placeholderTextColor="#A8B5DB"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            {/* Password Input */}
            <View>
              <Text className="text-light-100 text-sm font-medium mb-2">Password</Text>
              <TextInput
                className="bg-dark-200 rounded-xl px-4 py-4 text-light-100 border border-dark-200 focus:border-accent"
                placeholder="Enter your password"
                placeholderTextColor="#A8B5DB"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoCapitalize="none"
              />
            </View>

            {/* Sign In Button */}
            <Pressable
              className={`rounded-xl py-4 mt-6 ${loading ? 'bg-dark-200' : 'bg-accent'}`}
              onPress={handleSignIn}
              disabled={loading}
            >
              <Text className={`text-center font-semibold text-lg ${loading ? 'text-light-300' : 'text-primary'}`}>
                {loading ? 'Signing In...' : 'Sign In'}
              </Text>
            </Pressable>

            {/* Forgot Password */}
            <Pressable className="items-center mt-4">
              <Text className="text-accent text-sm">Forgot Password?</Text>
            </Pressable>
          </View>

          {/* Sign Up Link */}
          <View className="flex-row justify-center mt-8 pt-6 border-t border-dark-200">
            <Text className="text-light-200 text-base">Don't have an account? </Text>
            <Pressable onPress={() => router.push('signup')}>
              <Text className="text-accent font-semibold text-base">Sign Up</Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}