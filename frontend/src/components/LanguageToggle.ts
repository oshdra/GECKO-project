import { getLanguage, toggleLanguage, t } from '../i18n';

export function createLanguageToggle(onToggle: () => void): HTMLElement {
  const btn = document.createElement('button');
  btn.className = 'btn btn-secondary';
  btn.setAttribute('aria-label', 'Toggle Language');

  const updateText = () => {
    const lang = getLanguage();
    btn.textContent = lang === 'en' ? 'ES 🌐' : 'EN 🌐';
  };

  updateText();

  btn.addEventListener('click', () => {
    toggleLanguage();
    updateText();
    onToggle();
  });

  return btn;
}
