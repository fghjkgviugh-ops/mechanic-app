// App.js — головний (і поки що єдиний) екран застосунку.
// Зверху — "Що зламалося?", посередині — карта з твоєю локацією, знизу — картка власника авто.

import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import MapView from 'react-native-maps'; // компонент карти
import * as Location from 'expo-location'; // доступ до GPS телефона
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context'; // знає про "чубчик" і нижню смужку iPhone
import OwnerCard from './components/OwnerCard'; // картка власника внизу
import BreakdownBar from './components/BreakdownBar';
import DiagnosisModal from './components/DiagnosisModal'; // вікно "Діагностика" // панель "Що зламалося?" зверху
import { owner } from './data/owner'; // дані власника (поки приклад)

// SafeAreaProvider "обгортає" застосунок, щоб панелі зверху і знизу знали,
// скільки місця займають "чубчик" зверху і системна смужка знизу.
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
  const [topHeight, setTopHeight] = useState(0); // висота панелі зверху
  const [problem, setProblem] = useState('');
  const [diagnosisOpen, setDiagnosisOpen] = useState(false); // чи відкрите вікно діагностики // що зламалося (текст)
  const insets = useSafeAreaInsets();

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

  const panelTop = insets.top + 8; // панель трохи нижче "чубчика"

  // Локацію знайдено — показуємо карту, зверху "Що зламалося?", знизу картку власника.
  return (
    <View style={styles.container}>
      <MapView
        style={StyleSheet.absoluteFill} // карта займає весь екран
        initialRegion={region} // з якого місця почати
        showsUserLocation // синя крапка "я тут"
        showsMyLocationButton // кнопка повернення до себе (Android)
        // Центр карти — між панеллю зверху і карткою знизу
        mapPadding={{ top: panelTop + topHeight, left: 0, right: 0, bottom: cardHeight }}
      />

      <View style={[styles.topWrap, { top: panelTop }]}>
        <BreakdownBar
          value={problem}
          onChange={setProblem}
          onOpen={() => setDiagnosisOpen(true)}
          onLayout={(event) => setTopHeight(event.nativeEvent.layout.height)}
        />
      </View>

      <View style={styles.cardWrap}>
        <OwnerCard
          owner={owner}
          problem={problem} // показуємо поломку і в картці
          onLayout={(event) => setCardHeight(event.nativeEvent.layout.height)}
        />
      </View>
      <DiagnosisModal visible={diagnosisOpen} problem={problem} onClose={() => setDiagnosisOpen(false)} />
      <StatusBar style="dark" />
    </View>
  );
}

// Стилі — як виглядають елементи. flex: 1 означає "займи весь вільний простір".
const styles = StyleSheet.create({
  container: { flex: 1 },
  // Панель "Що зламалося?" "приклеєна" до верху екрана поверх карти
  topWrap: { position: 'absolute', left: 16, right: 16 },
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
