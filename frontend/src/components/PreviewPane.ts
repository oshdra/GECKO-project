import { SimulatorDetailData, getSimulatorHtmlUrl, fetchSimulator } from '../api/client';
import { ChatPanel } from './ChatPanel';
import { VersionTimelineModal } from './VersionTimelineModal';
import { t } from '../i18n';

export class PreviewPane {
  private container: HTMLElement;
  private simulator: SimulatorDetailData;
  private currentVersion: number;
  private onBack: () => void;
  private chatPanel: ChatPanel | null = null;
  private selectEl: HTMLSelectElement | null = null;
  private iframeWrapperEl: HTMLElement | null = null;
  private openLinkEl: HTMLAnchorElement | null = null;

  constructor(simulator: SimulatorDetailData, onBack: () => void) {
    this.container = document.createElement('div');
    this.container.className = 'detail-container';
    this.simulator = simulator;
    this.currentVersion = this.extractVersionNumber(simulator.latest_version || simulator.versions[simulator.versions.length - 1] || 1);
    this.onBack = onBack;
  }

  private extractVersionNumber(val: any): number {
    if (typeof val === 'number') return val;
    const match = String(val).match(/v?(\d+)/i);
    return match ? parseInt(match[1], 10) : 1;
  }

  public render(): HTMLElement {
    this.container.innerHTML = '';

    // Detail Header
    const header = document.createElement('div');
    header.className = 'detail-header';

    const headerLeft = document.createElement('div');
    headerLeft.className = 'detail-header-left';

    const backBtn = document.createElement('button');
    backBtn.className = 'btn btn-secondary';
    backBtn.textContent = t('detail.backBtn');
    backBtn.addEventListener('click', () => this.onBack());

    const title = document.createElement('h2');
    title.className = 'detail-title';
    title.textContent = this.simulator.name;

    headerLeft.appendChild(backBtn);
    headerLeft.appendChild(title);
    header.appendChild(headerLeft);

    this.container.appendChild(header);

    // Split Layout Container (Preview on Left, Chat on Right)
    const splitLayout = document.createElement('div');
    splitLayout.className = 'detail-split-layout';

    // Left Column: Preview Frame Container
    const previewContainer = document.createElement('div');
    previewContainer.className = 'preview-container';

    // Toolbar
    const toolbar = document.createElement('div');
    toolbar.className = 'preview-toolbar';

    const versionSelectWrapper = document.createElement('div');
    versionSelectWrapper.className = 'version-selector';
    versionSelectWrapper.innerHTML = `<label>${t('detail.versions')}:</label>`;

    this.selectEl = document.createElement('select');
    this.renderVersionOptions();

    this.selectEl.addEventListener('change', (e) => {
      const selectedVer = parseInt((e.target as HTMLSelectElement).value, 10);
      this.currentVersion = selectedVer;
      if (this.iframeWrapperEl) {
        this.updateIframe(this.iframeWrapperEl);
      }
      if (this.openLinkEl) {
        this.openLinkEl.href = getSimulatorHtmlUrl(this.simulator.id, this.currentVersion);
      }
    });

    versionSelectWrapper.appendChild(this.selectEl);
    toolbar.appendChild(versionSelectWrapper);

    const toolbarRight = document.createElement('div');
    toolbarRight.style.display = 'flex';
    toolbarRight.style.gap = '0.5rem';

    const timelineBtn = document.createElement('button');
    timelineBtn.className = 'btn btn-secondary';
    timelineBtn.textContent = t('timeline.button');
    timelineBtn.addEventListener('click', () => {
      const modal = new VersionTimelineModal(
        this.simulator.id,
        this.simulator.name,
        (ver: number) => {
          this.currentVersion = ver;
          if (this.selectEl) this.selectEl.value = String(ver);
          if (this.iframeWrapperEl) this.updateIframe(this.iframeWrapperEl);
          if (this.openLinkEl) this.openLinkEl.href = getSimulatorHtmlUrl(this.simulator.id, this.currentVersion);
        }
      );
      modal.show();
    });

    this.openLinkEl = document.createElement('a');
    this.openLinkEl.className = 'btn btn-secondary';
    this.openLinkEl.target = '_blank';
    this.openLinkEl.rel = 'noopener noreferrer';
    this.openLinkEl.href = getSimulatorHtmlUrl(this.simulator.id, this.currentVersion);
    this.openLinkEl.textContent = t('detail.openInBrowser');

    toolbarRight.appendChild(timelineBtn);
    toolbarRight.appendChild(this.openLinkEl);
    toolbar.appendChild(toolbarRight);

    previewContainer.appendChild(toolbar);

    // Iframe Wrapper
    this.iframeWrapperEl = document.createElement('div');
    this.iframeWrapperEl.className = 'preview-iframe-wrapper';
    this.updateIframe(this.iframeWrapperEl);

    previewContainer.appendChild(this.iframeWrapperEl);
    splitLayout.appendChild(previewContainer);

    // Right Column: Chat Panel
    this.chatPanel = new ChatPanel(
      this.simulator.id,
      this.simulator.chat || [],
      (newVersion: number) => this.handleIterationComplete(newVersion)
    );
    splitLayout.appendChild(this.chatPanel.render());

    this.container.appendChild(splitLayout);

    return this.container;
  }

  private renderVersionOptions() {
    if (!this.selectEl) return;
    this.selectEl.innerHTML = '';

    const verNumbers: number[] = [];
    (this.simulator.versions || []).forEach((v) => {
      const num = this.extractVersionNumber(v);
      if (!verNumbers.includes(num)) verNumbers.push(num);
    });

    if (verNumbers.length === 0) verNumbers.push(1);

    verNumbers.sort((a, b) => a - b).forEach((v) => {
      const opt = document.createElement('option');
      opt.value = String(v);
      opt.textContent = t('detail.versionSelect', { version: v });
      if (v === this.currentVersion) {
        opt.selected = true;
      }
      this.selectEl!.appendChild(opt);
    });
  }

  private async handleIterationComplete(newVersion: number) {
    this.currentVersion = newVersion;

    try {
      const updatedSim = await fetchSimulator(this.simulator.id);
      this.simulator = updatedSim;
    } catch (e) {
      console.warn('Failed to re-fetch simulator data after iteration:', e);
      if (!this.simulator.versions.includes(newVersion as any)) {
        this.simulator.versions.push(newVersion as any);
      }
    }

    this.renderVersionOptions();

    if (this.iframeWrapperEl) {
      this.updateIframe(this.iframeWrapperEl);
    }
    if (this.openLinkEl) {
      this.openLinkEl.href = getSimulatorHtmlUrl(this.simulator.id, this.currentVersion);
    }
  }

  private updateIframe(wrapper: HTMLElement) {
    const url = getSimulatorHtmlUrl(this.simulator.id, this.currentVersion);
    wrapper.innerHTML = `
      <iframe
        src="${url}"
        class="preview-iframe"
        title="${escapeHtml(this.simulator.name)}"
        sandbox="allow-scripts allow-same-origin allow-popups allow-forms allow-downloads"
      ></iframe>
    `;
  }
}

function escapeHtml(str: string): string {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
