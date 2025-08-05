import React, { useState, useRef, useEffect } from 'react';
import { View, Text, Pressable, ScrollView, TextInput, KeyboardAvoidingView, Platform, Animated, Easing, SafeAreaView, Modal, TouchableOpacity, Switch, Alert, Dimensions, RefreshControl } from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import Svg, { Path } from 'react-native-svg';
import { useRouter } from 'expo-router';
import FloatingCreateButton from '@/components/FloatingCreateButton';
import { useAuth } from '@/contexts/AuthContext';
import { fetchDreamsByUserId, createDream, syncOfflineDreams, getOfflineDreams } from '@/services/dreamService';

// Transform dreams array to dreams by date object
const organizeDreamsByDate = (dreams: Dream[]): Record<string, Dream[]> => {
  const result: Record<string, Dream[]> = {};
  
  dreams.forEach((dream) => {
    let date = dream.dream_date;
    
    if (!date) return;
    
    // Convert database date format (YYYY-MM-DDTHH:mm:ss) to YYYY-MM-DD
    if (date.includes('T')) {
      date = date.split('T')[0];
    }
    
    if (!result[date]) {
      result[date] = [];
    }
    result[date].push(dream);
  });
  
  return result;
};

// Helper to get days in month
function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}



// Navigation arrow components  
function ChevronLeft({ size = 20, color = "#C1B6E3" }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M15 18l-6-6 6-6"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function ChevronRight({ size = 20, color = "#C1B6E3" }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M9 18l6-6-6-6"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function DateCircle({ date }: { date: string }) {
  const [year, month, day] = date.split('-');
  const months = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
  return (
    <View className="w-12 h-12 bg-[#8F7EDC] rounded-full items-center justify-center mr-4">
      <Text className="text-white text-base font-bold leading-5">{day}</Text>
      <Text className="text-white text-xs lowercase leading-3">{months[parseInt(month, 10) - 1]}</Text>
    </View>
  );
}

const { width: screenWidth } = Dimensions.get('window');

export default function CalendarPage() {
  const { user } = useAuth();
  const router = useRouter();
  
  // Year/month state
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(currentYear);
  const [month, setMonth] = useState(new Date().getMonth()); // 0-indexed
  const daysInMonth = getDaysInMonth(year, month);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [dreamInput, setDreamInput] = useState('');
  const [dreamTitle, setDreamTitle] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [dreams, setDreams] = useState<Dream[]>([]);
  const [dreamsByDate, setDreamsByDate] = useState<Record<string, Dream[]>>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const entryAnim = useRef(new Animated.Value(1)).current;
  const [showEntry, setShowEntry] = useState(true);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [datePickerValue, setDatePickerValue] = useState(new Date(year, month));
  const insets = useSafeAreaInsets();

  // Calendar carousel animation
  const carouselAnim = useRef(new Animated.Value(0)).current;
  const [isAnimating, setIsAnimating] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch dreams for the current user
  const fetchUserDreams = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    try {
      const dreams = await fetchDreamsByUserId(user.id);
      const organized = organizeDreamsByDate(dreams);
      setDreams(dreams);
      setDreamsByDate(organized);
    } catch (error) {
      console.error('Error fetching dreams:', error);
      setDreams([]);
      setDreamsByDate({});
    } finally {
      setLoading(false);
    }
  };

  // Pull to refresh handler
  const onRefresh = async () => {
    setRefreshing(true);
    try {
      if (user?.id) {
        await syncOfflineDreams();
        await fetchUserDreams();
      }
    } catch (error) {
      console.error('Error refreshing:', error);
    } finally {
      setRefreshing(false);
    }
  };

  // Fetch dreams when component mounts or user changes
  useEffect(() => {
    if (user?.id) {
      fetchUserDreams();
    }
  }, [user?.id]);

  // Fetch dreams when month/year changes
  useEffect(() => {
    if (user?.id) {
      fetchUserDreams();
    }
  }, [month, year, user?.id]);

  // Sync and refresh when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      if (user?.id) {
        syncOfflineDreams().then(() => {
          fetchUserDreams();
        });
      }
    }, [user?.id])
  );

  // Helper functions for month calculations
  const getPreviousMonth = () => {
    if (month === 0) {
      return { month: 11, year: year - 1 };
    } else {
      return { month: month - 1, year };
    }
  };

  const getNextMonth = () => {
    if (month === 11) {
      return { month: 0, year: year + 1 };
    } else {
      return { month: month + 1, year };
    }
  };

  // Month navigation functions
  const goToPreviousMonth = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    
    // Animate to previous month
    Animated.timing(carouselAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      // Update month state
      const prev = getPreviousMonth();
      setMonth(prev.month);
      setYear(prev.year);
      setSelectedDate(null);
      
      // Reset animation position
      carouselAnim.setValue(0);
      setIsAnimating(false);
    });
  };

  const goToNextMonth = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    
    // Animate to next month
    Animated.timing(carouselAnim, {
      toValue: -1,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      // Update month state
      const next = getNextMonth();
      setMonth(next.month);
      setYear(next.year);
      setSelectedDate(null);
      
      // Reset animation position
      carouselAnim.setValue(0);
      setIsAnimating(false);
    });
  };

  // Handle swipe gesture with real-time tracking
  const onSwipeGesture = (event: any) => {
    const { state, translationX } = event.nativeEvent;
    
    if (state === State.ACTIVE && !isAnimating) {
      // Real-time animation during swipe
      const progress = Math.max(-1, Math.min(1, translationX / (screenWidth * 0.3)));
      carouselAnim.setValue(progress);
    } else if (state === State.END && !isAnimating) {
      const swipeThreshold = screenWidth * 0.25; // 25% of screen width
      
      if (Math.abs(translationX) < swipeThreshold) {
        // Snap back to center
        Animated.spring(carouselAnim, {
          toValue: 0,
          useNativeDriver: true,
          tension: 100,
          friction: 8,
        }).start();
      } else if (translationX > 0) {
        // Swipe right - go to previous month
        goToPreviousMonth();
      } else {
        // Swipe left - go to next month
        goToNextMonth();
      }
    }
  };

  // Markdown controls
  const handleMarkdown = (type: 'bold' | 'italic' | 'underline') => {
    if (type === 'bold') setDreamInput(dreamInput + '**bold**');
    if (type === 'italic') setDreamInput(dreamInput + '*italic*');
    if (type === 'underline') setDreamInput(dreamInput + '__underline__');
  };

  // Format date as YYYY-MM-DD
  const formatDate = (d: number, m = month, y = year) => `${y}-${(m + 1).toString().padStart(2, '0')}-${d.toString().padStart(2, '0')}`;

  // Render calendar grid component
  const renderCalendarGrid = (monthData: { month: number; year: number }, style?: any) => {
    const monthDays = getDaysInMonth(monthData.year, monthData.month);
    
    return (
      <Animated.View style={[{ width: screenWidth - 32 }, style]}>
        <View className="flex-row flex-wrap justify-between bg-dark-300 rounded-2xl p-4 mb-6 mx-4">
          {[...Array(monthDays)].map((_, i) => {
            const d = i + 1;
            const dateStr = formatDate(d, monthData.month, monthData.year);
            const hasDream = !!dreamsByDate[dateStr];
            const isSelected = selectedDate === dateStr;
            
            return (
              <Pressable
                key={d}
                className={`w-10 h-10 mb-2 items-center justify-center rounded-full ${
                  isSelected ? 'bg-[#8F7EDC]' : hasDream ? 'bg-dark-400' : 'bg-transparent'
                }`}
                onPress={() => setSelectedDate(dateStr)}
              >
                <Text className={`text-white font-semibold ${hasDream ? '' : 'opacity-50'}`}>
                  {d}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </Animated.View>
    );
  };

  // Save dream for selected date
  const handleSaveDream = async () => {
    if (!selectedDate || !dreamTitle.trim() || !dreamInput.trim() || !user?.id) return;
    
    setSaving(true);
    try {
      const success = await createDream(
        dreamTitle.trim(),
        dreamInput.trim(),
        isPrivate,
        selectedDate,
        user.id
      );

      if (success) {
        // Refresh dreams to show the new one
        await fetchUserDreams();
        Alert.alert('Başarılı', 'Rüyanız kaydedildi!');
      } else {
        Alert.alert('Bilgi', 'Rüya offline olarak kaydedildi ve bağlantı sağlandığında senkronize edilecek.');
      }

      // Clear form
      setDreamInput('');
      setDreamTitle('');
      setIsPrivate(false);
      
      // Animate form out
      setShowEntry(false);
      Animated.timing(entryAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: false,
      }).start(() => {
        setTimeout(() => {
          setShowEntry(true);
          entryAnim.setValue(1);
        }, 0);
      });
    } catch (error) {
      console.error('Error saving dream:', error);
      Alert.alert('Hata', 'Rüya kaydedilemedi.');
    } finally {
      setSaving(false);
    }
  };

  // Navigate to dream detail page
  const handleNavigateToDream = (dreamId: string) => {
    router.push(`/dream/${dreamId}`);
  };

  // Animated style for entry form
  const entryStyle = {
    opacity: entryAnim,
    height: entryAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 400] }),
  };

  // Year/month picker helpers
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const years = Array.from({ length: 10 }, (_, i) => currentYear - 5 + i);

  // Date label for top left
  const dateLabel = `${months[month]} ${year}`;

  // Handle date picked
  const handleDatePicked = (date: Date) => {
    setShowDatePicker(false);
    setYear(date.getFullYear());
    setMonth(date.getMonth());
    setSelectedDate(formatDateFromDateObj(date));
  };

  function formatDateFromDateObj(date: Date) {
    const y = date.getFullYear();
    const m = (date.getMonth() + 1).toString().padStart(2, '0');
    const d = date.getDate().toString().padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
  return (
    <SafeAreaView className="flex-1 bg-[#181B3A]">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#8F7EDC']}
            tintColor="#8F7EDC"
          />
        }
      >
      {/* Calendar grid */}
      <View className="px-4 pt-8">
        <View className="flex-row items-center justify-between mb-4">
          {/* Left navigation */}
          <TouchableOpacity 
            onPress={goToPreviousMonth}
            className="w-8 h-8 items-center justify-center"
          >
            <ChevronLeft size={20} color="#C1B6E3" />
          </TouchableOpacity>
          
          {/* Date label, acts as button to open picker */}
          <TouchableOpacity onPress={() => setShowDatePicker(true)}>
            <Text className="text-[#C1B6E3] text-lg font-semibold">{dateLabel}</Text>
          </TouchableOpacity>
          
          {/* Right navigation */}
          <TouchableOpacity 
            onPress={goToNextMonth}
            className="w-8 h-8 items-center justify-center"
          >
            <ChevronRight size={20} color="#C1B6E3" />
          </TouchableOpacity>
        </View>
        {/* Date picker modal */}
        <DateTimePickerModal
          isVisible={showDatePicker}
          mode="date"
          date={new Date(year, month)}
          maximumDate={new Date()}
          onConfirm={handleDatePicked}
          onCancel={() => setShowDatePicker(false)}
          display={Platform.OS === 'ios' ? 'inline' : 'calendar'}
        />
        {/* Calendar Carousel Container */}
        <PanGestureHandler onHandlerStateChange={onSwipeGesture}>
          <View style={{ height: 220, overflow: 'hidden' }}>
            <Animated.View
              style={{
                flexDirection: 'row',
                width: screenWidth * 3,
                transform: [
                  {
                    translateX: carouselAnim.interpolate({
                      inputRange: [-1, 0, 1],
                      outputRange: [-screenWidth * 2, -screenWidth, 0],
                    }),
                  },
                ],
              }}
            >
              {/* Previous Month */}
              {renderCalendarGrid(getPreviousMonth(), {
                position: 'absolute',
                left: 0,
              })}
              
              {/* Current Month */}
              {renderCalendarGrid({ month, year }, {
                position: 'absolute',
                left: screenWidth,
              })}
              
              {/* Next Month */}
              {renderCalendarGrid(getNextMonth(), {
                position: 'absolute',
                left: screenWidth * 2,
              })}
            </Animated.View>
          </View>
        </PanGestureHandler>
      </View>
      {/* Loading indicator */}
      {loading && (
        <View className="px-4 py-8">
          <Text className="text-[#C1B6E3] text-center">Rüyalar yükleniyor...</Text>
        </View>
      )}
      
      {/* Selected date view */}
      {selectedDate && (
        <View className="px-4">
          {/* List all dreams for the date 
          dark1- 393C6C
          dark2- 23265A
          */}
          {/* No dreams message 
          {selectedDate && (!dreamsByDate[selectedDate] || dreamsByDate[selectedDate].length === 0) && (
            <View className="bg-dark-400 rounded-2xl p-4 mt-4">
              <Text className="text-[#C1B6E3] text-center">
                Bu tarihte rüya bulunamadı
              </Text>
            </View>
          )}*/}
          
          {dreamsByDate[selectedDate] && dreamsByDate[selectedDate].map((dream: Dream, idx) => (
            <Pressable
              key={idx}
              onPress={() => handleNavigateToDream(dream.id)}
              className="flex-row items-center bg-dark-400 rounded-3xl px-4 py-4 shadow-lg mt-2"
              style={{ minHeight: 80 }}
            >
              <DateCircle date={selectedDate} />
              <View className="flex-1">
                <View className="flex-row items-center justify-between mb-1">
                  <Text className="text-white text-base font-semibold flex-1">{dream.title}</Text>
                  {dream.is_private && (
                    <View className="bg-[#8F7EDC] px-2 py-1 rounded-full ml-2">
                      <Text className="text-white text-xs">Özel</Text>
                    </View>
                  )}
                </View>
                <Text className="text-[#C1B6E3] text-xs" numberOfLines={2}>{dream.content}</Text>
              </View>
            </Pressable>
          ))}
          {/* Animated entry form, always shown below dreams */}
          {showEntry && (
            <Animated.View style={[{ overflow: 'hidden', marginTop: 16, marginBottom: 120, minHeight: 350, maxHeight: 600, borderRadius: 24 }, entryStyle]}>
                <View className="w-full bg-dark-300 rounded-2xl p-5 shadow-xl " style={{ minHeight: 320, maxHeight: 580, borderRadius: 24, justifyContent: 'flex-start' }}>
                  <TextInput
                    className="text-white text-base mb-3 px-3 py-2 bg-dark-400 rounded-xl"
                    placeholder="Dream title..."
                    placeholderTextColor="#A8B5DB"
                    value={dreamTitle}
                    onChangeText={setDreamTitle}
                    maxLength={100}
                  />
                  <TextInput
                    className="text-white text-base mb-4 px-3 py-2 bg-dark-400 rounded-xl"
                    multiline
                    placeholder="Write your dream..."
                    placeholderTextColor="#A8B5DB"
                    value={dreamInput}
                    onChangeText={setDreamInput}
                    maxLength={2000}
                    style={{ height: 180, maxHeight: 220, textAlignVertical: 'top' }}
                    scrollEnabled
                  />
                                    {/* Switch and Buttons Row */}
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 16 }}>
                    {/* Switch on the left */}
                    <View className="flex-col items-start">
                      <Switch
                        value={isPrivate}
                        onValueChange={setIsPrivate}
                        trackColor={{ false: '#0F0D23', true: '#AB8BFF' }}
                        thumbColor={isPrivate ? '#D6C7FF' : '#A8B5DB'}
                      />
                      <Text className="text-[#C1B6E3] text-xs ml-1">is private?</Text>
                    </View>
                    
                    {/* Buttons on the right */}
                    <View style={{ flexDirection: 'row', gap: 8 }}>
                    <Pressable onPress={() => {
                      Animated.timing(entryAnim, {
                        toValue: 0,
                        duration: 250,
                        useNativeDriver: false,
                      }).start(() => {
                        setTimeout(() => {
                          setShowEntry(false);
                          setDreamInput('');
                          setDreamTitle('');
                          setIsPrivate(false);
                          setTimeout(() => {
                            setShowEntry(true);
                            entryAnim.setValue(1);
                          }, 300);
                        }, 0);
                      });
                    }} style={{ paddingHorizontal: 16, paddingVertical: 8, backgroundColor: '#393C6C', borderRadius: 999, marginBottom: 8 }}>
                      <Text className="text-[#C1B6E3]">Cancel</Text>
                    </Pressable>
                    <Pressable
                      onPress={handleSaveDream}
                      style={{ paddingHorizontal: 16, paddingVertical: 8, backgroundColor: '#8F7EDC', borderRadius: 999, marginBottom: 8, opacity: (dreamTitle.trim() && dreamInput.trim() && !saving) ? 1 : 0.5 }}
                      disabled={!dreamTitle.trim() || !dreamInput.trim() || saving}
                    >
                      <Text className="text-white font-semibold">{saving ? 'Kaydediliyor...' : 'Save'}</Text>
                    </Pressable>
                    </View>
                  </View>
                </View>
            </Animated.View>
          )}
        </View>
      )}
      </ScrollView>
      </KeyboardAvoidingView>
      
      {/* Floating Create Button - only show when a date is selected */}
      {selectedDate && <FloatingCreateButton showDatePicker={true} />}
    </SafeAreaView>
  );
}
