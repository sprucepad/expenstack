export function createTranslate<
  const T extends Record<PropertyKey, Record<PropertyKey, string>>,
>(locale: string | undefined, table: T): (key: keyof T[keyof T]) => string {
  return (key) => table[locale!][key];
}
