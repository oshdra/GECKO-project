import { t } from '../i18n';

export class NewSimulatorInput {
  private container: HTMLElement;
  private onGenerate: (concept: string) => void;

  constructor(onGenerate: (concept: string) => void) {
    this.container = document.createElement('div');
    this.container.className = 'hero-banner';
    this.onGenerate = onGenerate;
  }

  public render(): HTMLElement {
    this.container.innerHTML = `
      <div class="hero-mascot-wrapper">
        <img src="/assets/gecko-hero.png" alt="Pilot Gecko Mascot" class="hero-mascot-img" />
      </div>
      <h2>${t('app.subtitle')}</h2>
      <p>${t('app.tagline')}</p>
      <form class="prompt-container">
        <input
          type="text"
          class="prompt-input"
          placeholder="${t('home.inputPlaceholder')}"
          required
        />
        <button type="submit" class="btn btn-primary">
          ${t('home.generateBtn')}
        </button>
      </form>
    `;

    const form = this.container.querySelector('form')!;
    const input = this.container.querySelector('input')!;

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const val = input.value.trim();
      if (val) {
        this.onGenerate(val);
      }
    });

    return this.container;
  }
}
