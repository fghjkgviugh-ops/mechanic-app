// components/DiagnosisModal.js — вікно "Діагностика", яке відкривається після вибору поломки.
// Зверху — машина власника, нижче — колонка категорій: двигун, ходова частина, електрика, кузов.
// Натисни на категорію — побачиш її малюнок і список пунктів (зламані позначені червоним).

import { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import CarIcon from './CarIcon';
import PartDrawing from './PartDrawing';
import Photo from './Photo';
import { owner } from '../data/owner';
import { categories, categoryOrder, problemDetails } from '../data/diagnosis';

export default function DiagnosisModal({ visible, problem, onClose }) {
  // selected — id категорії, яку відкрито зараз. null — показуємо колонку категорій.
  const [selected, setSelected] = useState(null);

  // Що зламано для цієї поломки. Для невідомого тексту це порожньо.
  const broken = problemDetails[problem] ?? {};
  const known = problem in problemDetails;

  function close() {
    setSelected(null); // наступного разу відкриється головний екран
    onClose();
  }

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={close}>
      <View style={styles.screen}>
        {selected ? (
          <CategoryDetail
            categoryId={selected}
            broken={broken}
            onBack={() => setSelected(null)}
            onClose={close}
          />
        ) : (
          <View style={styles.flex}>
            <View style={styles.header}>
              <Text style={styles.title}>Діагностика</Text>
              <Pressable onPress={close} hitSlop={10}>
                <Text style={styles.link}>Закрити</Text>
              </Pressable>
            </View>

            <ScrollView contentContainerStyle={styles.body}>
              <View style={styles.carCard}>
                <CarIcon width={200} />
                <Text style={styles.muted}>
                  {owner.car.make} {owner.car.model} · {owner.car.year} · {owner.car.color}
                </Text>
              </View>

              {!known && (
                <Text style={styles.note}>
                  Для «{problem}» я не знаю, що перевіряти. Обери типову поломку зверху.
                </Text>
              )}

              {/* Колонка: іконка зліва, назва і стан справа */}
              <View style={styles.column}>
                {categoryOrder.map((id) => {
                  const cat = categories[id];
                  const list = broken[id] ?? [];
                  const bad = list.length > 0;
                  return (
                    <Pressable
                      key={id} // унікальна мітка елемента списку
                      onPress={() => setSelected(id)}
                      style={[styles.row, bad && styles.rowBad]}
                    >
                      <View style={styles.rowIcon}>
                        <CategoryIcon categoryId={id} broken={list} width={92} />
                      </View>
                      <View style={styles.rowText}>
                        <Text style={styles.rowTitle}>{cat.title}</Text>
                        <Text style={bad ? styles.rowBadText : styles.rowSub}>
                          {bad ? `Пунктів: ${list.length}` : 'Без змін'}
                        </Text>
                      </View>
                      <Text style={styles.chevron}>›</Text>
                    </Pressable>
                  );
                })}
              </View>
            </ScrollView>
          </View>
        )}
      </View>
    </Modal>
  );
}

// Малюнок категорії: для кузова — машина, для решти — схеми з PartDrawing
// Категорії, для яких є фото (решта малюється схемою)
const PHOTO_CATEGORIES = ['engine', 'chassis', 'electric', 'body'];

function CategoryIcon({ categoryId, broken, width }) {
  if (PHOTO_CATEGORIES.includes(categoryId)) return <Photo name={categoryId} width={width} />;
  return <PartDrawing part={categoryId} broken={broken} width={width} />;
}

// Екран однієї категорії: великий малюнок і список пунктів (параметрів)
function CategoryDetail({ categoryId, broken, onBack, onClose }) {
  const cat = categories[categoryId];
  const list = broken[categoryId] ?? [];

  return (
    <View style={styles.flex}>
      <View style={styles.header}>
        <Pressable onPress={onBack} hitSlop={10}>
          <Text style={styles.link}>‹ Назад</Text>
        </Pressable>
        <Text style={styles.title}>{cat.title}</Text>
        <Pressable onPress={onClose} hitSlop={10}>
          <Text style={styles.link}>Закрити</Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.body}>
        <View style={styles.bigCard}>
          {PHOTO_CATEGORIES.includes(categoryId) ? (
            <Photo name={categoryId} width={300} />
          ) : (
            <PartDrawing part={categoryId} broken={list} width={300} />
          )}
        </View>

        <Text style={list.length ? styles.bad : styles.note}>
          {list.length ? 'Позначені пункти показані червоним.' : 'За цією поломкою тут нічого не знайдено.'}
        </Text>

        <View style={styles.list}>
          {cat.items.map((item) => {
            const isBad = list.includes(item.id);
            return (
              <View key={item.id} style={styles.itemRow}>
                <View style={[styles.swatch, isBad && { backgroundColor: '#e5322d' }]} />
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={[styles.status, isBad && styles.statusBad]}>
                  {isBad ? cat.badLabel : cat.okLabel}
                </Text>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#f2f2f7', paddingTop: 16 },
  flex: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  title: { fontSize: 18, fontWeight: '700', color: '#111' },
  link: { fontSize: 16, color: '#0a7aff', fontWeight: '500' },
  body: { padding: 16, gap: 14, paddingBottom: 40 },
  carCard: { backgroundColor: '#fff', borderRadius: 18, padding: 16, alignItems: 'center', gap: 6 },
  muted: { fontSize: 14, color: '#6b7280' },
  note: {
    fontSize: 14,
    lineHeight: 20,
    color: '#3c3c43',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
  },
  bad: {
    fontSize: 14,
    lineHeight: 20,
    color: '#b42318',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    fontWeight: '500',
  },
  column: { gap: 10 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 10,
    paddingRight: 14,
  },
  rowBad: { borderWidth: 1.5, borderColor: '#e5322d' },
  rowIcon: { width: 96, alignItems: 'center', justifyContent: 'center' },
  rowText: { flex: 1, gap: 3 },
  rowTitle: { fontSize: 16, fontWeight: '600', color: '#111' },
  rowSub: { fontSize: 13, color: '#8e8e93' },
  rowBadText: { fontSize: 13, color: '#b42318', fontWeight: '600' },
  chevron: { fontSize: 24, color: '#c7c7cc' },
  bigCard: { backgroundColor: '#fff', borderRadius: 18, padding: 16, alignItems: 'center' },
  list: { backgroundColor: '#fff', borderRadius: 16, overflow: 'hidden' },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 13,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#e0e0e4',
  },
  swatch: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#c9ced6' },
  itemName: { flex: 1, fontSize: 15, color: '#111' },
  status: { fontSize: 13, color: '#8e8e93', flexShrink: 0 },
  statusBad: { color: '#b42318', fontWeight: '600' },
});
