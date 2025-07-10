import { createClient } from '@supabase/supabase-js';
import 'react-native-url-polyfill/auto';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://hdfderidtiexufxozmag.supabase.co';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhkZmRlcmlkdGlleHVmeG96bWFnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE4ODc0MzMsImV4cCI6MjA2NzQ2MzQzM30.mnXJjEAftboWyEDoLqSuk1IT339DEJfXD8B_a05mrdQ';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type AuthUser = {
    id: string;
    email: string;
    created_at: string;
  };
  
  export type AuthError = {
    message: string;
  };
