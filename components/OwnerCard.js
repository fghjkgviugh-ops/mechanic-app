// components/OwnerCard.js — картка внизу екрана (як у застосунках таксі):
// номер і модель авто, намальована машинка збоку, поломка і власник.

import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import CarIcon from './CarIcon';

// onLayout передаємо з App.js: так головний екран дізнається висоту картки
// і зсуває центр карти вище, щоб синя крапка не ховалася під карткою.
export default function OwnerCard({ owner, problem, onLayout }) {
  // insets.bottom — висота системної смужки внизу iPhone. Додаємо її як відступ.
  const insets = useSafeAreaInsets();
  const { car } = owner;

  // Ініціали для кружечка-аватара: "Олександр Коваль" → "ОК"
  const initials = owner.name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2);

  return (
    <View style={[styles.card, { paddingBottom: 16 + insets.bottom }]} onLayout={onLayout}>
      {/* Сіра "ручка" зверху — підказує, що це панель поверх карти */}
      <View style={styles.handle} />

      {/* Верхній рядок: дані авто зліва, машинка справа */}
      <View style={styles.carRow}>
        <View style={styles.carInfo}>
          <View style={styles.plate}>
            <Text style={styles.plateText}>{car.plate}</Text>
          </View>
          <Text style={styles.carName}>
            {car.make} {car.model} · {car.year}
          </Text>
          <Text style={styles.muted}>{car.color}</Text>
        </View>
        <CarIcon width={150} />
      </View>

      {/* Якщо вказали поломку — показуємо її червоною плашкою */}
      {problem ? (
        <View style={styles.problem}>
          <Text style={styles.problemLabel}>Поломка:</Text>
          <Text style={styles.problemText} numberOfLines={2}>
            {problem}
          </Text>
        </View>
      ) : null}

      <View style={styles.divider} />

      {/* Нижній рядок: власник */}
      <View style={styles.ownerRow}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
        <View>
          <Text style={styles.ownerName}>{owner.name}</Text>
          <Text style={styles.muted}>{owner.role}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 10,
    gap: 14,
    // Тінь (iOS) і "висота" (Android), щоб картка ніби лежала над картою
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: -4 },
    elevation: 12,
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#d4d4d8',
  },
  carRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  carInfo: { flexShrink: 1, gap: 4 },
  plate: {
    alignSelf: 'flex-start',
    borderWidth: 1.5,
    borderColor: '#111',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginBottom: 2,
  },
  plateText: { fontSize: 17, fontWeight: '700', letterSpacing: 1, color: '#111' },
  carName: { fontSize: 16, fontWeight: '600', color: '#111' },
  muted: { fontSize: 14, color: '#6b7280' },
  problem: {
    flexDirection: 'row',
    gap: 6,
    backgroundColor: '#fdecec',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  problemLabel: { fontSize: 14, fontWeight: '600', color: '#b42318' },
  problemText: { flex: 1, fontSize: 14, color: '#b42318' },
  divider: { height: StyleSheet.hairlineWidth, backgroundColor: '#e4e4e7' },
  ownerRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#e8f0fe',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: 16, fontWeight: '700', color: '#1a56db' },
  ownerName: { fontSize: 16, fontWeight: '600', color: '#111' },
});
