// data/diagnosis.js — частини авто, їхні деталі і те, які деталі зламані для кожної поломки.
// Це приклад: справжня діагностика потребує реальних даних або механіка.

// Частини, які показуємо в головному списку (у цьому порядку)
export const partOrder = ['engine', 'battery', 'wheel', 'brakes', 'cooling'];

// Опис кожної частини: назва і список її деталей.
// id — внутрішня мітка, name — текст, який бачить людина.
export const parts = {
  engine: {
    title: 'Двигун',
    details: [
      { id: 'spark', name: 'Свічки запалювання' },
      { id: 'belt', name: 'Ремінь ГРМ' },
      { id: 'oil', name: 'Масляний фільтр' },
      { id: 'pump', name: 'Помпа охолодження' },
    ],
  },
  battery: {
    title: 'Акумулятор',
    details: [
      { id: 'terminals', name: 'Клеми' },
      { id: 'battery', name: 'Сам акумулятор' },
      { id: 'alternator', name: 'Генератор' },
    ],
  },
  wheel: {
    title: 'Колесо / шина',
    details: [
      { id: 'tire', name: 'Шина' },
      { id: 'rim', name: 'Диск' },
      { id: 'hub', name: 'Ступиця' },
    ],
  },
  brakes: {
    title: 'Гальма',
    details: [
      { id: 'pads', name: 'Гальмівні колодки' },
      { id: 'disc', name: 'Гальмівний диск' },
      { id: 'fluid', name: 'Гальмівна рідина' },
    ],
  },
  cooling: {
    title: 'Охолодження',
    details: [
      { id: 'radiator', name: 'Радіатор' },
      { id: 'thermostat', name: 'Термостат' },
    ],
  },
};

// Яка поломка → які деталі зламані (ключ — частина, значення — список id її деталей).
// Текст, який ти написав сам, тут не знайдеться, і тоді нічого не підсвічується.
export const problemDetails = {
  'Не заводиться': { engine: ['spark'], battery: ['terminals', 'battery'] },
  Акумулятор: { battery: ['battery', 'alternator'] },
  'Колесо / шина': { wheel: ['tire'] },
  Гальма: { brakes: ['pads'] },
  Двигун: { engine: ['belt', 'spark'] },
  Перегрів: { cooling: ['radiator', 'thermostat'], engine: ['pump'] },
  Інше: {},
};
