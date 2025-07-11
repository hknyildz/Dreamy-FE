import { Stack } from "expo-router";
import './globals.css';
import { AuthProvider } from '@/contexts/AuthContext';

export default function RootLayout() {
  return (
    <AuthProvider>
      <Stack>
        <Stack.Screen
          name="index"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="(tabs)"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="signin"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="signup"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="dream/[id]"
          options={{ headerShown: true }} //TODO will change to false
        />
        <Stack.Screen
          name="profile/[userId]"
          options={{ headerShown: true }} //TODO will change to false
        />
      </Stack>
    </AuthProvider>
  );
}
