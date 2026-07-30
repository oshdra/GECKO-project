import { fetchSettings, updateSettings, fetchProfile, updateProfile } from '../api/client';
import { getLanguage, setLanguage, t } from '../i18n';

export class SettingsModal {
  private overlay: HTMLElement;
  private onSavedCallback?: () => void;

  constructor(onSaved?: () => void) {
    this.overlay = document.createElement('div');
    this.overlay.className = 'modal-overlay';
    this.onSavedCallback = onSaved;
  }

  public async show() {
    const currentLang = getLanguage();

    this.overlay.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <h3>${t('settings.title')}</h3>
          <button class="btn btn-secondary btn-icon close-btn">&times;</button>
        </div>
        <form class="modal-body">
          <div class="form-group">
            <label for="user-alias">${t('settings.aliasLabel')}</label>
            <input
              type="text"
              id="user-alias"
              placeholder="${t('settings.aliasPlaceholder')}"
            />
          </div>

          <div class="form-group">
            <label for="avatar-color">${t('settings.avatarColorLabel')}</label>
            <div style="display: flex; align-items: center; gap: 0.75rem;">
              <input type="color" id="avatar-color" value="#00e5ff" style="width: 44px; height: 38px; padding: 2px; cursor: pointer; border: 1px solid var(--border-subtle); border-radius: var(--radius-sm);" />
              <span class="color-val-code" style="font-size: 0.85rem; color: var(--text-muted); font-family: monospace;">#00e5ff</span>
            </div>
          </div>

          <div class="form-group">
            <label for="pref-language">${t('settings.prefLangLabel')}</label>
            <select id="pref-language" class="form-select" style="background: var(--bg-surface); color: var(--text-main); border: 1px solid var(--border-subtle); padding: 0.6rem; border-radius: var(--radius-md);">
              <option value="en" ${currentLang === 'en' ? 'selected' : ''}>English (EN)</option>
              <option value="es" ${currentLang === 'es' ? 'selected' : ''}>Español (ES)</option>
            </select>
          </div>

          <div class="form-group" style="margin-top: 1.25rem; border-top: 1px solid var(--border-subtle); padding-top: 1rem;">
            <label for="gemini-key">${t('settings.apiKeyLabel')}</label>
            <input
              type="password"
              id="gemini-key"
              placeholder="${t('settings.apiKeyPlaceholder')}"
              autocomplete="off"
            />
            <span class="help-text">${t('settings.apiKeyHelp')}</span>
          </div>

          <div class="status-message" style="margin-top: 0.5rem; font-size: 0.85rem;"></div>

          <div style="margin-top: 1.5rem; display: flex; justify-content: flex-end; gap: 0.5rem;">
            <button type="button" class="btn btn-secondary close-btn">${t('settings.closeBtn')}</button>
            <button type="submit" class="btn btn-primary">${t('settings.saveBtn')}</button>
          </div>
        </form>
      </div>
    `;

    const aliasInput = this.overlay.querySelector<HTMLInputElement>('#user-alias')!;
    const colorInput = this.overlay.querySelector<HTMLInputElement>('#avatar-color')!;
    const colorCodeText = this.overlay.querySelector<HTMLElement>('.color-val-code')!;
    const langSelect = this.overlay.querySelector<HTMLSelectElement>('#pref-language')!;
    const apiKeyInput = this.overlay.querySelector<HTMLInputElement>('#gemini-key')!;
    const statusMsg = this.overlay.querySelector<HTMLElement>('.status-message')!;
    const form = this.overlay.querySelector<HTMLFormElement>('form')!;

    colorInput.addEventListener('input', () => {
      colorCodeText.textContent = colorInput.value;
    });

    try {
      const profile = await fetchProfile();
      if (profile.alias) aliasInput.value = profile.alias;
      if (profile.avatar_color) {
        colorInput.value = profile.avatar_color;
        colorCodeText.textContent = profile.avatar_color;
      }
      if (profile.language) {
        langSelect.value = profile.language;
      }
    } catch (e) {
      console.warn('Failed to load profile:', e);
    }

    try {
      const settingsData = await fetchSettings();
      if (settingsData.gemini_api_key) {
        apiKeyInput.value = settingsData.gemini_api_key;
      }
    } catch (err) {
      console.warn('Failed to load settings:', err);
    }

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      statusMsg.textContent = '';
      statusMsg.style.color = '';

      try {
        const selectedLang = langSelect.value as 'en' | 'es';

        await updateProfile({
          alias: aliasInput.value.trim(),
          avatar_color: colorInput.value,
          language: selectedLang,
        });

        await updateSettings({
          gemini_api_key: apiKeyInput.value.trim(),
          language: selectedLang,
        });

        if (getLanguage() !== selectedLang) {
          setLanguage(selectedLang);
        }

        statusMsg.textContent = t('settings.savedMsg');
        statusMsg.style.color = '#10b981';

        if (this.onSavedCallback) {
          this.onSavedCallback();
        }

        setTimeout(() => this.hide(), 1000);
      } catch (err) {
        statusMsg.textContent = t('settings.errorMsg');
        statusMsg.style.color = '#ef4444';
      }
    });

    const closeBtns = this.overlay.querySelectorAll('.close-btn');
    closeBtns.forEach((btn) => {
      btn.addEventListener('click', () => this.hide());
    });

    this.overlay.addEventListener('click', (e) => {
      if (e.target === this.overlay) {
        this.hide();
      }
    });

    document.body.appendChild(this.overlay);
  }

  public hide() {
    if (this.overlay.parentNode) {
      this.overlay.parentNode.removeChild(this.overlay);
    }
  }
}
