// components/SearchBar.js — рядок пошуку адреси зверху екрана.
// Користувач вводить адресу і натискає "Пошук" на клавіатурі.
// Сам пошук робить App.js — сюди ми лише передаємо функцію onSearch.

import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';

export default function SearchBar({ onSearch, onChangeText, loading }) {
  // text — те, що зараз написано в полі
  const [text, setText] = useState('');

  function handleChange(value) {
    setText(value);
    onChangeText?.(value); // "?." означає: виклич, тільки якщо функцію передали
  }

  function handleSubmit() {
    const query = text.trim(); // прибираємо пробіли на початку й у кінці
    if (query) onSearch(query);
  }

  return (
    <View style={styles.bar}>
      <SearchIcon />
      <TextInput
        style={styles.input}
        value={text}
        onChangeText={handleChange}
        onSubmitEditing={handleSubmit} // натиснули "Пошук" на клавіатурі
        placeholder="Куди шукаємо? Введи адресу"
        placeholderTextColor="#8e8e93"
        returnKeyType="search" // кнопка на клавіатурі називається "Пошук"
        autoCorrect={false}
        clearButtonMode="never"
      />
      {/* Поки шукаємо — крутилка; якщо є текст — хрестик, щоб очистити поле */}
      {loading ? (
        <ActivityIndicator />
      ) : text ? (
        <Pressable onPress={() => handleChange('')} hitSlop={10} accessibilityLabel="Очистити">
          <Text style={styles.clear}>✕</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

// Іконка лупи: коло + коротка лінія
function SearchIcon() {
  return (
    <Svg width={20} height={20} viewBox="0 0 20 20">
      <Circle cx="8.5" cy="8.5" r="6" stroke="#6b7280" strokeWidth="2" fill="none" />
      <Path d="M13 13 L18 18" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" />
    </Svg>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingHorizontal: 14,
    height: 52,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  input: { flex: 1, fontSize: 16, color: '#111', height: '100%' },
  clear: { fontSize: 16, color: '#8e8e93', paddingHorizontal: 4 },
});
