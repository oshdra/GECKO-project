import { SimulatorSummary } from '../api/client';
import { getDomainIconHtml } from './DomainIcons';
import { t } from '../i18n';

export function createSimulatorCard(
  sim: SimulatorSummary,
  onClick: (id: string) => void
): HTMLElement {
  const card = document.createElement('div');
  card.className = 'simulator-card';
  card.setAttribute('data-id', sim.id);

  const tagsHtml = (sim.tags || [])
    .map((tag) => `<span class="tag-chip">${escapeHtml(tag)}</span>`)
    .join('');

  const versionText =
    sim.versions.length === 1
      ? t('home.versionSingle')
      : t('home.versionCount', { count: sim.versions.length });

  const dateFormatted = formatDate(sim.last_modified);
  const updatedText = t('home.lastModified', { date: dateFormatted });

  card.innerHTML = `
    <div class="card-thumbnail">
      <div class="domain-icon-wrapper">
        ${getDomainIconHtml(sim.domain)}
      </div>
      <span class="domain-badge">${escapeHtml(sim.domain || 'concept')}</span>
    </div>
    <div class="card-body">
      <h3 class="card-title">${escapeHtml(sim.name)}</h3>
      <div class="card-tags">
        ${tagsHtml}
      </div>
      <div class="card-footer">
        <span>${versionText}</span>
        <span>${updatedText}</span>
      </div>
    </div>
  `;

  card.addEventListener('click', () => onClick(sim.id));
  return card;
}

function escapeHtml(str: string): string {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function formatDate(isoString: string): string {
  if (!isoString) return '';
  try {
    const d = new Date(isoString);
    return d.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return isoString;
  }
}
