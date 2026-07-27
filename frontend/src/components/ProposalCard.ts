import { ConceptProposal } from '../api/client';
import { createProgressStepper } from './ProgressStepper';

export class ProposalCard {
  private container: HTMLElement;
  private proposal: ConceptProposal;
  private onApprove: () => void;
  private onModify: () => void;

  constructor(
    proposal: ConceptProposal,
    onApprove: () => void,
    onModify: () => void
  ) {
    this.container = document.createElement('div');
    this.container.className = 'proposal-card-container';
    this.proposal = proposal;
    this.onApprove = onApprove;
    this.onModify = onModify;
  }

  public render(): HTMLElement {
    this.container.innerHTML = '';

    // Stepper
    const stepper = createProgressStepper(1, { 1: 'done', 2: 'pending', 3: 'pending', 4: 'pending' });
    this.container.appendChild(stepper);

    // Main Proposal Card Surface
    const cardSurface = document.createElement('div');
    cardSurface.className = 'proposal-card-surface';

    const agentsRows = (this.proposal.agents || [])
      .map(
        (a) => `
        <tr>
          <td><strong>${escapeHtml(a.name)}</strong></td>
          <td><code>${escapeHtml((a.attributes || []).join(', '))}</code></td>
          <td>${escapeHtml((a.behaviors || []).join(', '))}</td>
        </tr>
      `
      )
      .join('');

    const envAttrs = ((this.proposal.environment && this.proposal.environment.attributes) || []).join(', ');

    const interactionsList = (this.proposal.interactions || [])
      .map((i) => `<li><code>${escapeHtml(i.trigger)}</code> → ${escapeHtml(i.effect)}</li>`)
      .join('');

    cardSurface.innerHTML = `
      <div class="proposal-header">
        <div class="proposal-title-group">
          <span class="proposal-badge">${escapeHtml(this.proposal.domain || 'Physics')}</span>
          <span class="lib-badge">${escapeHtml(this.proposal.rendering_library || 'three.js')}</span>
          <h2>${escapeHtml(this.proposal.concept_name)}</h2>
        </div>
      </div>

      <p class="proposal-summary">${escapeHtml(this.proposal.summary)}</p>

      <div class="proposal-section">
        <h3>Agents Model</h3>
        <table class="proposal-table">
          <thead>
            <tr>
              <th>Agent Name</th>
              <th>Attributes</th>
              <th>Behaviors</th>
            </tr>
          </thead>
          <tbody>
            ${agentsRows}
          </tbody>
        </table>
      </div>

      <div class="proposal-grid-two">
        <div class="proposal-section">
          <h3>Environment Specification</h3>
          <ul class="proposal-list">
            <li><strong>Type:</strong> ${escapeHtml(this.proposal.environment?.type || '3D')}</li>
            <li><strong>Physics Model:</strong> ${escapeHtml(this.proposal.environment?.physics || 'Default')}</li>
            <li><strong>Attributes:</strong> <code>${escapeHtml(envAttrs)}</code></li>
          </ul>
        </div>

        <div class="proposal-section">
          <h3>User Interactions</h3>
          <ul class="proposal-list">
            ${interactionsList}
          </ul>
        </div>
      </div>

      <div class="proposal-section">
        <h3>Visualization & UI Plan</h3>
        <p>${escapeHtml(this.proposal.visualization_plan)}</p>
      </div>

      <details class="spec-drawer">
        <summary>View Draft Spec YAML</summary>
        <pre><code>${escapeHtml(this.proposal.spec_draft_yaml || '')}</code></pre>
      </details>

      <div class="proposal-actions">
        <button class="btn btn-secondary modify-btn">Request Modifications</button>
        <button class="btn btn-primary approve-btn">Approve & Generate HTML →</button>
      </div>
    `;

    cardSurface.querySelector('.approve-btn')?.addEventListener('click', () => this.onApprove());
    cardSurface.querySelector('.modify-btn')?.addEventListener('click', () => this.onModify());

    this.container.appendChild(cardSurface);
    return this.container;
  }
}

function escapeHtml(str: string): string {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
