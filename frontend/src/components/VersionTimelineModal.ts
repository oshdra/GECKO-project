import { fetchSimulatorTimeline, TimelineItem } from '../api/client';
import { t } from '../i18n';

export class VersionTimelineModal {
  private overlay: HTMLElement;
  private simulatorId: string;
  private simulatorName: string;
  private onSelectVersion: (ver: number) => void;

  constructor(
    simulatorId: string,
    simulatorName: string,
    onSelectVersion: (ver: number) => void
  ) {
    this.overlay = document.createElement('div');
    this.overlay.className = 'modal-overlay';
    this.simulatorId = simulatorId;
    this.simulatorName = simulatorName;
    this.onSelectVersion = onSelectVersion;
  }

  public async show() {
    this.overlay.innerHTML = `
      <div class="modal-content timeline-modal-content">
        <div class="modal-header">
          <div>
            <h3>${t('timeline.title')}</h3>
            <p class="help-text" style="margin-top: 0.2rem;">${escapeHtml(this.simulatorName)}</p>
          </div>
          <button class="btn btn-secondary btn-icon close-btn">&times;</button>
        </div>
        <div class="modal-body timeline-body">
          <div class="loading-state">${t('thinking')}</div>
        </div>
      </div>
    `;

    const bodyEl = this.overlay.querySelector<HTMLElement>('.timeline-body')!;
    const closeBtns = this.overlay.querySelectorAll('.close-btn');
    closeBtns.forEach((btn) => btn.addEventListener('click', () => this.hide()));

    this.overlay.addEventListener('click', (e) => {
      if (e.target === this.overlay) this.hide();
    });

    document.body.appendChild(this.overlay);

    try {
      const items: TimelineItem[] = await fetchSimulatorTimeline(this.simulatorId);
      this.renderTimelineItems(bodyEl, items);
    } catch (err) {
      console.error('Error fetching timeline:', err);
      bodyEl.innerHTML = `<div class="empty-state">Failed to load timeline.</div>`;
    }
  }

  private renderTimelineItems(container: HTMLElement, items: TimelineItem[]) {
    container.innerHTML = '';

    if (!items || items.length === 0) {
      container.innerHTML = `<div class="empty-state">${t('timeline.noChanges')}</div>`;
      return;
    }

    const list = document.createElement('div');
    list.className = 'timeline-tree';

    items.forEach((item) => {
      const node = document.createElement('div');
      node.className = 'timeline-node';

      const hasDiffs =
        Object.keys(item.diff.added || {}).length > 0 ||
        Object.keys(item.diff.changed || {}).length > 0 ||
        Object.keys(item.diff.removed || {}).length > 0;

      let diffHtml = '';
      if (hasDiffs) {
        let addedRows = '';
        Object.entries(item.diff.added || {}).forEach(([k, v]) => {
          addedRows += `<div class="diff-line diff-added"><span>+ ${escapeHtml(k)}:</span> <code>${escapeHtml(JSON.stringify(v))}</code></div>`;
        });

        let changedRows = '';
        Object.entries(item.diff.changed || {}).forEach(([k, ch]) => {
          changedRows += `<div class="diff-line diff-changed"><span>~ ${escapeHtml(k)}:</span> <code>${escapeHtml(JSON.stringify(ch.from))} → ${escapeHtml(JSON.stringify(ch.to))}</code></div>`;
        });

        let removedRows = '';
        Object.entries(item.diff.removed || {}).forEach(([k, v]) => {
          removedRows += `<div class="diff-line diff-removed"><span>- ${escapeHtml(k)}:</span> <code>${escapeHtml(JSON.stringify(v))}</code></div>`;
        });

        diffHtml = `
          <details class="timeline-diff-drawer">
            <summary>${t('timeline.diffTitle')}</summary>
            <div class="diff-content">
              ${addedRows}
              ${changedRows}
              ${removedRows}
            </div>
          </details>
        `;
      } else {
        diffHtml = `<div class="timeline-no-diff">${t('timeline.noChanges')}</div>`;
      }

      node.innerHTML = `
        <div class="timeline-marker">
          <span class="version-badge">v${item.version}</span>
        </div>
        <div class="timeline-card">
          <div class="timeline-card-header">
            <h4>${t('timeline.versionLabel', { version: item.version })}</h4>
            <span class="timeline-date">${item.date ? new Date(item.date).toLocaleDateString() : ''}</span>
          </div>
          <p class="timeline-summary">${escapeHtml(item.summary)}</p>
          ${diffHtml}
          <div class="timeline-actions">
            <button class="btn btn-secondary preview-ver-btn">${t('timeline.previewVersion', { version: item.version })}</button>
          </div>
        </div>
      `;

      node.querySelector('.preview-ver-btn')?.addEventListener('click', () => {
        this.onSelectVersion(item.version);
        this.hide();
      });

      list.appendChild(node);
    });

    container.appendChild(list);
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
