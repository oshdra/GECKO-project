export interface SimulatorSummary {
  id: string;
  name: string;
  domain: string;
  tags: string[];
  versions: number[];
  latest_version: number;
  last_modified: string;
}

export interface GeckoSpecAgent {
  name: string;
  attributes: string[];
  behaviors: string[];
}

export interface GeckoSpecEnvironment {
  type: string;
  physics: string;
  attributes: string[];
}

export interface GeckoSpecInteraction {
  trigger: string;
  effect: string;
}

export interface GeckoSpec {
  name: string;
  version: number;
  created: string;
  modified: string;
  language?: string;
  tags: string[];
  rendering_library?: string;
  agents: GeckoSpecAgent[];
  environment: GeckoSpecEnvironment;
  interactions: GeckoSpecInteraction[];
  exports?: string[];
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  step?: number;
  timestamp: string;
}

export interface SimulatorDetailData {
  id: string;
  name: string;
  domain: string;
  tags: string[];
  versions: number[];
  latest_version: number;
  last_modified: string;
  spec: GeckoSpec;
  narrative?: string;
  chat?: ChatMessage[];
}

export interface SettingsData {
  gemini_api_key?: string;
  default_language?: string;
  language?: string;
}


export interface UserProfile {
  alias: string;
  avatar_color: string;
  language: string;
}

export interface TimelineDiff {
  added: Record<string, any>;
  changed: Record<string, { from: any; to: any }>;
  removed: Record<string, any>;
}

export interface TimelineItem {
  version: number;
  filename: string;
  date: string;
  summary: string;
  frontmatter: Record<string, any>;
  diff: TimelineDiff;
}


export interface ConceptProposal {
  concept_name: string;
  domain: string;
  summary: string;
  rendering_library: string;
  agents: GeckoSpecAgent[];
  environment: GeckoSpecEnvironment;
  interactions: GeckoSpecInteraction[];
  visualization_plan: string;
  spec_draft_yaml: string;
}

export interface GenerateEvent {
  step: number;
  status: 'running' | 'done' | 'error';
  message?: string;
  proposal?: ConceptProposal;
  viz_plan?: Record<string, any>;
  physics_model?: Record<string, any>;
  simulator_id?: string;
  version?: number;
  error?: string;
}

const API_BASE = '/api';

export async function fetchSimulators(): Promise<SimulatorSummary[]> {
  const res = await fetch(`${API_BASE}/simulators`);
  if (!res.ok) {
    throw new Error(`Failed to fetch simulators: ${res.statusText}`);
  }
  return res.json();
}

export async function fetchSimulator(id: string): Promise<SimulatorDetailData> {
  const res = await fetch(`${API_BASE}/simulators/${encodeURIComponent(id)}`);
  if (!res.ok) {
    throw new Error(`Failed to fetch simulator ${id}: ${res.statusText}`);
  }
  return res.json();
}

export async function fetchSettings(): Promise<SettingsData> {
  const res = await fetch(`${API_BASE}/settings`);
  if (!res.ok) {
    throw new Error(`Failed to fetch settings: ${res.statusText}`);
  }
  return res.json();
}

export async function updateSettings(data: SettingsData): Promise<{ status: string }> {
  const res = await fetch(`${API_BASE}/settings`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    throw new Error(`Failed to update settings: ${res.statusText}`);
  }
  return res.json();
}

export function getSimulatorHtmlUrl(id: string, version: number): string {
  return `${API_BASE}/simulators/${encodeURIComponent(id)}/html/${version}`;
}

async function readSseStream(
  res: Response,
  onEvent: (event: GenerateEvent) => void
): Promise<void> {
  const reader = res.body?.getReader();
  if (!reader) {
    throw new Error('Readable stream not available on response body');
  }

  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n\n');
    buffer = lines.pop() || '';

    for (const block of lines) {
      const dataLine = block.split('\n').find((l) => l.startsWith('data: '));
      if (dataLine) {
        const jsonText = dataLine.replace(/^data:\s*/, '').trim();
        if (jsonText) {
          try {
            const ev: GenerateEvent = JSON.parse(jsonText);
            onEvent(ev);
          } catch (e) {
            console.warn('Failed to parse SSE JSON data:', jsonText);
          }
        }
      }
    }
  }
}

export async function generateProposalSse(
  concept: string,
  onEvent: (event: GenerateEvent) => void
): Promise<void> {
  const res = await fetch(`${API_BASE}/generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ concept }),
  });

  if (!res.ok) {
    throw new Error(`Generation endpoint returned HTTP ${res.status}`);
  }

  await readSseStream(res, onEvent);
}

export async function generateFullSimulatorSse(
  proposal: ConceptProposal,
  concept: string,
  onEvent: (event: GenerateEvent) => void
): Promise<void> {
  const res = await fetch(`${API_BASE}/generate/execute`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ proposal, concept }),
  });

  if (!res.ok) {
    throw new Error(`Execute endpoint returned HTTP ${res.status}`);
  }

  await readSseStream(res, onEvent);
}

export async function fetchSimulatorChat(id: string): Promise<ChatMessage[]> {
  const res = await fetch(`${API_BASE}/simulators/${encodeURIComponent(id)}/chat`);
  if (!res.ok) {
    throw new Error(`Failed to fetch chat for simulator ${id}: ${res.statusText}`);
  }
  return res.json();
}

export async function iterateSimulatorSse(
  id: string,
  request: string,
  onEvent: (event: GenerateEvent) => void
): Promise<void> {
  const res = await fetch(`${API_BASE}/simulators/${encodeURIComponent(id)}/iterate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ request }),
  });

  if (!res.ok) {
    throw new Error(`Iteration endpoint returned HTTP ${res.status}`);
  }

  await readSseStream(res, onEvent);
}


export async function fetchProfile(): Promise<UserProfile> {
  const res = await fetch(`${API_BASE}/profile`);
  if (!res.ok) {
    throw new Error(`Failed to fetch profile: ${res.statusText}`);
  }
  return res.json();
}

export async function updateProfile(data: Partial<UserProfile>): Promise<UserProfile> {
  const res = await fetch(`${API_BASE}/profile`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    throw new Error(`Failed to update profile: ${res.statusText}`);
  }
  return res.json();
}

export async function fetchSimulatorTimeline(id: string): Promise<TimelineItem[]> {
  const res = await fetch(`${API_BASE}/simulators/${encodeURIComponent(id)}/timeline`);
  if (!res.ok) {
    throw new Error(`Failed to fetch timeline for simulator ${id}: ${res.statusText}`);
  }
  return res.json();
}



