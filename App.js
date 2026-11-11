// App.js — головний (і поки що єдиний) екран застосунку.
// Зверху — пошук адреси, посередині — карта з твоєю локацією, знизу — картка власника авто.

import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Keyboard, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import MapView, { Marker } from 'react-native-maps'; // карта і мітка на ній
import * as Location from 'expo-location'; // GPS і пошук адрес
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context'; // знає про "чубчик" і нижню смужку iPhone
import OwnerCard from './components/OwnerCard'; // картка власника внизу
import SearchBar from './components/SearchBar'; // рядок пошуку зверху
import { owner } from './data/owner'; // дані власника (поки приклад)

// SafeAreaProvider "обгортає" застосунок, щоб пошук і картка знали,
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
  const [place, setPlace] = useState(null); // знайдене місце: { latitude, longitude, title }
  const [searching, setSearching] = useState(false); // чи йде зараз пошук
  const [searchError, setSearchError] = useState(null); // "Нічого не знайдено" тощо

  // ref — це "посилання" на карту, щоб можна було керувати нею з коду (наприклад, перемістити).
  const mapRef = useRef(null);
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

  // Пошук адреси. Викликається, коли в рядку пошуку натиснули "Пошук".
  async function handleSearch(query) {
    Keyboard.dismiss(); // ховаємо клавіатуру
    setSearching(true);
    setSearchError(null);

    try {
      // 1. Перетворюємо текст адреси на координати (це називається "геокодування").
      const results = await Location.geocodeAsync(query);
      if (results.length === 0) {
        setSearchError('Нічого не знайдено. Спробуй додати місто, наприклад: «Хрещатик 1, Київ».');
        return;
      }
      const { latitude, longitude } = results[0]; // беремо перший (найкращий) результат

      // 2. Дізнаємося гарну назву цього місця (вулиця, номер, місто).
      let title = query;
      try {
        const [address] = await Location.reverseGeocodeAsync({ latitude, longitude });
        if (address) {
          const street = [address.street, address.streetNumber].filter(Boolean).join(', ');
          title = [street || address.name, address.city].filter(Boolean).join(', ') || query;
        }
      } catch {
        // Якщо назву не вдалося отримати — просто лишаємо те, що ввів користувач.
      }

      // 3. Ставимо мітку і плавно переміщуємо карту туди (600 мілісекунд).
      setPlace({ latitude, longitude, title });
      mapRef.current?.animateToRegion(
        { latitude, longitude, latitudeDelta: 0.01, longitudeDelta: 0.01 },
        600
      );
    } catch (e) {
      setSearchError('Пошук не вдався. Перевір інтернет і спробуй ще раз.');
    } finally {
      // finally виконується завжди — і після успіху, і після помилки.
      setSearching(false);
    }
  }

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

  const searchTop = insets.top + 8; // пошук трохи нижче "чубчика"

  // Локацію знайдено — показуємо карту, зверху пошук, знизу картку власника.
  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFill} // карта займає весь екран
        initialRegion={region} // з якого місця почати
        showsUserLocation // синя крапка "я тут"
        showsMyLocationButton // кнопка повернення до себе (Android)
        // Центр карти — між пошуком зверху і карткою знизу
        mapPadding={{ top: searchTop + 52, left: 0, right: 0, bottom: cardHeight }}
      >
        {/* Червона мітка на знайденому місці. Натисни на неї — побачиш адресу. */}
        {place && (
          <Marker
            coordinate={{ latitude: place.latitude, longitude: place.longitude }}
            title={place.title}
          />
        )}
      </MapView>

      <View style={[styles.searchWrap, { top: searchTop }]}>
        <SearchBar
          onSearch={handleSearch}
          onChangeText={() => setSearchError(null)} // почали друкувати — ховаємо помилку
          loading={searching}
        />
        {searchError && <Text style={styles.searchError}>{searchError}</Text>}
      </View>

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
  // Пошук "приклеєний" до верху екрана поверх карти
  searchWrap: { position: 'absolute', left: 16, right: 16, gap: 8 },
  searchError: {
    backgroundColor: '#fff',
    color: '#b00020',
    fontSize: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    overflow: 'hidden',
  },
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
