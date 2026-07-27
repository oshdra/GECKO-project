import { fetchSimulators, generateProposalSse, SimulatorSummary, ConceptProposal } from '../api/client';
import { NewSimulatorInput } from '../components/NewSimulatorInput';
import { SimulatorGrid } from '../components/SimulatorGrid';
import { ProposalCard } from '../components/ProposalCard';
import { createProgressStepper } from '../components/ProgressStepper';

export class HomePage {
  private container: HTMLElement;
  private onSelectSimulator: (id: string) => void;
  private grid: SimulatorGrid;
  private proposalContainer: HTMLElement;
  private mainGridWrapper: HTMLElement;
  private currentProposal: ConceptProposal | null = null;

  constructor(onSelectSimulator: (id: string) => void) {
    this.container = document.createElement('div');
    this.container.className = 'home-page';
    this.onSelectSimulator = onSelectSimulator;

    this.grid = new SimulatorGrid(this.onSelectSimulator);
    this.proposalContainer = document.createElement('div');
    this.proposalContainer.className = 'proposal-active-container';
    this.mainGridWrapper = document.createElement('div');
  }

  public render(): HTMLElement {
    this.container.innerHTML = '';

    const hero = new NewSimulatorInput((concept) => this.handleGenerate(concept));
    this.container.appendChild(hero.render());

    this.container.appendChild(this.proposalContainer);

    this.mainGridWrapper.appendChild(this.grid.render());
    this.container.appendChild(this.mainGridWrapper);

    this.loadData();

    return this.container;
  }

  private async handleGenerate(concept: string) {
    this.proposalContainer.innerHTML = '';
    const loadingStepper = createProgressStepper(1, { 1: 'running', 2: 'pending', 3: 'pending', 4: 'pending' });
    
    const loadingCard = document.createElement('div');
    loadingCard.className = 'proposal-card-container';
    loadingCard.appendChild(loadingStepper);

    const statusMsg = document.createElement('div');
    statusMsg.className = 'empty-state';
    statusMsg.innerHTML = `<p>Analyzing concept: <strong>"${escapeHtml(concept)}"</strong>...</p>`;
    loadingCard.appendChild(statusMsg);

    this.proposalContainer.appendChild(loadingCard);
    this.proposalContainer.scrollIntoView({ behavior: 'smooth' });

    try {
      await generateProposalSse(concept, (event) => {
        if (event.step === 1 && event.status === 'done' && event.proposal) {
          this.currentProposal = event.proposal;
          this.renderProposalCard();
        } else if (event.status === 'error') {
          statusMsg.innerHTML = `<p style="color: var(--accent-rose)">Error generating proposal: ${escapeHtml(event.error || 'Unknown error')}</p>`;
        }
      });
    } catch (err: any) {
      statusMsg.innerHTML = `<p style="color: var(--accent-rose)">Failed to connect to AI pipeline endpoint: ${escapeHtml(err?.message || String(err))}</p>`;
    }
  }

  private renderProposalCard() {
    if (!this.currentProposal) return;
    this.proposalContainer.innerHTML = '';

    const card = new ProposalCard(
      this.currentProposal,
      () => {
        alert("Phase 5 deliverable: Full HTML generation starts after proposal approval!");
      },
      () => {
        const input = document.querySelector<HTMLInputElement>('.prompt-input');
        if (input) {
          input.focus();
        }
      }
    );

    this.proposalContainer.appendChild(card.render());
  }

  public async loadData() {
    try {
      const simulators: SimulatorSummary[] = await fetchSimulators();
      this.grid.setSimulators(simulators);
    } catch (err) {
      console.error('Error loading simulators:', err);
    }
  }
}

function escapeHtml(str: string): string {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
