import { SimulatorSummary } from '../api/client';
import { createSimulatorCard } from './SimulatorCard';
import { t } from '../i18n';

export class SimulatorGrid {
  private container: HTMLElement;
  private simulators: SimulatorSummary[] = [];
  private onSelectSimulator: (id: string) => void;
  private selectedDomain: string = 'all';
  private selectedTag: string = 'all';
  private searchQuery: string = '';

  constructor(onSelectSimulator: (id: string) => void) {
    this.container = document.createElement('div');
    this.onSelectSimulator = onSelectSimulator;
  }

  public setSimulators(simulators: SimulatorSummary[]) {
    this.simulators = simulators;
    this.render();
  }

  public render(): HTMLElement {
    this.container.innerHTML = '';

    // Collect unique domains and tags
    const domains = Array.from(
      new Set(this.simulators.map((s) => (s.domain || 'other').toLowerCase()))
    );

    const allTags = Array.from(
      new Set(this.simulators.flatMap((s) => s.tags || []))
    ).filter(Boolean);

    // Main Filter Bar
    const filterBar = document.createElement('div');
    filterBar.className = 'filter-bar';

    // Domain Tabs
    const tabsContainer = document.createElement('div');
    tabsContainer.className = 'domain-tabs';

    const allTab = document.createElement('button');
    allTab.className = `domain-tab ${this.selectedDomain === 'all' ? 'active' : ''}`;
    allTab.textContent = t('home.filterAll');
    allTab.addEventListener('click', () => {
      this.selectedDomain = 'all';
      this.render();
    });
    tabsContainer.appendChild(allTab);

    domains.forEach((dom) => {
      const tab = document.createElement('button');
      tab.className = `domain-tab ${this.selectedDomain === dom ? 'active' : ''}`;
      tab.textContent = dom.charAt(0).toUpperCase() + dom.slice(1);
      tab.addEventListener('click', () => {
        this.selectedDomain = dom;
        this.render();
      });
      tabsContainer.appendChild(tab);
    });

    filterBar.appendChild(tabsContainer);

    // Search input
    const searchBox = document.createElement('div');
    searchBox.className = 'search-box';
    searchBox.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="11" cy="11" r="8"></circle>
        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
      </svg>
      <input type="text" placeholder="${t('home.searchSimulators')}" value="${escapeHtml(this.searchQuery)}" />
    `;

    const searchInput = searchBox.querySelector('input')!;
    searchInput.addEventListener('input', (e) => {
      this.searchQuery = (e.target as HTMLInputElement).value;
      this.renderGridOnly(gridContainer);
    });

    filterBar.appendChild(searchBox);
    this.container.appendChild(filterBar);

    // Tags Bar (if tags exist)
    if (allTags.length > 0) {
      const tagsBar = document.createElement('div');
      tagsBar.className = 'tags-filter-bar';

      const tagLabel = document.createElement('span');
      tagLabel.className = 'tags-filter-label';
      tagLabel.textContent = `${t('detail.tags')}:`;
      tagsBar.appendChild(tagLabel);

      const allTagBtn = document.createElement('button');
      allTagBtn.className = `tag-chip-btn ${this.selectedTag === 'all' ? 'active' : ''}`;
      allTagBtn.textContent = 'All Tags';
      allTagBtn.addEventListener('click', () => {
        this.selectedTag = 'all';
        this.render();
      });
      tagsBar.appendChild(allTagBtn);

      allTags.forEach((tag) => {
        const btn = document.createElement('button');
        btn.className = `tag-chip-btn ${this.selectedTag === tag ? 'active' : ''}`;
        btn.textContent = `#${tag}`;
        btn.addEventListener('click', () => {
          this.selectedTag = this.selectedTag === tag ? 'all' : tag;
          this.render();
        });
        tagsBar.appendChild(btn);
      });

      this.container.appendChild(tagsBar);
    }

    // Grid container
    const gridContainer = document.createElement('div');
    gridContainer.className = 'simulator-grid';
    this.container.appendChild(gridContainer);

    this.renderGridOnly(gridContainer);

    return this.container;
  }

  private renderGridOnly(gridContainer: HTMLElement) {
    gridContainer.innerHTML = '';

    const filtered = this.simulators.filter((sim) => {
      const matchesDomain =
        this.selectedDomain === 'all' ||
        (sim.domain || 'other').toLowerCase() === this.selectedDomain;

      const matchesTag =
        this.selectedTag === 'all' ||
        (sim.tags || []).includes(this.selectedTag);

      const q = this.searchQuery.toLowerCase().trim();
      const matchesQuery =
        !q ||
        sim.name.toLowerCase().includes(q) ||
        (sim.domain || '').toLowerCase().includes(q) ||
        (sim.tags || []).some((t) => t.toLowerCase().includes(q));

      return matchesDomain && matchesTag && matchesQuery;
    });

    if (filtered.length === 0) {
      gridContainer.innerHTML = `<div class="empty-state">${t('home.emptyState')}</div>`;
      return;
    }

    filtered.forEach((sim) => {
      const card = createSimulatorCard(sim, this.onSelectSimulator);
      gridContainer.appendChild(card);
    });
  }
}

function escapeHtml(str: string): string {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
