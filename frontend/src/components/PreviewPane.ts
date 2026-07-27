import { SimulatorDetailData, getSimulatorHtmlUrl } from '../api/client';
import { t } from '../i18n';

export class PreviewPane {
  private container: HTMLElement;
  private simulator: SimulatorDetailData;
  private currentVersion: number;
  private onBack: () => void;

  constructor(simulator: SimulatorDetailData, onBack: () => void) {
    this.container = document.createElement('div');
    this.container.className = 'detail-container';
    this.simulator = simulator;
    this.currentVersion = simulator.latest_version;
    this.onBack = onBack;
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

    // Preview Frame Container
    const previewContainer = document.createElement('div');
    previewContainer.className = 'preview-container';

    // Toolbar
    const toolbar = document.createElement('div');
    toolbar.className = 'preview-toolbar';

    const versionSelectWrapper = document.createElement('div');
    versionSelectWrapper.className = 'version-selector';
    versionSelectWrapper.innerHTML = `<label>${t('detail.versions')}:</label>`;

    const select = document.createElement('select');
    this.simulator.versions.forEach((v) => {
      const opt = document.createElement('option');
      opt.value = String(v);
      opt.textContent = t('detail.versionSelect', { version: v });
      if (v === this.currentVersion) {
        opt.selected = true;
      }
      select.appendChild(opt);
    });

    select.addEventListener('change', (e) => {
      const selectedVer = parseInt((e.target as HTMLSelectElement).value, 10);
      this.currentVersion = selectedVer;
      this.updateIframe(iframeWrapper);
    });

    versionSelectWrapper.appendChild(select);
    toolbar.appendChild(versionSelectWrapper);

    const openLink = document.createElement('a');
    openLink.className = 'btn btn-secondary';
    openLink.target = '_blank';
    openLink.rel = 'noopener noreferrer';
    openLink.href = getSimulatorHtmlUrl(this.simulator.id, this.currentVersion);
    openLink.textContent = t('detail.openInBrowser');
    toolbar.appendChild(openLink);

    previewContainer.appendChild(toolbar);

    // Iframe Wrapper
    const iframeWrapper = document.createElement('div');
    iframeWrapper.className = 'preview-iframe-wrapper';
    this.updateIframe(iframeWrapper);

    previewContainer.appendChild(iframeWrapper);
    this.container.appendChild(previewContainer);

    return this.container;
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
