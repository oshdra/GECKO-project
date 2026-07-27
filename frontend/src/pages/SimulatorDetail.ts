import { fetchSimulator, SimulatorDetailData } from '../api/client';
import { PreviewPane } from '../components/PreviewPane';
import { t } from '../i18n';

export class SimulatorDetailPage {
  private container: HTMLElement;
  private simulatorId: string;
  private onBack: () => void;

  constructor(simulatorId: string, onBack: () => void) {
    this.container = document.createElement('div');
    this.container.className = 'simulator-detail-page';
    this.simulatorId = simulatorId;
    this.onBack = onBack;
  }

  public render(): HTMLElement {
    this.container.innerHTML = `<div class="empty-state">Loading simulator...</div>`;
    this.loadData();
    return this.container;
  }

  private async loadData() {
    try {
      const data: SimulatorDetailData = await fetchSimulator(this.simulatorId);
      const previewPane = new PreviewPane(data, this.onBack);
      this.container.innerHTML = '';
      this.container.appendChild(previewPane.render());
    } catch (err) {
      console.error('Error loading simulator detail:', err);
      this.container.innerHTML = `
        <div class="empty-state">
          <p>Failed to load simulator "${escapeHtml(this.simulatorId)}".</p>
          <button class="btn btn-secondary back-btn">${t('detail.backBtn')}</button>
        </div>
      `;
      this.container.querySelector('.back-btn')?.addEventListener('click', () => this.onBack());
    }
  }
}

function escapeHtml(str: string): string {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
