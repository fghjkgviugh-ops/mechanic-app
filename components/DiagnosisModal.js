// components/DiagnosisModal.js — вікно "Діагностика", яке відкривається після вибору поломки.
// Зверху — машина власника, нижче — колонка категорій: двигун, ходова, колеса, електрика, кузов.
// Натисни на категорію — побачиш основні фактори зверху, малюнок і список пунктів.

import { useEffect, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import CarIcon from './CarIcon';
import PartDrawing from './PartDrawing';
import Photo from './Photo';
import { owner } from '../data/owner';
import {
  categories,
  categoryOrder,
  detailingOptions,
  problemDetails,
  relevantCategories,
  towAccess,
} from '../data/diagnosis';

export default function DiagnosisModal({ visible, problem, onClose }) {
  // selected — id категорії, яку відкрито зараз. null — показуємо колонку категорій.
  const [selected, setSelected] = useState(null);

  // Що зламано для цієї поломки. Для невідомого тексту це порожньо.
  const broken = problemDetails[problem] ?? {};
  const known = problem in problemDetails;

  // Тільки категорії, пов'язані з поломкою. Якщо така одна — відкриваємо її одразу.
  const relevant = relevantCategories(problem);
  const autoId = relevant.length === 1 ? relevant[0] : null;
  useEffect(() => {
    if (visible) setSelected(autoId);
  }, [visible, autoId]);

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
                {(relevant.length ? relevant : categoryOrder).map((id) => {
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

// Категорії, для яких є фото (решта малюється схемою з PartDrawing)
const PHOTO_CATEGORIES = ['engine', 'chassis', 'electric', 'body'];

// Малюнок категорії в колонці
function CategoryIcon({ categoryId, broken, width }) {
  if (PHOTO_CATEGORIES.includes(categoryId)) return <Photo name={categoryId} width={width} />;
  return <PartDrawing part={categoryId} broken={broken} width={width} />;
}

// Екран однієї категорії: основні фактори зверху, далі малюнок, пункти і (для коліс) евакуатор
function CategoryDetail({ categoryId, broken, onBack, onClose }) {
  const cat = categories[categoryId];
  const list = broken[categoryId] ?? [];
  // Для детейлінгу: як обслужити (приїзд майстра або виїзд до майстерні)
  const [service, setService] = useState(detailingOptions[0].id);
  const chosen = detailingOptions.find((o) => o.id === service);

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
        {/* Основні фактори: що найчастіше буває з цією частиною */}
        <View style={styles.factors}>
          <Text style={styles.factorsTitle}>Основні фактори</Text>
          {cat.factors.map((factor) => (
            <View key={factor} style={styles.factorRow}>
              <View style={styles.factorDot} />
              <Text style={styles.factorText}>{factor}</Text>
            </View>
          ))}
        </View>

        {categoryId === 'detailing' && (
          <View style={styles.service}>
            <Text style={styles.factorsTitle}>Як обслужити</Text>
            <View style={styles.segment}>
              {detailingOptions.map((option) => {
                const on = service === option.id;
                return (
                  <Pressable
                    key={option.id}
                    onPress={() => setService(option.id)}
                    style={[styles.segBtn, on && styles.segBtnOn]}
                  >
                    <Text style={[styles.segText, on && styles.segTextOn]}>{option.title}</Text>
                  </Pressable>
                );
              })}
            </View>
            <Text style={styles.serviceText}>{chosen.text}</Text>
          </View>
        )}

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

        {cat.tow && <TowCard />}
      </ScrollView>
    </View>
  );
}

// Картка евакуатора внизу. Кнопка працює лише тоді, коли є доступ до служби.
function TowCard() {
  const available = towAccess;

  return (
    <View style={styles.tow}>
      <Text style={styles.towTitle}>Евакуатор</Text>
      <Text style={styles.towText}>
        Щоб викликати евакуатор з застосунку, потрібен доступ до служби евакуатора.
      </Text>
      <Pressable
        disabled={!available}
        style={[styles.towButton, !available && styles.towButtonOff]}
        onPress={() => {
          // Тут буде виклик евакуатора, коли підключимо службу
        }}
      >
        <Text style={[styles.towButtonText, !available && styles.towButtonTextOff]}>
          {available ? 'Викликати евакуатор' : 'Немає доступу до евакуатора'}
        </Text>
      </Pressable>
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
  factors: { backgroundColor: '#fff', borderRadius: 16, padding: 14, gap: 9 },
  factorsTitle: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    color: '#8e8e93',
  },
  factorRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  factorDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#0a7aff' },
  factorText: { flex: 1, fontSize: 15, color: '#111' },
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
  service: { backgroundColor: '#fff', borderRadius: 16, padding: 14, gap: 10 },
  segment: { flexDirection: 'row', gap: 8 },
  segBtn: { flex: 1, backgroundColor: '#f2f2f7', borderRadius: 12, padding: 11, alignItems: 'center' },
  segBtnOn: { backgroundColor: '#111' },
  segText: { fontSize: 14, fontWeight: '600', color: '#111', textAlign: 'center' },
  segTextOn: { color: '#fff' },
  serviceText: { fontSize: 14, lineHeight: 20, color: '#6b7280' },
  tow: { backgroundColor: '#fff', borderRadius: 16, padding: 14, gap: 8 },
  towTitle: { fontSize: 16, fontWeight: '700', color: '#111' },
  towText: { fontSize: 14, lineHeight: 20, color: '#6b7280' },
  towButton: { backgroundColor: '#0a7aff', borderRadius: 12, padding: 13, alignItems: 'center' },
  towButtonOff: { backgroundColor: '#d1d1d6' },
  towButtonText: { fontSize: 15, fontWeight: '600', color: '#fff' },
  towButtonTextOff: { color: '#8e8e93' },
});
