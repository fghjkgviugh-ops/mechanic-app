// components/CarIcon.js — фото Mazda 3 (хетчбек). Файл лежить у assets/mazda3.jpg.
// width — ширина в пікселях; висота рахується з пропорцій фото, щоб машина не розтягувалась.

import { Image } from 'react-native';

// Пропорція фото: висота / ширина (фото вже обрізане до машини)
const RATIO = 445 / 1026;

export default function CarIcon({ width = 140 }) {
  return (
    <Image
      source={require('../assets/mazda3.jpg')}
      style={{ width, height: width * RATIO }}
      resizeMode="contain" // показати все фото цілком, без обрізання
      accessibilityLabel="Mazda 3 2007, чорний"
    />
  );
}
