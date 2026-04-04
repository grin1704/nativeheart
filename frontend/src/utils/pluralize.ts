/**
 * Склонение русских существительных в зависимости от числа
 * @param count - количество
 * @param one - форма для 1 (например, "воспоминание")
 * @param few - форма для 2-4 (например, "воспоминания")
 * @param many - форма для 5+ (например, "воспоминаний")
 * @returns правильная форма слова
 */
export function pluralize(count: number, one: string, few: string, many: string): string {
  const absCount = Math.abs(count);
  const lastDigit = absCount % 10;
  const lastTwoDigits = absCount % 100;

  // Исключения для 11-14
  if (lastTwoDigits >= 11 && lastTwoDigits <= 14) {
    return many;
  }

  // 1, 21, 31, ... (кроме 11)
  if (lastDigit === 1) {
    return one;
  }

  // 2-4, 22-24, 32-34, ... (кроме 12-14)
  if (lastDigit >= 2 && lastDigit <= 4) {
    return few;
  }

  // 0, 5-20, 25-30, ...
  return many;
}

/**
 * Форматирует количество с правильным склонением
 * @param count - количество
 * @param one - форма для 1
 * @param few - форма для 2-4
 * @param many - форма для 5+
 * @returns строка вида "3 воспоминания"
 */
export function formatCount(count: number, one: string, few: string, many: string): string {
  return `${count} ${pluralize(count, one, few, many)}`;
}

// Готовые функции для часто используемых слов
export const pluralizePhoto = (count: number) => pluralize(count, 'фото', 'фото', 'фото');
export const pluralizeMemory = (count: number) => pluralize(count, 'воспоминание', 'воспоминания', 'воспоминаний');
export const pluralizeTribute = (count: number) => pluralize(count, 'отзыв', 'отзыва', 'отзывов');
export const pluralizePage = (count: number) => pluralize(count, 'страница', 'страницы', 'страниц');
