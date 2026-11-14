// components/PartDrawing.js — намальовані частини авто (спрощені схеми у векторі SVG).
// Кожна деталь має свій id. Якщо id є у списку broken — деталь малюється червоним.

import Svg, { Circle, Path, Rect } from 'react-native-svg';

const BROKEN = '#e5322d';

// paint(id, звичайний_колір) — червоний, якщо деталь зламана, інакше звичайний колір
const DRAWINGS = {
  engine: (paint) => (
    <>
      <Rect x="50" y="46" width="110" height="64" rx="8" fill="#3b4048" />
      <Rect x="60" y="28" width="90" height="20" rx="4" fill="#555c66" />
      {/* Свічки запалювання: три маленькі кружечки на головці блока */}
      {[80, 110, 140].map((x) => (
        <Circle key={x} cx={x} cy="28" r="6" fill={paint('spark', '#d9d9de')} />
      ))}
      {/* Ремінь ГРМ: дуга з лівого боку */}
      <Path
        d="M30 62 A20 20 0 0 0 30 98"
        fill="none"
        stroke={paint('belt', '#c9ced6')}
        strokeWidth="6"
        strokeLinecap="round"
      />
      {/* Масляний фільтр: циліндр збоку */}
      <Rect x="170" y="60" width="18" height="44" rx="6" fill={paint('oil', '#8a6d3b')} />
      {/* Помпа охолодження: коло знизу */}
      <Circle cx="100" cy="122" r="10" fill={paint('pump', '#6b7280')} />
    </>
  ),

  battery: (paint) => (
    <>
      <Rect x="40" y="40" width="120" height="80" rx="8" fill={paint('battery', '#2f3439')} />
      {/* Два клеми (контакти) зверху */}
      <Circle cx="62" cy="40" r="7" fill={paint('terminals', '#c9ced6')} />
      <Circle cx="138" cy="40" r="7" fill={paint('terminals', '#c9ced6')} />
      {/* Генератор праворуч */}
      <Circle cx="180" cy="100" r="14" fill={paint('alternator', '#6b7280')} />
    </>
  ),

  wheel: (paint) => (
    <>
      <Circle cx="100" cy="70" r="60" fill={paint('tire', '#151515')} />
      <Circle cx="100" cy="70" r="36" fill={paint('rim', '#9aa1a9')} />
      <Circle cx="100" cy="70" r="12" fill={paint('hub', '#4b5158')} />
    </>
  ),

  brakes: (paint) => (
    <>
      <Circle cx="100" cy="70" r="50" fill={paint('disc', '#8a9099')} />
      {/* Суппорт із колодками, що стискає диск */}
      <Rect x="118" y="50" width="34" height="40" rx="6" fill={paint('pads', '#3b4048')} />
      {/* Бачок гальмівної рідини */}
      <Circle cx="30" cy="30" r="12" fill={paint('fluid', '#e8c15a')} />
    </>
  ),

  cooling: (paint) => (
    <>
      {/* Радіатор: прямокутник із сіткою */}
      <Rect x="30" y="30" width="130" height="80" rx="6" fill={paint('radiator', '#6b7b8c')} />
      <Path d="M30 50 H160 M30 70 H160 M30 90 H160" stroke="#9fb3c8" strokeWidth="2" />
      {/* Термостат внизу справа */}
      <Rect x="150" y="104" width="30" height="16" rx="4" fill={paint('thermostat', '#3b4048')} />
    </>
  ),
};

// width — ширина малюнка в пікселях; висота рахується сама, пропорції не ламаються.
export default function PartDrawing({ part, broken = [], width = 200 }) {
  const height = (width * 140) / 200;
  const paint = (id, normal) => (broken.includes(id) ? BROKEN : normal);

  return (
    <Svg width={width} height={height} viewBox="0 0 200 140">
      {DRAWINGS[part](paint)}
    </Svg>
  );
}
