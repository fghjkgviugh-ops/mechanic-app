// components/Photo.js — фото частин авто (двигун, ходова, електрика, кузов).
// Файли лежать у assets/. Висота рахується з пропорцій фото, щоб нічого не розтягувалось.

import { Image } from 'react-native';

const PHOTOS = {
  electric: { source: require('../assets/electric.jpg'), ratio: 0.6042 },
  engine: { source: require('../assets/engine.jpg'), ratio: 0.8998 },
  chassis: { source: require('../assets/chassis.jpg'), ratio: 0.8544 },
  body: { source: require('../assets/body.jpg'), ratio: 0.5709 },
};

// name — "engine", "chassis" або "body"; width — ширина в пікселях
export default function Photo({ name, width = 120 }) {
  const photo = PHOTOS[name];
  return (
    <Image
      source={photo.source}
      style={{ width, height: width * photo.ratio }}
      resizeMode="contain"
    />
  );
}
