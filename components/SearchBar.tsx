import {icons} from '@/constants/icons';
import React from 'react';
import {Image, TextInput, View} from 'react-native';

interface SearchBarProps {
    placeholder: string;
    onPress?: () => void;
    value?: string;
    onChangeText?: (text: string) => void;
}

const SearchBar = ({placeholder, onPress, value, onChangeText}: SearchBarProps) => {
    return (
        <View className="flex-row items-center bg-dark-200 rounded-full px-5 py-4">
            <Image source={icons.search} className="size-5" resizeMode='contain' tintColor='#ab8bff' />
            <TextInput 
            value={value}
            onChangeText={onChangeText}
            placeholder={placeholder} 
            placeholderTextColor='#a8b5db'
            className="flex-1 text-white ml-2"
            autoCapitalize="none"
            autoCorrect={false}
            />
        </View>
    )
}

export default SearchBar;