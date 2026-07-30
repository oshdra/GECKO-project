import './styles/main.css';
import { subscribe, t } from './i18n';
import { createLanguageToggle } from './components/LanguageToggle';
import { SettingsModal } from './components/SettingsModal';
import { HomePage } from './pages/Home';
import { SimulatorDetailPage } from './pages/SimulatorDetail';

type ViewState =
  | { type: 'home' }
  | { type: 'detail'; id: string };

class App {
  private appRoot: HTMLElement;
  private currentView: ViewState = { type: 'home' };
  private settingsModal = new SettingsModal();


  constructor(root: HTMLElement) {
    this.appRoot = root;
    subscribe(() => this.render());
  }

  public init() {
    this.render();
  }

  private setView(view: ViewState) {
    this.currentView = view;
    this.render();
  }

  private render() {
    this.appRoot.innerHTML = '';

    // Header
    const header = document.createElement('header');
    header.className = 'app-header';

    const brand = document.createElement('div');
    brand.className = 'app-brand';
    brand.innerHTML = `
      <div class="app-logo-icon">
        <img src="/assets/gecko-hero.png" alt="GECKO Logo" class="brand-avatar-img" />
      </div>
      <div class="app-title-group">
        <h1>${t('app.title')}</h1>
        <p>${t('app.subtitle')}</p>
      </div>
    `;
    brand.addEventListener('click', () => this.setView({ type: 'home' }));
    header.appendChild(brand);

    const navActions = document.createElement('div');
    navActions.className = 'nav-actions';

    // Settings Button
    const settingsBtn = document.createElement('button');
    settingsBtn.className = 'btn btn-secondary';
    settingsBtn.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="3"></circle>
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
      </svg>
      <span>${t('nav.settings')}</span>
    `;
    settingsBtn.addEventListener('click', () => this.settingsModal.show());
    navActions.appendChild(settingsBtn);

    // Language Toggle
    const langToggle = createLanguageToggle(() => this.render());
    navActions.appendChild(langToggle);

    header.appendChild(navActions);
    this.appRoot.appendChild(header);

    // Main Content
    const main = document.createElement('main');
    main.className = 'main-content';

    if (this.currentView.type === 'home') {
      const homePage = new HomePage((id) => this.setView({ type: 'detail', id }));
      main.appendChild(homePage.render());
    } else {
      const detailPage = new SimulatorDetailPage(
        this.currentView.id,
        () => this.setView({ type: 'home' })
      );
      main.appendChild(detailPage.render());
    }

    this.appRoot.appendChild(main);
  }
}

const root = document.getElementById('app');
if (root) {
  const app = new App(root);
  app.init();
}
