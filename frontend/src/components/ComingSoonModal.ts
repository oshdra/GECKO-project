import { t } from '../i18n';

export class ComingSoonModal {
  private overlay: HTMLElement;

  constructor() {
    this.overlay = document.createElement('div');
    this.overlay.className = 'modal-overlay';
  }

  public show(concept: string) {
    this.overlay.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <h3>${t('comingSoon.title')}</h3>
          <button class="btn btn-secondary btn-icon close-btn">&times;</button>
        </div>
        <div class="modal-body">
          <p><strong>Concept:</strong> "${escapeHtml(concept)}"</p>
          <p>${t('comingSoon.message')}</p>
        </div>
        <div style="text-align: right;">
          <button class="btn btn-primary close-btn">${t('comingSoon.close')}</button>
        </div>
      </div>
    `;

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

function escapeHtml(str: string): string {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
