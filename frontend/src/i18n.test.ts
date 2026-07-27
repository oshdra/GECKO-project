import { describe, it, expect, beforeEach } from 'vitest';
import { t, setLanguage, getLanguage, toggleLanguage, subscribe } from './i18n';

describe('i18n translation module', () => {
  beforeEach(() => {
    setLanguage('en');
  });

  it('defaults to English and resolves simple keys', () => {
    expect(getLanguage()).toBe('en');
    expect(t('app.title')).toBe('GECKO');
  });

  it('switches to Spanish and translates keys', () => {
    setLanguage('es');
    expect(getLanguage()).toBe('es');
    expect(t('nav.home')).toBe('Biblioteca');
    expect(t('detail.backBtn')).toBe('← Volver a la Biblioteca');
  });

  it('toggles language back and forth', () => {
    expect(getLanguage()).toBe('en');
    toggleLanguage();
    expect(getLanguage()).toBe('es');
    toggleLanguage();
    expect(getLanguage()).toBe('en');
  });

  it('replaces placeholder parameters correctly', () => {
    const resEn = t('home.lastModified', { date: 'Jan 15, 2026' });
    expect(resEn).toBe('Updated Jan 15, 2026');

    setLanguage('es');
    const resEs = t('home.lastModified', { date: '15 ene 2026' });
    expect(resEs).toBe('Actualizado 15 ene 2026');
  });

  it('notifies subscribers on language change', () => {
    let called = false;
    const unsubscribe = subscribe(() => {
      called = true;
    });

    setLanguage('es');
    expect(called).toBe(true);
    unsubscribe();
  });

  it('returns key string if translation is missing in both locales', () => {
    expect(t('nonexistent.key.path')).toBe('nonexistent.key.path');
  });
});
