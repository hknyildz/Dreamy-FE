import React, { useState } from 'react';
import { View, Text, Pressable, Modal, Alert } from 'react-native';
import { router } from 'expo-router';
import { Colors } from 'react-native/Libraries/NewAppScreen';

interface FloatingCreateButtonProps {
  onPress?: () => void;
  showDatePicker?: boolean;
  defaultDate?: Date;
}

const FloatingCreateButton: React.FC<FloatingCreateButtonProps> = ({ 
  onPress, 
  showDatePicker = false,
  defaultDate = new Date()
}) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState(defaultDate);

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      if (showDatePicker) {
        setIsModalVisible(true);
      } else {
        router.push('/create-dream' as any);
      }
    }
  };

  const handleDateConfirm = () => {
    setIsModalVisible(false);
    router.push('/create-dream' as any);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <>
      <Pressable
  onPress={handlePress}
  className='bg-dark-400 rounded-full'
  style={{
    position: 'absolute',
    bottom: 118,
    right: 38,
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.accent,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  }}
>
  <Text
    style={{
      color: '#fff', 
      fontSize: 32, 
      lineHeight: 36, 
      fontWeight: 'bold',
    }}
  >
    +
  </Text>
</Pressable>


      {showDatePicker && (
        <Modal
          visible={isModalVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setIsModalVisible(false)}
        >
          <View className="flex-1 bg-primary/80 justify-center items-center">
            <View className="bg-dark-100 rounded-2xl p-6 mx-8 w-80">
              <Text className="text-light-100 text-lg font-semibold mb-4 text-center">
                Rüya Tarihi Seçin
              </Text>
              
              <View className="bg-dark-200 rounded-xl p-4 mb-4">
                <Text className="text-light-100 text-center text-base">
                  {formatDate(selectedDate)}
                </Text>
              </View>

              <View className="flex-row justify-between">
                <Pressable
                  onPress={() => setIsModalVisible(false)}
                  className="flex-1 py-3 bg-dark-200 rounded-xl mr-2"
                >
                  <Text className="text-light-200 text-center font-semibold">İptal</Text>
                </Pressable>
                
                <Pressable
                  onPress={handleDateConfirm}
                  className="flex-1 py-3 bg-accent rounded-xl ml-2"
                >
                  <Text className="text-primary text-center font-semibold">Devam Et</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </>
  );
};

export default FloatingCreateButton; 