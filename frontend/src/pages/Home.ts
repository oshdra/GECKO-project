import { fetchSimulators, generateProposalSse, generateFullSimulatorSse, SimulatorSummary, ConceptProposal } from '../api/client';
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
  private currentConcept: string = '';

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
    this.currentConcept = concept;
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
      (approvedProposal) => {
        this.handleApproveProposal(approvedProposal);
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

  private async handleApproveProposal(proposal: ConceptProposal) {
    this.proposalContainer.innerHTML = '';

    const stepStates: Record<number, 'pending' | 'running' | 'done' | 'error'> = {
      1: 'done',
      2: 'pending',
      3: 'pending',
      4: 'pending',
    };

    const cardContainer = document.createElement('div');
    cardContainer.className = 'proposal-card-container';

    let stepperElem = createProgressStepper(2, stepStates);
    cardContainer.appendChild(stepperElem);

    const statusMsg = document.createElement('div');
    statusMsg.className = 'empty-state';
    statusMsg.innerHTML = `<p>Designing visualization layout for <strong>"${escapeHtml(proposal.concept_name)}"</strong>...</p>`;
    cardContainer.appendChild(statusMsg);

    this.proposalContainer.appendChild(cardContainer);
    cardContainer.scrollIntoView({ behavior: 'smooth' });

    const updateStepper = (currentStep: number) => {
      stepperElem.replaceWith(createProgressStepper(currentStep, stepStates));
      stepperElem = cardContainer.querySelector('.progress-stepper') as HTMLElement;
    };

    try {
      await generateFullSimulatorSse(proposal, this.currentConcept, async (event) => {
        if (event.status === 'running') {
          stepStates[event.step] = 'running';
          updateStepper(event.step);
          if (event.message) {
            statusMsg.innerHTML = `<p>${escapeHtml(event.message)}</p>`;
          }
        } else if (event.status === 'done') {
          stepStates[event.step] = 'done';
          updateStepper(event.step);

          if (event.step === 4 && event.simulator_id) {
            statusMsg.innerHTML = `
              <div style="text-align: center; padding: 1rem 0;">
                <h3 style="color: var(--accent-emerald); margin-bottom: 0.5rem;">🎉 Simulator Generated Successfully!</h3>
                <p style="margin-bottom: 1.5rem;">Saved to <code>simulators/${escapeHtml(event.simulator_id)}/v1.html</code></p>
                <button class="btn btn-primary open-sim-btn">Open Simulator Preview →</button>
              </div>
            `;
            await this.loadData();

            statusMsg.querySelector('.open-sim-btn')?.addEventListener('click', () => {
              this.onSelectSimulator(event.simulator_id!);
            });
          }
        } else if (event.status === 'error') {
          stepStates[event.step] = 'error';
          updateStepper(event.step);
          statusMsg.innerHTML = `<p style="color: var(--accent-rose)">Generation error: ${escapeHtml(event.error || 'Failed to complete step')}</p>`;
        }
      });
    } catch (err: any) {
      statusMsg.innerHTML = `<p style="color: var(--accent-rose)">Connection error during generation: ${escapeHtml(err?.message || String(err))}</p>`;
    }
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

