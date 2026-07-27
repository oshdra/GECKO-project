export interface ProgressStep {
  number: number;
  label: string;
  status: 'pending' | 'running' | 'done' | 'error';
}

export function createProgressStepper(activeStep: number, stepStatuses: Record<number, 'pending' | 'running' | 'done' | 'error'>): HTMLElement {
  const container = document.createElement('div');
  container.className = 'progress-stepper';

  const steps: ProgressStep[] = [
    { number: 1, label: '1. Concept Modeling', status: stepStatuses[1] || 'pending' },
    { number: 2, label: '2. Visualization Design', status: stepStatuses[2] || 'pending' },
    { number: 3, label: '3. Physics & Logic Model', status: stepStatuses[3] || 'pending' },
    { number: 4, label: '4. HTML Generation', status: stepStatuses[4] || 'pending' },
  ];

  container.innerHTML = steps
    .map((s) => {
      const isCurrent = s.number === activeStep;
      const statusClass = s.status;
      return `
        <div class="stepper-item ${statusClass} ${isCurrent ? 'current' : ''}">
          <div class="stepper-circle">
            ${s.status === 'done' ? '✓' : s.number}
          </div>
          <span class="stepper-label">${escapeHtml(s.label)}</span>
        </div>
      `;
    })
    .join('<div class="stepper-line"></div>');

  return container;
}

function escapeHtml(str: string): string {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
