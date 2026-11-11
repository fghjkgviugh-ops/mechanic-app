// components/CarIcon.js — намальована 2D-машинка (вигляд збоку, хетчбек, як Mazda 3 2007).
// Малюємо через SVG: це "векторна" картинка з ліній і фігур,
// тому вона чітка на будь-якому екрані й будь-якого розміру.

import Svg, { Circle, Defs, Ellipse, LinearGradient, Path, Rect, Stop } from 'react-native-svg';

// width — ширина машинки в пікселях; висота рахується сама, щоб пропорції не ламалися.
export default function CarIcon({ width = 140 }) {
  const height = (width * 90) / 220;

  return (
    <Svg width={width} height={height} viewBox="0 0 220 90">
      <Defs>
        {/* Градієнт кузова: зверху трохи світліший, знизу майже чорний — так фарба "блищить" */}
        <LinearGradient id="body" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#3a3f47" />
          <Stop offset="0.45" stopColor="#1a1d22" />
          <Stop offset="1" stopColor="#08090b" />
        </LinearGradient>
        <LinearGradient id="glass" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#5b6b7a" />
          <Stop offset="1" stopColor="#1f262e" />
        </LinearGradient>
      </Defs>

      {/* Тінь під машиною */}
      <Ellipse cx="112" cy="82" rx="100" ry="5" fill="#000" opacity="0.15" />

      {/* Кузов. Дві дуги "A 19 19" — це вирізи під колеса */}
      <Path
        d="M14 64 C8 64 8 52 10 46 L16 36 C26 26 42 18 64 14 C90 9 118 9 132 14 L160 30 C180 32 198 36 206 42 C212 46 214 52 212 58 L210 64 L186 64 A19 19 0 0 0 148 64 L72 64 A19 19 0 0 0 34 64 Z"
        fill="url(#body)"
      />

      {/* Вікна */}
      <Path d="M40 34 C52 25 64 20 78 19 L128 19 C134 19 140 23 150 31 Z" fill="url(#glass)" />
      {/* Стійка між дверима */}
      <Rect x="102" y="19" width="4" height="13" fill="#0c0d10" />
      {/* Відблиск на склі */}
      <Path d="M84 21 L96 21 L90 30 L78 30 Z" fill="#ffffff" opacity="0.12" />

      {/* Лінія-відблиск уздовж боку */}
      <Path d="M20 44 C70 40 150 40 204 45" stroke="#ffffff" strokeOpacity="0.16" strokeWidth="1.5" fill="none" />
      {/* Лінії дверей і ручки */}
      <Path d="M104 34 L104 60 M150 33 L148 60" stroke="#000" strokeOpacity="0.5" strokeWidth="1" />
      <Rect x="88" y="40" width="9" height="2" rx="1" fill="#6b7280" />
      <Rect x="134" y="40" width="9" height="2" rx="1" fill="#6b7280" />
      {/* Дзеркало */}
      <Path d="M150 30 L157 29 L158 34 L151 34 Z" fill="#14161a" />

      {/* Фара та задній ліхтар */}
      <Path d="M196 39 C203 40 208 43 210 47 L199 46 Z" fill="#e8eef5" />
      <Path d="M11 42 L18 37 L19 45 L11 47 Z" fill="#c8102e" />

      {/* Колеса: шина, диск, центр */}
      <Wheel cx={53} />
      <Wheel cx={167} />
    </Svg>
  );
}

function Wheel({ cx }) {
  return (
    <>
      {/* Темна колісна арка (півколо над колесом) */}
      <Path d={`M${cx - 19} 64 A19 19 0 0 1 ${cx + 19} 64 Z`} fill="#050506" />
      <Circle cx={cx} cy="66" r="15" fill="#151515" />
      <Circle cx={cx} cy="66" r="9" fill="#9aa1a9" />
      <Circle cx={cx} cy="66" r="3" fill="#4b5158" />
    </>
  );
}
