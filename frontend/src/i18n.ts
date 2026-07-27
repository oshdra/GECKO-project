import en from './locales/en.json';
import es from './locales/es.json';

export type Language = 'en' | 'es';

type LocaleDict = typeof en;

const dictionaries: Record<Language, LocaleDict> = {
  en,
  es,
};

let currentLanguage: Language = 'en';
const listeners: Array<() => void> = [];

export function getLanguage(): Language {
  return currentLanguage;
}

export function setLanguage(lang: Language): void {
  if (lang !== currentLanguage && (lang === 'en' || lang === 'es')) {
    currentLanguage = lang;
    notify();
  }
}

export function toggleLanguage(): Language {
  const nextLang: Language = currentLanguage === 'en' ? 'es' : 'en';
  setLanguage(nextLang);
  return nextLang;
}

export function subscribe(listener: () => void): () => void {
  listeners.push(listener);
  return () => {
    const index = listeners.indexOf(listener);
    if (index > -1) {
      listeners.splice(index, 1);
    }
  };
}

function notify(): void {
  listeners.forEach((fn) => fn());
}

export function t(path: string, params?: Record<string, string | number>): string {
  const keys = path.split('.');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let current: any = dictionaries[currentLanguage];

  for (const key of keys) {
    if (current && typeof current === 'object' && key in current) {
      current = current[key];
    } else {
      // Fallback to English if missing in current locale
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let fallback: any = dictionaries.en;
      for (const fk of keys) {
        if (fallback && typeof fallback === 'object' && fk in fallback) {
          fallback = fallback[fk];
        } else {
          return path;
        }
      }
      current = fallback;
      break;
    }
  }

  if (typeof current !== 'string') {
    return path;
  }

  let result = current;
  if (params) {
    Object.entries(params).forEach(([paramKey, value]) => {
      result = result.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), String(value));
    });
  }

  return result;
}
