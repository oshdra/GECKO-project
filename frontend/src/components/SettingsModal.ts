import { fetchSettings, updateSettings } from '../api/client';
import { t } from '../i18n';

export class SettingsModal {
  private overlay: HTMLElement;

  constructor() {
    this.overlay = document.createElement('div');
    this.overlay.className = 'modal-overlay';
  }

  public async show() {
    this.overlay.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <h3>${t('settings.title')}</h3>
          <button class="btn btn-secondary btn-icon close-btn">&times;</button>
        </div>
        <form class="modal-body">
          <div class="form-group">
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

    const input = this.overlay.querySelector<HTMLInputElement>('#gemini-key')!;
    const statusMsg = this.overlay.querySelector<HTMLElement>('.status-message')!;
    const form = this.overlay.querySelector<HTMLFormElement>('form')!;

    try {
      const settings = await fetchSettings();
      if (settings.gemini_api_key) {
        input.value = settings.gemini_api_key;
      }
    } catch (err) {
      console.warn('Failed to load settings:', err);
    }

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      statusMsg.textContent = '';
      statusMsg.style.color = '';

      try {
        await updateSettings({
          gemini_api_key: input.value.trim(),
        });
        statusMsg.textContent = t('settings.savedMsg');
        statusMsg.style.color = '#10b981';
        setTimeout(() => this.hide(), 1200);
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
