// App.js — головний (і поки що єдиний) екран застосунку.
// Тут ми показуємо карту на весь екран із твоєю локацією, а знизу — картку власника авто.

import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import MapView from 'react-native-maps'; // компонент карти
import * as Location from 'expo-location'; // доступ до GPS телефона
import { SafeAreaProvider } from 'react-native-safe-area-context'; // знає про "чубчик" і нижню смужку iPhone
import OwnerCard from './components/OwnerCard'; // картка власника внизу
import { owner } from './data/owner'; // дані власника (поки приклад)

// SafeAreaProvider "обгортає" застосунок, щоб картка внизу знала,
// скільки місця займає системна смужка iPhone.
export default function App() {
  return (
    <SafeAreaProvider>
      <HomeScreen />
    </SafeAreaProvider>
  );
}

function HomeScreen() {
  // "Стан" (state) — це пам'ять компонента. Коли стан змінюється,
  // React автоматично перемальовує екран.
  const [region, setRegion] = useState(null); // ділянка карти, яку показуємо
  const [errorMsg, setErrorMsg] = useState(null); // текст помилки, якщо щось пішло не так
  const [cardHeight, setCardHeight] = useState(0); // висота картки внизу

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

  // Локацію знайдено — показуємо карту, а поверх неї знизу картку власника.
  return (
    <View style={styles.container}>
      <MapView
        style={StyleSheet.absoluteFill} // карта займає весь екран
        initialRegion={region} // з якого місця почати
        showsUserLocation // синя крапка "я тут"
        showsMyLocationButton // кнопка повернення до себе (Android)
        mapPadding={{ top: 0, left: 0, right: 0, bottom: cardHeight }} // центр карти — над карткою
      />
      <View style={styles.cardWrap}>
        <OwnerCard
          owner={owner}
          onLayout={(event) => setCardHeight(event.nativeEvent.layout.height)}
        />
      </View>
      <StatusBar style="dark" />
    </View>
  );
}

// Стилі — як виглядають елементи. flex: 1 означає "займи весь вільний простір".
const styles = StyleSheet.create({
  container: { flex: 1 },
  // Картка "приклеєна" до низу екрана поверх карти
  cardWrap: { position: 'absolute', left: 0, right: 0, bottom: 0 },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 12,
  },
  error: { textAlign: 'center', color: '#b00020', fontSize: 16 },
});
