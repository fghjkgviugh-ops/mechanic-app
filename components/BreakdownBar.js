// components/BreakdownBar.js — панель зверху екрана: "Що зламалося?"
// Можна натиснути готову кнопку (наприклад, "Акумулятор") або написати своїми словами.
// Сам текст зберігається в App.js — сюди ми отримуємо його через value і onChange.

import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { problems } from '../data/problems';

export default function BreakdownBar({ value, onChange, onLayout }) {
  return (
    <View style={styles.panel} onLayout={onLayout}>
      {/* Поле для опису поломки */}
      <View style={styles.inputRow}>
        <WrenchIcon />
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChange}
          placeholder="Що зламалося? Опиши проблему"
          placeholderTextColor="#8e8e93"
          returnKeyType="done" // кнопка на клавіатурі "Готово"
        />
        {value ? (
          <Pressable onPress={() => onChange('')} hitSlop={10} accessibilityLabel="Очистити">
            <Text style={styles.clear}>✕</Text>
          </Pressable>
        ) : null}
      </View>

      {/* Кнопки з типовими поломками. horizontal — гортаються вбік пальцем */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chips}
        keyboardShouldPersistTaps="handled"
      >
        {problems.map((problem) => {
          const selected = value === problem; // ця кнопка зараз вибрана?
          return (
            <Pressable
              key={problem} // key — унікальна "мітка" кожного елемента списку, потрібна React
              onPress={() => onChange(selected ? '' : problem)} // повторне натискання знімає вибір
              style={[styles.chip, selected && styles.chipSelected]}
            >
              <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{problem}</Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

// Іконка гайкового ключа
function WrenchIcon() {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24">
      <Path
        d="M14.7 6.3a4 4 0 0 0 5 5l-8.4 8.4a2.1 2.1 0 0 1-3-3l8.4-8.4a4 4 0 0 0-2-2Z"
        stroke="#6b7280"
        strokeWidth="2"
        strokeLinejoin="round"
        fill="none"
      />
    </Svg>
  );
}

const styles = StyleSheet.create({
  panel: {
    backgroundColor: '#fff',
    borderRadius: 18,
    paddingVertical: 10,
    gap: 10,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  inputRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 14, height: 40 },
  input: { flex: 1, fontSize: 16, color: '#111', height: '100%' },
  clear: { fontSize: 16, color: '#8e8e93', paddingHorizontal: 4 },
  chips: { gap: 8, paddingHorizontal: 12 },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: '#f2f2f5',
  },
  chipSelected: { backgroundColor: '#111' },
  chipText: { fontSize: 14, color: '#111', fontWeight: '500' },
  chipTextSelected: { color: '#fff' },
});
