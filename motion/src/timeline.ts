// All times are seconds in the SOURCE video (IG-9-RUS.mp4), taken from word timings.
// *word* in a title marks the accent word.
export const FPS = 30;
export const SOURCE_FRAMES = 2236;
// Dynamic edit drops "Привет, друзья!" and starts on the scene cut at 0.833 s.
export const DYNAMIC_TRIM = 25;

export type Kind =
  | 'battery' | 'days' | 'neq' | 'tabs' | 'cpu' | 'check' | 'load'
  | 'toggle' | 'steps' | 'flow' | 'chips' | 'head' | 'cpuDrop' | 'cta';

export type Cue = {at: number; to: number; title: string; kind: Kind; ev: number[]; items?: string[]};

export const cues: Cue[] = [
  {at: 0, to: 4.75, title: 'Устали *после* выходных?', kind: 'battery', ev: [0.3, 3.4]},
  {at: 4.75, to: 8.0, title: 'Даже *+2 дня* не хватит', kind: 'days', ev: [4.9, 5.92, 7.3]},
  {at: 8.0, to: 12.55, title: 'Перестать работать *≠* отключиться', kind: 'neq', ev: [8.32, 9.92, 11.6]},
  {at: 12.55, to: 17.35, title: 'Как *вкладки* в компьютере', kind: 'tabs', ev: [13.02, 14.72, 16.06]},
  {at: 17.35, to: 20.5, title: 'Экран чистый, а *процессор*…', kind: 'cpu', ev: [17.44, 18.76, 19.3]},
  {
    at: 20.5, to: 29.0, title: 'Проверьте себя', kind: 'check', ev: [21.88, 24.42, 27.4],
    items: ['Час без сообщений — сможете?', 'Вина, когда ничего не делаете?', 'Отпуск превращается в проект?'],
  },
  {at: 29.0, to: 36.0, title: 'Если это *знакомо*…', kind: 'load', ev: [31.3, 32.44, 33.5]},
  {at: 36.0, to: 39.85, title: 'Психике нужен *сигнал*', kind: 'toggle', ev: [36.5, 38.9]},
  {
    at: 39.85, to: 52.3, title: 'Попробуйте *вот что*', kind: 'steps', ev: [41.12, 44.44, 48.06, 49.42, 50.66],
    items: ['Дела — на бумагу', 'План на завтра', 'Смените одежду', 'Примите душ', 'Другая комната'],
  },
  {at: 52.3, to: 55.3, title: 'Спокойствие приходит *после*', kind: 'flow', ev: [52.6, 53.84, 54.3]},
  {at: 55.3, to: 59.9, title: 'Поэтому:', kind: 'chips', ev: [55.78, 57.3, 58.26], items: ['гулять', 'книга', 'друг']},
  {at: 59.9, to: 66.4, title: 'Когда голова *понимает*', kind: 'head', ev: [60.06, 61.46, 63.62, 65.4]},
  {at: 66.4, to: 70.45, title: 'Процессор *отдыхает*', kind: 'cpuDrop', ev: [66.98, 69.0]},
  {at: 70.45, to: SOURCE_FRAMES / FPS, title: 'Попробуйте *неделю*', kind: 'cta', ev: [70.6, 71.68]},
];

// Sentence starts: the dynamic edit alternates punch-in framing on these.
export const sentenceStarts = [
  0.96, 4.84, 8.06, 12.62, 14.72, 17.44, 20.6, 24.42, 27.4, 29.08, 33.1, 36.08, 39.88, 41.12,
  46.02, 49.42, 52.4, 55.34, 59.94, 62.6, 66.46, 70.48, 71.68,
];
