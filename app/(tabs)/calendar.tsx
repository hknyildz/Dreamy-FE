import React, { useState, useRef } from 'react';
import { View, Text, Pressable, ScrollView, TextInput, KeyboardAvoidingView, Platform, Animated, Easing, SafeAreaView, Modal, TouchableOpacity } from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FloatingCreateButton from '@/components/FloatingCreateButton';

// Initial mock dream data by date (YYYY-MM-DD)
const initialDreamsByDate: Record<string, { title: string; preview: string }[]> = {
  '2025-03-16': [
    { title: 'Fena bi rüya', preview: 'rüyamın özeti/dam gibi, olay özetim' },
    { title: 'Fena bi rüya 2', preview: 'rüyamın özeti/dam gibi, olay özetim' },
    { title: 'Fena bi rüya 3', preview: 'rüyamın özeti/dam gibi, olay özetim' },
    { title: 'Fena bi rüya 4', preview: 'rüyamın özeti/dam gibi, olay özetim' },
    { title: 'Fena bi rüya 5', preview: 'rüyamın özeti/dam gibi, olay özetim' },
    { title: 'Fena bi rüya 6', preview: 'rüyamın özeti/dam gibi, olay özetim' },
    { title: 'Fena bi rüya 7', preview: 'rüyamın özeti/dam gibi, olay özetim' },
    { title: 'Fena bi rüya 8', preview: 'rüyamın özeti/dam gibi, olay özetim' },
  ],
  '2025-03-15': [
    { title: 'Rüya 2', preview: 'rüya içeriği' }
  ],
  '2025-03-09': [
    { title: 'Rüya 3', preview: 'rüya içeriği' }
  ],
  '2025-02-28': [
    { title: 'Rüya 4', preview: 'rüya içeriği' }
  ],
  '2025-02-27': [
    { title: 'Rüya 5', preview: 'rüya içeriği' }
  ],
  '2025-02-26': [
    { title: 'Rüya 6', preview: 'rüya içeriği' }
  ],
  '2025-02-25': [
    { title: 'Rüya 7', preview: 'rüya içeriği' }
  ],
};

// Helper to get days in month
function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
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

export default function CalendarPage() {
  // Year/month state
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(currentYear);
  const [month, setMonth] = useState(new Date().getMonth()); // 0-indexed
  const daysInMonth = getDaysInMonth(year, month);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [dreamInput, setDreamInput] = useState('');
  const [dreamTitle, setDreamTitle] = useState('');
  const [dreamsByDate, setDreamsByDate] = useState(initialDreamsByDate);
  const [expandedDream, setExpandedDream] = useState<{ date: string; idx: number } | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const anim = useRef(new Animated.Value(0)).current;
  const entryAnim = useRef(new Animated.Value(1)).current;
  const [showEntry, setShowEntry] = useState(true);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [datePickerValue, setDatePickerValue] = useState(new Date(year, month));
  const insets = useSafeAreaInsets();

  // Markdown controls
  const handleMarkdown = (type: 'bold' | 'italic' | 'underline', isEdit = false) => {
    if (isEdit) {
      if (type === 'bold') setEditContent(editContent + '**bold**');
      if (type === 'italic') setEditContent(editContent + '*italic*');
      if (type === 'underline') setEditContent(editContent + '__underline__');
    } else {
      if (type === 'bold') setDreamInput(dreamInput + '**bold**');
      if (type === 'italic') setDreamInput(dreamInput + '*italic*');
      if (type === 'underline') setDreamInput(dreamInput + '__underline__');
    }
  };

  // Format date as YYYY-MM-DD
  const formatDate = (d: number) => `${year}-${(month + 1).toString().padStart(2, '0')}-${d.toString().padStart(2, '0')}`;

  // Save dream for selected date
  const handleSaveDream = () => {
    if (!selectedDate || !dreamTitle.trim() || !dreamInput.trim()) return;
    setDreamsByDate(prev => ({
      ...prev,
      [selectedDate]: prev[selectedDate]
        ? [...prev[selectedDate], { title: dreamTitle.trim(), preview: dreamInput.trim() }]
        : [{ title: dreamTitle.trim(), preview: dreamInput.trim() }],
    }));
    setDreamInput('');
    setDreamTitle('');
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
  };

  // Expand dream card with animation
  const handleExpandDream = (date: string, idx: number) => {
    if (expandedDream && (expandedDream.date !== date || expandedDream.idx !== idx)) {
      // If another dream is expanded, animate close, then open new
      Animated.timing(anim, {
        toValue: 0,
        duration: 200,
        easing: Easing.in(Easing.ease),
        useNativeDriver: false,
      }).start(() => {
        setExpandedDream(null);
        setTimeout(() => {
          setEditTitle(dreamsByDate[date][idx].title);
          setEditContent(dreamsByDate[date][idx].preview);
          setExpandedDream({ date, idx });
          anim.setValue(0);
          Animated.timing(anim, {
            toValue: 1,
            duration: 300,
            easing: Easing.out(Easing.ease),
            useNativeDriver: false,
          }).start();
        }, 50);
      });
    } else if (!expandedDream) {
      setEditTitle(dreamsByDate[date][idx].title);
      setEditContent(dreamsByDate[date][idx].preview);
      setExpandedDream({ date, idx });
      anim.setValue(0);
      Animated.timing(anim, {
        toValue: 1,
        duration: 300,
        easing: Easing.out(Easing.ease),
        useNativeDriver: false,
      }).start();
    }
    // If already expanded on the same dream, do nothing
  };

  // Cancel button for expanded dream
  const handleCancelExpand = () => {
    Animated.timing(anim, {
      toValue: 0,
      duration: 200,
      easing: Easing.in(Easing.ease),
      useNativeDriver: false,
    }).start(() => {
      setExpandedDream(null);
      setEditTitle('');
      setEditContent('');
    });
  };

  // Save edits to dream
  const handleEditSave = () => {
    if (!expandedDream || !editTitle.trim() || !editContent.trim()) return;
    setDreamsByDate(prev => {
      const arr = prev[expandedDream.date] ? [...prev[expandedDream.date]] : [];
      arr[expandedDream.idx] = { title: editTitle.trim(), preview: editContent.trim() };
      return { ...prev, [expandedDream.date]: arr };
    });
    setExpandedDream(null);
    setEditTitle('');
    setEditContent('');
  };

  // Delete dream
  const handleDeleteDream = () => {
    if (!expandedDream) return;
    setDreamsByDate(prev => {
      const arr = prev[expandedDream.date] ? [...prev[expandedDream.date]] : [];
      arr.splice(expandedDream.idx, 1);
      if (arr.length === 0) {
        const { [expandedDream.date]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [expandedDream.date]: arr };
    });
    setExpandedDream(null);
    setEditTitle('');
    setEditContent('');
  };

  // Animated style for expansion
  const expandedStyle = {
    height: anim.interpolate({ inputRange: [0, 1], outputRange: [80, 260] }),
    opacity: anim.interpolate({ inputRange: [0, 1], outputRange: [0.7, 1] }),
    padding: anim.interpolate({ inputRange: [0, 1], outputRange: [16, 20] }),
  };

  // Animated style for entry form
  const entryStyle = {
    opacity: entryAnim,
    height: entryAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 220] }),
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
      {/* Calendar grid */}
      <View className="px-4 pt-8">
        <View className="flex-row items-center mb-4">
          {/* Date label, acts as button to open picker */}
          <TouchableOpacity onPress={() => setShowDatePicker(true)}>
            <Text className="text-[#C1B6E3] text-lg font-semibold">{dateLabel}</Text>
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
        <View className="flex-row flex-wrap justify-between bg-[#23265A] rounded-2xl p-4 mb-6">
          {[...Array(daysInMonth)].map((_, i) => {
            const d = i + 1;
            const dateStr = formatDate(d);
            const hasDream = !!dreamsByDate[dateStr];
            return (
              <Pressable
                key={d}
                className={`w-10 h-10 mb-2 items-center justify-center rounded-full ${selectedDate === dateStr ? 'bg-[#8F7EDC]' : hasDream ? 'bg-[#393C6C]' : 'bg-transparent'}`}
                onPress={() => setSelectedDate(dateStr)}
              >
                <Text className={`text-white font-semibold ${hasDream ? '' : 'opacity-50'}`}>{d}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>
      {/* Selected date view */}
      {selectedDate && (
        <ScrollView
          className="px-4"
          contentContainerStyle={{ paddingBottom: insets.bottom + 80 }}
          keyboardShouldPersistTaps="handled"
        >
          {/* List all dreams for the date */}
          {dreamsByDate[selectedDate] && dreamsByDate[selectedDate].map((dream, idx) => (
            expandedDream && expandedDream.date === selectedDate && expandedDream.idx === idx ? (
              // Expanded editable dream card
              <Animated.View key={idx} style={[{ backgroundColor: '#393C6C', borderRadius: 24, marginTop: 8, shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 8, flexDirection: 'row', alignItems: 'flex-start' }, expandedStyle]}> 
                <DateCircle date={selectedDate} />
                <View style={{ flex: 1 }}>
                  <TextInput
                    className="text-white text-base font-semibold mb-2 px-3 py-2 bg-[#23265A] rounded-xl"
                    value={editTitle}
                    onChangeText={setEditTitle}
                    maxLength={100}
                  />
                  <TextInput
                    className="text-white text-base min-h-[80px] max-h-32 mb-2 px-3 py-2 bg-[#23265A] rounded-xl"
                    multiline
                    value={editContent}
                    onChangeText={setEditContent}
                    maxLength={2000}
                  />
                  {/* Markdown controls */}
                  <View className="flex-row justify-center space-x-4 mb-2">
                    <Pressable onPress={() => handleMarkdown('bold', true)} className="px-3 py-1 bg-[#393C6C] rounded-full border border-[#8F7EDC]">
                      <Text className="text-white font-bold">B</Text>
                    </Pressable>
                    <Pressable onPress={() => handleMarkdown('italic', true)} className="px-3 py-1 bg-[#393C6C] rounded-full border border-[#8F7EDC]">
                      <Text className="text-white italic">I</Text>
                    </Pressable>
                    <Pressable onPress={() => handleMarkdown('underline', true)} className="px-3 py-1 bg-[#393C6C] rounded-full border border-[#8F7EDC]">
                      <Text className="text-white underline">U</Text>
                    </Pressable>
                  </View>
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'flex-end', gap: 8, marginTop: 8 }}>
                    <Pressable onPress={handleDeleteDream} style={{ paddingHorizontal: 16, paddingVertical: 8, backgroundColor: '#ef4444', borderRadius: 999, marginBottom: 8 }}>
                      <Text className="text-white font-semibold">Delete</Text>
                    </Pressable>
                    <Pressable onPress={handleCancelExpand} style={{ paddingHorizontal: 16, paddingVertical: 8, backgroundColor: '#393C6C', borderRadius: 999, marginBottom: 8 }}>
                      <Text className="text-[#C1B6E3]">Cancel</Text>
                    </Pressable>
                    <Pressable
                      onPress={handleEditSave}
                      style={{ paddingHorizontal: 16, paddingVertical: 8, backgroundColor: '#8F7EDC', borderRadius: 999, marginBottom: 8, opacity: (editTitle.trim() && editContent.trim()) ? 1 : 0.5 }}
                      disabled={!editTitle.trim() || !editContent.trim()}
                    >
                      <Text className="text-white font-semibold">Save</Text>
                    </Pressable>
                  </View>
                </View>
              </Animated.View>
            ) : (
              // Collapsed dream card
              <Pressable
                key={idx}
                onPress={() => handleExpandDream(selectedDate, idx)}
                className="flex-row items-center bg-[#393C6C] rounded-3xl px-4 py-4 shadow-lg mt-2"
                style={{ minHeight: 80 }}
              >
                <DateCircle date={selectedDate} />
                <View className="flex-1">
                  <Text className="text-white text-base font-semibold mb-1">{dream.title}</Text>
                  <Text className="text-[#C1B6E3] text-xs" numberOfLines={2}>{dream.preview}</Text>
                </View>
              </Pressable>
            )
          ))}
          {/* Animated entry form, always shown below dreams */}
          {showEntry && (
            <Animated.View style={[{ overflow: 'hidden', marginTop: 16,marginBottom: 80, minHeight: 350, maxHeight: 520, borderRadius: 24 }, entryStyle]}>
                <View className="w-full bg-[#23265A] rounded-2xl p-5 shadow-xl flex-1" style={{ minHeight: 320, maxHeight: 500, borderRadius: 24, justifyContent: 'flex-start' }}>
                  <TextInput
                    className="text-white text-base mb-3 px-3 py-2 bg-[#393C6C] rounded-xl"
                    placeholder="Dream title..."
                    placeholderTextColor="#A8B5DB"
                    value={dreamTitle}
                    onChangeText={setDreamTitle}
                    maxLength={100}
                  />
                  <TextInput
                    className="text-white text-base mb-4 px-3 py-2 bg-[#393C6C] rounded-xl"
                    multiline
                    placeholder="Write your dream..."
                    placeholderTextColor="#A8B5DB"
                    value={dreamInput}
                    onChangeText={setDreamInput}
                    maxLength={2000}
                    style={{ height: 180, maxHeight: 220, textAlignVertical: 'top' }}
                    scrollEnabled
                  />
                  {/* Markdown controls */}
                  <View className="flex-row justify-center space-x-4 mb-2">
                    <Pressable onPress={() => handleMarkdown('bold')} className="px-3 py-1 bg-[#393C6C] rounded-full border border-[#8F7EDC]">
                      <Text className="text-white font-bold">B</Text>
                    </Pressable>
                    <Pressable onPress={() => handleMarkdown('italic')} className="px-3 py-1 bg-[#393C6C] rounded-full border border-[#8F7EDC]">
                      <Text className="text-white italic">I</Text>
                    </Pressable>
                    <Pressable onPress={() => handleMarkdown('underline')} className="px-3 py-1 bg-[#393C6C] rounded-full border border-[#8F7EDC]">
                      <Text className="text-white underline">U</Text>
                    </Pressable>
                  </View>
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'flex-end', gap: 8, marginTop: 16 }}>
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
                      style={{ paddingHorizontal: 16, paddingVertical: 8, backgroundColor: '#8F7EDC', borderRadius: 999, marginBottom: 8, opacity: (dreamTitle.trim() && dreamInput.trim()) ? 1 : 0.5 }}
                      disabled={!dreamTitle.trim() || !dreamInput.trim()}
                    >
                      <Text className="text-white font-semibold">Save</Text>
                    </Pressable>
                  </View>
                </View>
            </Animated.View>
          )}
        </ScrollView>
      )}
      </KeyboardAvoidingView>
      
      {/* Floating Create Button - only show when a date is selected */}
      {selectedDate && <FloatingCreateButton showDatePicker={true} />}
    </SafeAreaView>
  );
}
