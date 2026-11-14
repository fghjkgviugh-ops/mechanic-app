// components/DiagnosisModal.js — вікно "Діагностика", яке відкривається після вибору поломки.
// Зверху — машина власника, нижче — частини авто. Натисни на частину, і побачиш її детально
// та які деталі зламані (вони показані червоним).

import { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import CarIcon from './CarIcon';
import PartDrawing from './PartDrawing';
import { owner } from '../data/owner';
import { parts, partOrder, problemDetails } from '../data/diagnosis';

export default function DiagnosisModal({ visible, problem, onClose }) {
  // selected — id частини, яку відкрито зараз. null — показуємо головний екран із частинами.
  const [selected, setSelected] = useState(null);

  // Зламані деталі для вибраної поломки. Для невідомого тексту це порожньо.
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
          <PartDetail partId={selected} broken={broken} onBack={() => setSelected(null)} onClose={close} />
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
                <CarIcon width={230} />
                <Text style={styles.muted}>
                  {owner.car.make} {owner.car.model} · {owner.car.year} · {owner.car.color}
                </Text>
              </View>

              {!known && (
                <Text style={styles.note}>
                  Для «{problem}» я не знаю, які деталі перевірити. Обери типову поломку зверху.
                </Text>
              )}

              <View style={styles.grid}>
                {partOrder.map((id) => {
                  const list = broken[id] ?? [];
                  return (
                    <Pressable
                      key={id} // унікальна мітка елемента списку
                      onPress={() => setSelected(id)}
                      style={[styles.tile, list.length > 0 && styles.tileBad]}
                    >
                      {list.length > 0 && <View style={styles.dot} />}
                      <PartDrawing part={id} broken={list} width={120} />
                      <Text style={styles.tileText}>{parts[id].title}</Text>
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

// Екран однієї частини: великий малюнок і список її деталей
function PartDetail({ partId, broken, onBack, onClose }) {
  const part = parts[partId];
  const list = broken[partId] ?? [];

  return (
    <View style={styles.flex}>
      <View style={styles.header}>
        <Pressable onPress={onBack} hitSlop={10}>
          <Text style={styles.link}>‹ Назад</Text>
        </Pressable>
        <Text style={styles.title}>{part.title}</Text>
        <Pressable onPress={onClose} hitSlop={10}>
          <Text style={styles.link}>Закрити</Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.body}>
        <View style={styles.bigCard}>
          <PartDrawing part={partId} broken={list} width={300} />
        </View>

        <Text style={list.length ? styles.bad : styles.note}>
          {list.length ? 'Зламані деталі показані червоним.' : 'За цією поломкою тут нічого не знайдено.'}
        </Text>

        <View style={styles.list}>
          {part.details.map((d) => {
            const isBad = list.includes(d.id);
            return (
              <View key={d.id} style={styles.row}>
                <View style={[styles.swatch, isBad && { backgroundColor: '#e5322d' }]} />
                <Text style={styles.rowName}>{d.name}</Text>
                <Text style={[styles.status, isBad && styles.statusBad]}>
                  {isBad ? 'Зламано' : 'Не виявлено'}
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
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 12 },
  tile: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
    gap: 8,
  },
  tileBad: { borderWidth: 1.5, borderColor: '#e5322d' },
  dot: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#e5322d',
  },
  tileText: { fontSize: 14, fontWeight: '600', color: '#111', textAlign: 'center' },
  bigCard: { backgroundColor: '#fff', borderRadius: 18, padding: 16, alignItems: 'center' },
  list: { backgroundColor: '#fff', borderRadius: 16, overflow: 'hidden' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 13,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#e0e0e4',
  },
  swatch: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#c9ced6' },
  rowName: { flex: 1, fontSize: 15, color: '#111' },
  status: { fontSize: 13, color: '#8e8e93' },
  statusBad: { color: '#b42318', fontWeight: '600' },
});
