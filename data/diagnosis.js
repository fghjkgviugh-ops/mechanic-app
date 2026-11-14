// data/diagnosis.js — категорії авто, їхні пункти і те, що зламано для кожної поломки.
// Це приклад: справжня діагностика потребує реальних даних або механіка.

// Категорії в колонці (у цьому порядку)
export const categoryOrder = ['engine', 'chassis', 'electric', 'body'];

// Кожна категорія: назва, підписи статусів і список пунктів.
// id — внутрішня мітка, name — текст, який бачить людина.
export const categories = {
  engine: {
    title: 'Двигун',
    badLabel: 'Зламано',
    okLabel: 'Не виявлено',
    items: [
      { id: 'spark', name: 'Свічки запалювання' },
      { id: 'belt', name: 'Ремінь ГРМ' },
      { id: 'oil', name: 'Масляний фільтр' },
      { id: 'pump', name: 'Помпа охолодження' },
      { id: 'radiator', name: 'Радіатор' },
      { id: 'thermostat', name: 'Термостат' },
    ],
  },
  chassis: {
    title: 'Ходова частина',
    badLabel: 'Зламано',
    okLabel: 'Не виявлено',
    items: [
      { id: 'tire', name: 'Шина' },
      { id: 'rim', name: 'Диск колеса' },
      { id: 'hub', name: 'Ступиця' },
      { id: 'disc', name: 'Гальмівний диск' },
      { id: 'pads', name: 'Гальмівні колодки' },
    ],
  },
  electric: {
    title: 'Електрика',
    badLabel: 'Зламано',
    okLabel: 'Не виявлено',
    items: [
      { id: 'terminals', name: 'Клеми' },
      { id: 'battery', name: 'Сам акумулятор' },
      { id: 'alternator', name: 'Генератор' },
    ],
  },
  body: {
    title: 'Кузов',
    badLabel: 'Потрібно зробити',
    okLabel: 'Не потрібно',
    items: [
      { id: 'dents', name: "Виправлення вм'ятин" },
      { id: 'sanding', name: 'Шліфування кузова під фарбу' },
      { id: 'paint', name: 'Фарбування елементів кузова' },
    ],
  },
};

// Яка поломка → що зламано (ключ — категорія, значення — список id її пунктів).
// Текст, який ти написав сам, тут не знайдеться, і тоді нічого не підсвічується.
export const problemDetails = {
  'Не заводиться': { engine: ['spark'], electric: ['terminals', 'battery'] },
  Акумулятор: { electric: ['battery', 'alternator'] },
  'Колесо / шина': { chassis: ['tire'] },
  Гальма: { chassis: ['pads', 'disc'] },
  Двигун: { engine: ['belt', 'spark'] },
  Перегрів: { engine: ['radiator', 'thermostat', 'pump'] },
  Кузов: { body: ['dents', 'sanding'] },
  Інше: {},
};
