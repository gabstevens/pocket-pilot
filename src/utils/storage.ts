export const safeParse = <T>(key: string, fallback: T): T => {
  const item = localStorage.getItem(key);
  if (!item) return fallback;
  try {
    return JSON.parse(item) as T;
  } catch (e) {
    console.error(`Error parsing localStorage key "${key}":`, e);
    return fallback;
  }
};
