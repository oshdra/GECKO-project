export function getDomainIconHtml(domain: string): string {
  const normalized = (domain || '').toLowerCase().trim();

  const domainImageMap: Record<string, string> = {
    physics: '/assets/gecko-physics.png',
    astronomy: '/assets/gecko-astronomy.png',
    sound: '/assets/gecko-sound.png',
    acoustics: '/assets/gecko-sound.png',
    biology: '/assets/gecko-biology.png',
    genetics: '/assets/gecko-biology.png',
  };

  if (normalized in domainImageMap) {
    return `<img src="${domainImageMap[normalized]}" alt="${escapeHtml(domain)}" class="domain-mascot-img" />`;
  }

  return getDomainIconSvg(normalized);
}

export function getDomainIconSvg(domain: string): string {
  const normalized = (domain || '').toLowerCase().trim();

  switch (normalized) {
    case 'physics':
      return `<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="3"></circle>
        <ellipse cx="12" cy="12" rx="9" ry="4" transform="rotate(30 12 12)"></ellipse>
        <ellipse cx="12" cy="12" rx="9" ry="4" transform="rotate(-30 12 12)"></ellipse>
      </svg>`;

    case 'biology':
      return `<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M2 15c6.667-6 13.333 0 20-6"></path>
        <path d="M2 9c6.667 6 13.333 0 20 6"></path>
        <path d="M7 12v3"></path>
        <path d="M12 9.5v5"></path>
        <path d="M17 12v3"></path>
      </svg>`;

    case 'economics':
      return `<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <line x1="12" y1="1" x2="12" y2="23"></line>
        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
      </svg>`;

    case 'mathematics':
    case 'math':
      return `<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M4 19L19 4"></path>
        <path d="M7 7h.01"></path>
        <path d="M17 17h.01"></path>
        <path d="M5 12h14"></path>
        <path d="M12 5v14"></path>
      </svg>`;

    case 'cs':
    case 'computer science':
      return `<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="16 18 22 12 16 6"></polyline>
        <polyline points="8 6 2 12 8 18"></polyline>
      </svg>`;

    default:
      return `<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
        <path d="M2 17l10 5 10-5"></path>
        <path d="M2 12l10 5 10-5"></path>
      </svg>`;
  }
}

function escapeHtml(str: string): string {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
