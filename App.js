// App.js — головний (і поки що єдиний) екран застосунку.
// Тут ми показуємо карту на весь екран і ставимо її центр у твою поточну локацію.

import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import MapView from 'react-native-maps'; // компонент карти
import * as Location from 'expo-location'; // доступ до GPS телефона

export default function App() {
  // "Стан" (state) — це пам'ять компонента. Коли стан змінюється,
  // React автоматично перемальовує екран.
  const [region, setRegion] = useState(null); // ділянка карти, яку показуємо
  const [errorMsg, setErrorMsg] = useState(null); // текст помилки, якщо щось пішло не так

  // useEffect з порожнім масивом [] виконується один раз — коли екран з'явився.
  useEffect(() => {
    (async () => {
      // 1. Просимо в користувача дозвіл на геолокацію.
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Немає дозволу на геолокацію. Увімкни його в налаштуваннях телефона.');
        return;
      }

      try {
        // 2. Отримуємо поточні координати.
        const position = await Location.getCurrentPositionAsync({});

        // 3. Зберігаємо ділянку карти навколо нас.
        //    latitudeDelta / longitudeDelta — це "масштаб": чим менше число, тим ближче.
        setRegion({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        });
      } catch (e) {
        setErrorMsg('Не вдалося визначити локацію. Перевір, чи увімкнений GPS.');
      }
    })();
  }, []);

  // Якщо сталася помилка — показуємо текст замість карти.
  if (errorMsg) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>{errorMsg}</Text>
      </View>
    );
  }

  // Поки локація ще шукається — показуємо крутилку завантаження.
  if (!region) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text>Шукаю твою локацію…</Text>
      </View>
    );
  }

  // Локацію знайдено — показуємо карту.
  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={region} // з якого місця почати
        showsUserLocation // синя крапка "я тут"
        showsMyLocationButton // кнопка повернення до себе (Android)
      />
      <StatusBar style="dark" />
    </View>
  );
}

// Стилі — як виглядають елементи. flex: 1 означає "займи весь вільний простір".
const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 12,
  },
  error: { textAlign: 'center', color: '#b00020', fontSize: 16 },
});
